import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/ids";
import type { Badge, Epass, Festival, Mission, Reward, Vendor } from "@/lib/types";
import { mapEvent, track } from "./helpers";
import { ensureSeed } from "./seed";

export const getParticipantHome = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const hid = "fst_higalaay2026";
    const festivals = await sql.query<Festival>(`select * from festivals where id = $1`, [hid]);
    const me = await sql.query<{ id: string; full_name: string; status: string }>(
      `select id, full_name, status from participants where festival_id = $1 and user_id = $2`,
      [hid, context.userId],
    );
    const participant = me[0] ?? null;
    const epass = participant
      ? (
          await sql.query<Epass>(`select * from epasses where participant_id = $1`, [
            participant.id,
          ])
        )[0]
      : null;
    const events = await sql.query<Record<string, unknown>>(
      `select e.*, v.name as venue_name, c.name as category_name,
              exists(select 1 from event_registrations r where r.event_id = e.id and r.participant_id = $2) as registered
       from events e
       left join venues v on v.id = e.venue_id
       left join event_categories c on c.id = e.category_id
       where e.festival_id = $1 and e.published = true
       order by e.starts_at`,
      [hid, participant?.id ?? ""],
    );
    const missions = await sql.query<Mission>(
      `select m.*, b.name as badge_name from missions m
       left join badges b on b.id = m.badge_id
       where m.festival_id = $1 and m.active = true`,
      [hid],
    );
    const checkins = participant
      ? await sql.query<{ n: number }>(
          `select count(*)::int as n from checkins c
           join epasses ep on ep.id = c.epass_id
           where ep.participant_id = $1 and c.result = 'valid'`,
          [participant.id],
        )
      : [{ n: 0 }];
    const points = participant
      ? await sql.query<{ points: number }>(
          `select points from participant_points where participant_id = $1`,
          [participant.id],
        )
      : [];
    const badges = participant
      ? await sql.query<Badge>(
          `select b.* from participant_badges pb join badges b on b.id = pb.badge_id
           where pb.participant_id = $1`,
          [participant.id],
        )
      : [];
    const vendors = await sql.query<Vendor>(
      `select * from vendors where festival_id = $1 order by booster desc, name`,
      [hid],
    );
    const rewards = await sql.query<Reward>(
      `select * from rewards where festival_id = $1`,
      [hid],
    );
    const offers = await sql.query<{
      id: string;
      title: string;
      description: string;
      code: string;
      vendor_name: string;
    }>(
      `select o.id, o.title, o.description, o.code, v.name as vendor_name
       from offers o join vendors v on v.id = o.vendor_id
       where o.festival_id = $1 and o.active = true`,
      [hid],
    );
    const withProgress = missions.map((m) => {
      const n = checkins[0]?.n ?? 0;
      const progress =
        m.condition_type === "checkins" ? Math.min(m.condition_value, n) : 0;
      return { ...m, progress, completed: progress >= m.condition_value };
    });
    return {
      festival: festivals[0],
      participant,
      epass: epass
        ? { ...epass, issued_at: String(epass.issued_at), expires_at: epass.expires_at ? String(epass.expires_at) : null }
        : null,
      events: events.map((e) => ({ ...mapEvent(e), registered: Boolean(e.registered) })),
      missions: withProgress,
      points: points[0]?.points ?? 0,
      badges,
      vendors,
      rewards,
      offers,
    };
  });

export const registerForEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((eventId: string) => eventId)
  .handler(async ({ context, data: eventId }) => {
    const sql = await getSql();
    const me = await sql.query<{ id: string }>(
      `select id from participants where user_id = $1 limit 1`,
      [context.userId],
    );
    if (!me[0]) throw new Error("Register for the festival first");
    await sql.query(
      `insert into event_registrations (id, event_id, participant_id, status)
       values ($1,$2,$3,'registered') on conflict do nothing`,
      [newId("reg"), eventId, me[0].id],
    );
    const ev = await sql.query<{ festival_id: string }>(`select festival_id from events where id = $1`, [
      eventId,
    ]);
    await track(sql, {
      name: "event_registered",
      festivalId: ev[0]?.festival_id,
      userId: context.userId,
      participantId: me[0].id,
      payload: { eventId },
    });
    return { ok: true };
  });

export const selfCheckIn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((eventId: string) => eventId)
  .handler(async ({ context, data: eventId }) => {
    const sql = await getSql();
    const me = await sql.query<{ id: string }>(
      `select id from participants where user_id = $1 limit 1`,
      [context.userId],
    );
    if (!me[0]) throw new Error("No participant profile");
    const ep = await sql.query<{ id: string }>(
      `select id from epasses where participant_id = $1`,
      [me[0].id],
    );
    if (!ep[0]) throw new Error("No ePASS");
    const existing = await sql.query(
      `select id from checkins where epass_id = $1 and event_id = $2 and result = 'valid'`,
      [ep[0].id, eventId],
    );
    if (existing[0]) return { ok: false as const, reason: "Already checked in" };
    await sql.query(
      `insert into checkins (id, epass_id, event_id, result, reason) values ($1,$2,$3,'valid','self')`,
      [newId("chk"), ep[0].id, eventId],
    );
    await track(sql, {
      name: "checkin_completed",
      userId: context.userId,
      participantId: me[0].id,
      payload: { eventId, mode: "self" },
    });
    return { ok: true as const };
  });

export const castVote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { eventId: string; choice: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await sql.query<{ id: string }>(
      `select id from participants where user_id = $1 limit 1`,
      [context.userId],
    );
    if (!me[0]) throw new Error("No participant profile");
    await sql.query(
      `insert into votes (id, event_id, participant_id, choice) values ($1,$2,$3,$4)
       on conflict (event_id, participant_id) do update set choice = excluded.choice`,
      [newId("vot"), data.eventId, me[0].id, data.choice],
    );
    await track(sql, {
      name: "vote_cast",
      userId: context.userId,
      participantId: me[0].id,
      payload: { choice: data.choice },
    });
    return { ok: true };
  });

export const claimReward = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((rewardId: string) => rewardId)
  .handler(async ({ context, data: rewardId }) => {
    const sql = await getSql();
    const me = await sql.query<{ id: string }>(
      `select id from participants where user_id = $1 limit 1`,
      [context.userId],
    );
    if (!me[0]) throw new Error("No participant profile");
    const reward = await sql.query<{ points_cost: number; inventory: number }>(
      `select points_cost, inventory from rewards where id = $1`,
      [rewardId],
    );
    if (!reward[0] || reward[0].inventory <= 0) throw new Error("Reward unavailable");
    const pts = await sql.query<{ points: number }>(
      `select points from participant_points where participant_id = $1`,
      [me[0].id],
    );
    const have = pts[0]?.points ?? 0;
    if (have < reward[0].points_cost) throw new Error("Not enough points");
    await sql.query(
      `update participant_points set points = points - $1, updated_at = now() where participant_id = $2`,
      [reward[0].points_cost, me[0].id],
    );
    await sql.query(`update rewards set inventory = inventory - 1 where id = $1`, [rewardId]);
    await sql.query(
      `insert into redemptions (id, reward_id, participant_id, status) values ($1,$2,$3,'claimed')`,
      [newId("rdm"), rewardId, me[0].id],
    );
    await track(sql, {
      name: "reward_claimed",
      userId: context.userId,
      participantId: me[0].id,
      payload: { rewardId },
    });
    return { ok: true };
  });

export const issueCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((offerId: string) => offerId)
  .handler(async ({ context, data: offerId }) => {
    const sql = await getSql();
    const me = await sql.query<{ id: string }>(
      `select id from participants where user_id = $1 limit 1`,
      [context.userId],
    );
    if (!me[0]) throw new Error("No participant profile");
    const offer = await sql.query<{ code: string }>(`select code from offers where id = $1`, [
      offerId,
    ]);
    const code = `${offer[0]?.code || "HIGALA"}-${me[0].id.slice(-4).toUpperCase()}`;
    await sql.query(
      `insert into coupons (id, offer_id, participant_id, code, status) values ($1,$2,$3,$4,'issued')`,
      [newId("cpn"), offerId, me[0].id, code],
    );
    await track(sql, {
      name: "coupon_redeemed",
      userId: context.userId,
      participantId: me[0].id,
    });
    return { code };
  });
