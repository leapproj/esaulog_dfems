import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { isoText } from "@/lib/format";
import type { CmsBlock, Festival, FestivalPage, GateAccessKey, Sponsor, Vendor, Venue } from "@/lib/types";
import { mapEvent, track } from "./helpers";
import { ensureSeed } from "./seed";

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensureSeed(sql);
  const festivals = await sql.query<Festival>(
    `select * from festivals order by starts_on`,
  );
  const stats = await sql.query<{
    festivals: number;
    participants: number;
    events: number;
    vendors: number;
    checkins: number;
  }>(
    `select
      (select count(*)::int from festivals) as festivals,
      (select count(*)::int from participants) as participants,
      (select count(*)::int from events) as events,
      (select count(*)::int from vendors) as vendors,
      (select count(*)::int from checkins where result = 'valid') as checkins`,
  );
  const liveEvents = await sql.query<Record<string, unknown>>(
    `select e.*, v.name as venue_name, f.name as festival_name, f.slug as festival_slug
     from events e
     left join venues v on v.id = e.venue_id
     join festivals f on f.id = e.festival_id
     where e.published = true and e.status in ('live','published')
     order by e.starts_at
     limit 6`,
  );
  return {
    festivals,
    stats: stats[0],
    liveEvents: liveEvents.map((r) => ({
      ...mapEvent(r),
      festival_name: String(r.festival_name),
      festival_slug: String(r.festival_slug),
    })),
  };
});

export const getPublicFestival = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const festivals = await sql.query<Festival>(`select * from festivals where slug = $1`, [slug]);
    const festival = festivals[0];
    if (!festival) return null;
    const [pages, events, venues, vendors, sponsors, blocks] = await Promise.all([
      sql.query<FestivalPage>(
        `select * from festival_pages where festival_id = $1 and published = true`,
        [festival.id],
      ),
      sql.query<Record<string, unknown>>(
        `select e.*, v.name as venue_name, c.name as category_name,
                (select count(*)::int from event_registrations r where r.event_id = e.id) as registered_count
         from events e
         left join venues v on v.id = e.venue_id
         left join event_categories c on c.id = e.category_id
         where e.festival_id = $1 and e.published = true
         order by e.starts_at`,
        [festival.id],
      ),
      sql.query<Venue>(`select * from venues where festival_id = $1`, [festival.id]),
      sql.query<Vendor>(`select * from vendors where festival_id = $1`, [festival.id]),
      sql.query<Sponsor>(`select * from sponsors where festival_id = $1`, [festival.id]),
      sql.query<CmsBlock>(
        `select b.* from cms_blocks b
         join festival_pages p on p.id = b.page_id
         where b.festival_id = $1 and b.visible = true and p.published = true
         order by b.sort_order`,
        [festival.id],
      ),
    ]);
    await track(sql, { name: "event_viewed", festivalId: festival.id, payload: { slug } });
    return {
      festival,
      pages,
      events: events.map(mapEvent),
      venues,
      vendors,
      sponsors,
      blocks,
    };
  });

export const getPublicEvent = createServerFn({ method: "GET" })
  .validator((input: { slug: string; eventId: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const rows = await sql.query<Record<string, unknown>>(
      `select e.*, v.name as venue_name, c.name as category_name, f.name as festival_name, f.slug as festival_slug
       from events e
       left join venues v on v.id = e.venue_id
       left join event_categories c on c.id = e.category_id
       join festivals f on f.id = e.festival_id
       where e.id = $1 and f.slug = $2`,
      [data.eventId, data.slug],
    );
    if (!rows[0]) return null;
    return {
      event: mapEvent(rows[0]),
      festival_name: String(rows[0].festival_name),
      festival_slug: String(rows[0].festival_slug),
      starts_at: isoText(rows[0].starts_at),
    };
  });

export const listFestivalCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensureSeed(sql);
  const festivals = await sql.query<Festival>(`select * from festivals order by starts_on`);
  const today = "2026-08-25";
  const live = festivals.filter((f) => f.status === "LIVE");
  const upcoming = festivals.filter((f) => f.status !== "LIVE" && f.starts_on >= today);
  const past = festivals.filter((f) => f.ends_on < today && f.status !== "LIVE");
  const keys = await sql.query<GateAccessKey>(
    `select k.code, k.staff_role, k.festival_id, e.name as event_name, f.name as festival_name, f.slug
     from gate_access_keys k
     join events e on e.id = k.event_id
     join festivals f on f.id = k.festival_id
     where k.active = true
     order by k.code`,
  );
  return { live, upcoming, past, all: festivals, keys };
});

export const getFestivalHub = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const festival = (await sql.query<Festival>(`select * from festivals where slug = $1`, [slug]))[0];
    if (!festival) return null;
    const events = await sql.query<Record<string, unknown>>(
      `select e.*, v.name as venue_name from events e
       left join venues v on v.id = e.venue_id
       where e.festival_id = $1 order by e.starts_at`,
      [festival.id],
    );
    const keys = await sql.query<GateAccessKey>(
      `select k.*, e.name as event_name, g.name as gate_name
       from gate_access_keys k
       join events e on e.id = k.event_id
       left join gates g on g.id = k.gate_id
       where k.festival_id = $1 and k.active = true`,
      [festival.id],
    );
    const sponsors = await sql.query<Sponsor>(`select * from sponsors where festival_id = $1`, [festival.id]);
    const vendors = await sql.query<Vendor>(`select * from vendors where festival_id = $1`, [festival.id]);
    return {
      festival,
      events: events.map(mapEvent),
      keys,
      sponsors,
      vendors,
    };
  });

export const submitPartnerRequest = createServerFn({ method: "POST" })
  .validator((input: {
    slug: string;
    kind: string;
    organization_name: string;
    contact_name: string;
    contact_email: string;
    notes: string;
  }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const f = (await sql.query<{ id: string }>(`select id from festivals where slug = $1`, [data.slug]))[0];
    if (!f) throw new Error("Festival not found");
    const id = (await import("@/lib/ids")).newId("ptr");
    await sql.query(
      `insert into partner_requests (id, festival_id, kind, organization_name, contact_name, contact_email, notes, status)
       values ($1,$2,$3,$4,$5,$6,$7,'pending')`,
      [id, f.id, data.kind, data.organization_name, data.contact_name, data.contact_email, data.notes],
    );
    return { id };
  });
