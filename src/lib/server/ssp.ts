import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { isoText } from "@/lib/format";
import { newId } from "@/lib/ids";
import { hashPass } from "./crypto-pass";
import { sspMiddleware as MW } from "./operator-auth";
import { audit, grantSspOperators, requireSsp } from "./helpers";
import { ensureSeed } from "./seed";

const PLAN_KEYS = [
  { key: "identity", label: "Festival identity & dates" },
  { key: "calendar", label: "Event calendar" },
  { key: "sponsors", label: "Activate sponsors" },
  { key: "cms", label: "Build festival website (CMS)" },
  { key: "participant_portal", label: "Participant portal" },
  { key: "gate_staff", label: "Gate-staff portal" },
  { key: "go_live", label: "Ready to publish" },
];

async function seedPlanning(sql: Sql, festivalId: string) {
  for (const item of PLAN_KEYS) {
    await sql.query(
      `insert into planning_items (id, festival_id, key, label, done) values ($1,$2,$3,$4,$5) on conflict do nothing`,
      [newId("pln"), festivalId, item.key, item.label, item.key === "identity"],
    );
  }
}

export const getSspOverview = createServerFn({ method: "GET" })
  .middleware([MW])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);

    const festivals = (
      await sql.query<any>(`select f.*,
              (select count(*)::int from participants p where p.festival_id = f.id) as participants,
              (select count(*)::int from events e where e.festival_id = f.id) as events,
              (select count(*)::int from checkins c join events e on e.id = c.event_id where e.festival_id = f.id and c.result = 'valid') as checkins,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'physical'),0) as physical,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'digital'),0) as digital,
              p.name as package_name,
              p.slug as package_slug,
              p.kind as package_kind,
              coalesce(cpa.commission_pct, p.commission_pct, 25) as commission_pct,
              cpa.status as copartner_status,
              cpa.notes as copartner_notes
       from festivals f
       left join license_packages p on p.id = f.package_id
       left join copartner_agreements cpa on cpa.festival_id = f.id
       order by f.starts_on`)
    ).map((f: any) => ({
      ...f,
      commission: f.copartner ? Math.round((f.digital * Number(f.commission_pct || 25)) / 100) : 0,
    }));

    const stats = await sql.query<any>(`select
        (select count(*)::int from festivals where status = 'LIVE') as festivals,
        (select count(*)::int from festivals where status in ('SETUP','DRAFT','PLANNING')) as upcoming,
        (select count(*)::int from festivals) as tenants,
        (select count(*)::int from participants) as participants,
        (select count(*)::int from events) as events,
        (select count(*)::int from events where status in ('live','published')) as live_events,
        (select count(*)::int from vendors) as vendors,
        (select count(*)::int from sponsors) as sponsors,
        (select count(*)::int from checkins where result = 'valid') as checkins,
        (select count(*)::int from operator_accounts where kind = 'ssp') as super_admins,
        (select count(*)::int from operator_accounts where kind = 'tenant') as tenant_ops,
        (select count(*)::int from tenant_applications where status = 'pending') as pending_apps,
        (select count(*)::int from festivals where copartner = true) as copartner_tenants,
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'physical'),0) as physical,
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'digital'),0) as digital`);

    const orgs = await sql.query<any>(`select o.*,
              (select count(*)::int from festivals f where f.organization_id = o.id) as festivals
       from organizations o order by name`);

    const operators = await sql.query<any>(`select id, username, kind, display_name, organization_name, contact_email, created_at::text as created_at, last_seen_at::text as last_seen_at
       from operator_accounts order by kind desc, display_name`);

    const members = await sql.query<any>(`select user_id, role, created_at::text as created_at from platform_members order by created_at desc`);

    const auditLogs = await sql.query<any>(`select id, actor_user_id, action, entity, entity_id, created_at::text as created_at
       from audit_logs order by created_at desc limit 16`);

    const apps = await sql.query<any>(`select a.*, a.created_at::text as created_at, p.name as package_name, p.slug as package_slug, p.kind as package_kind
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       order by a.created_at desc limit 12`);

    const events = (await sql.query<any>(`select e.id, e.name, e.starts_at, e.ends_at,
              e.status, e.event_type, e.published, e.festival_id,
              f.name as festival_name, f.slug, f.status as festival_status, f.copartner,
              (select count(*)::int from event_registrations r where r.event_id = e.id) as registered_count,
              (select count(*)::int from checkins c where c.event_id = e.id and c.result = 'valid') as checkin_count
       from events e
       join festivals f on f.id = e.festival_id
       order by e.starts_at
       limit 12`)).map((e: any) => ({
      ...e,
      starts_at: isoText(e.starts_at),
      ends_at: isoText(e.ends_at),
    }));

    const commissionTotal = festivals
      .filter((f: any) => f.copartner)
      .reduce((sum: number, f: any) => sum + (f.commission || 0), 0);

    const me = (await sql.query<any>(`select id, username, kind, display_name, organization_name, contact_email, last_seen_at::text as last_seen_at
       from operator_accounts where id = $1`, [context.userId]))[0];

    const agreements = await sql.query<any>(`select a.*, a.created_at::text as created_at, f.name as festival_name, f.slug as festival_slug, f.status as festival_status
       from copartner_agreements a
       join festivals f on f.id = a.festival_id
       order by a.created_at desc limit 12`);

    return {
      festivals,
      stats: stats[0],
      orgs,
      members,
      operators,
      auditLogs,
      apps,
      events,
      agreements,
      commission: commissionTotal,
      me,
    };
  });

export const getSspIntelligence = createServerFn({ method: "GET" })
  .middleware([MW])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);

    const byFestival = (
      await sql.query<any>(`select f.id, f.name, f.status, f.copartner, f.city, f.slug,
              (select count(*)::int from participants p where p.festival_id = f.id) as turnout,
              (select count(*)::int from events e where e.festival_id = f.id) as events,
              (select count(*)::int from checkins c join events e on e.id = c.event_id where e.festival_id = f.id and c.result = 'valid') as checkins,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'physical'),0) as physical,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'digital'),0) as digital,
              coalesce(cpa.commission_pct, lp.commission_pct, 25) as commission_pct
       from festivals f
       left join copartner_agreements cpa on cpa.festival_id = f.id
       left join license_packages lp on lp.id = f.package_id
       order by f.starts_on`)
    ).map((f: any) => ({
      ...f,
      commission: f.copartner ? Math.round((f.digital * Number(f.commission_pct || 25)) / 100) : 0,
    }));

    const totals = await sql.query<any>(`select
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'physical'),0) as physical,
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'digital'),0) as digital,
        (select count(*)::int from participants) as turnout,
        (select count(*)::int from checkins where result = 'valid') as checkins,
        (select count(*)::int from events) as events,
        (select count(*)::int from festivals) as tenants`);

    const income = await sql.query<any>(`select i.*, i.recognized_on::text as recognized_on, f.name as festival_name, s.name as sponsor_name
       from sponsor_income i
       join festivals f on f.id = i.festival_id
       left join sponsors s on s.id = i.sponsor_id
       order by i.recognized_on desc`);

    const statusMix = await sql.query<any>(`select status, count(*)::int as n from festivals group by status order by n desc`);
    const eventMix = await sql.query<any>(`select event_type, count(*)::int as n from events group by event_type order by n desc`);
    const cityMix = await sql.query<any>(`select coalesce(nullif(city,''),'Unknown') as city, count(*)::int as n
       from participants group by 1 order by n desc limit 8`);

    const commission = Math.round(
      byFestival.filter((f: any) => f.copartner).reduce((sum: number, f: any) => sum + (f.commission || 0), 0),
    );

    return {
      byFestival,
      totals: totals[0],
      income,
      statusMix,
      eventMix,
      cityMix,
      commission,
      digital: totals[0]?.digital ?? 0,
    };
  });

export const listNetworkEvents = createServerFn({ method: "GET" })
  .middleware([MW])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    const events = (await sql.query<any>(`select e.id, e.name, e.starts_at, e.ends_at,
              e.status, e.event_type, e.published, e.festival_id, e.capacity,
              f.name as festival_name, f.slug, f.status as festival_status, f.copartner, f.city,
              (select count(*)::int from event_registrations r where r.event_id = e.id) as registered_count,
              (select count(*)::int from checkins c where c.event_id = e.id and c.result = 'valid') as checkin_count
       from events e
       join festivals f on f.id = e.festival_id
       order by e.starts_at`)).map((e: any) => ({
      ...e,
      starts_at: isoText(e.starts_at),
      ends_at: isoText(e.ends_at),
    }));
    const festivals = await sql.query<any>(`select id, name, slug, status, copartner, city from festivals order by starts_on`);
    return { events, festivals };
  });

export const createFestivalTenant = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: any) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    const id = newId("fst");
    const slug = data.slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const copartner = data.copartner !== false;
    let packageId = data.package_id;
    let commissionPct = Number(data.commission_pct) || 25;

    if (copartner) {
      if (data.tier === "pro" || data.tier === "pkg_copartner_pro" || commissionPct >= 40) {
        packageId = "pkg_copartner_pro";
        commissionPct = 40;
      } else {
        packageId = "pkg_copartner_lite";
        commissionPct = commissionPct || 25;
      }
    } else {
      packageId = packageId || "pkg_command";
      commissionPct = 0;
    }

    await sql.query<any>(
      `insert into festivals (
        id, organization_id, name, slug, tagline, description, logo_text, city, province,
        starts_on, ends_on, timezone, status, organizer_name, contact_email, created_by,
        package_id, copartner, hero_kicker
      ) values ($1,'org_tukodph',$2,$3,$4,'',$5,$6,$7,$8,$9,'Asia/Manila','DRAFT',$10,$11,$12,$13,$14,$15)`,
      [
        id,
        data.name,
        slug,
        data.tagline || "",
        data.name.slice(0, 2).toUpperCase(),
        data.city,
        data.province,
        data.starts_on,
        data.ends_on,
        data.organizer_name,
        data.contact_email,
        context.userId,
        packageId,
        copartner,
        copartner
          ? `TukodPH Co-Partner (${commissionPct}% RevShare) — digital festival operated from HQ`
          : "Provisioned from TukodPH Headquarters",
      ],
    );
    await grantSspOperators(sql, id);
    await seedPlanning(sql, id);
    await sql.query<any>(
      `insert into festival_pages (id, festival_id, slug, title, body, published)
       values ($1,$2,'home',$3,'Welcome to the festival tenant. Open the CMS to build the public site.', false)`,
      [newId("pg"), id, data.name],
    );
    await sql.query<any>(
      `insert into festival_licenses (id, festival_id, package_id, user_id, status)
       values ($1,$2,$3,$4,'active')`,
      [newId("lic"), id, packageId, context.userId],
    );
    if (copartner) {
      const agreementNotes = data.notes || (packageId === "pkg_copartner_pro"
        ? "Smart Festival Pro Co-Partner — TukodPH full-scale digital organizer, pre-event sponsor outsourcing, on-ground support, and post-event evaluation report (40% revenue share)."
        : "Digital Festival Lite Co-Partner — TukodPH digital consultant, online CMS, terminals, and 25% revenue share.");
      await sql.query<any>(
        `insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes)
         values ($1,$2,$3,'active',$4,$5)`,
        [newId("cpa"), id, context.userId, commissionPct, agreementNotes],
      );
    }
    await audit(sql, context.userId, "festival.create", "festival", id, { slug, copartner, packageId, commissionPct });
    return { id, slug, copartner, packageId, commissionPct };
  });

export const updateFestivalStatus = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: any) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    await sql.query<any>(`update festivals set status = $1 where id = $2`, [data.status, data.id]);
    if (data.status === "LIVE") {
      await sql.query<any>(
        `update planning_items set done = true where festival_id = $1 and key = 'go_live'`,
        [data.id],
      );
    }
    await audit(sql, context.userId, "festival.status", "festival", data.id, { status: data.status });
    return { ok: true };
  });

export const setFestivalCopartner = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: any) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    const copartner = Boolean(data.copartner);
    await sql.query<any>(
      `update festivals set copartner = $1, package_id = case when $1 then 'pkg_copartner_lite' else package_id end where id = $2`,
      [copartner, data.id],
    );
    if (copartner) {
      const existing = await sql.query<any>(`select id from copartner_agreements where festival_id = $1`, [
        data.id,
      ]);
      if (existing[0]) {
        await sql.query<any>(`update copartner_agreements set status = 'active' where festival_id = $1`, [
          data.id,
        ]);
      } else {
        await sql.query<any>(
          `insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes)
           values ($1,$2,$3,'active',30,'Activated from TukodPH Headquarters.')`,
          [newId("cpa"), data.id, context.userId],
        );
      }
    }
    await grantSspOperators(sql, data.id);
    await audit(sql, context.userId, "festival.copartner", "festival", data.id, { copartner });
    return { ok: true, copartner };
  });

export const hqGoLive = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: any) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    const fest = (await sql.query<any>(`select * from festivals where id = $1`, [data.id]))[0];
    if (!fest) throw new Error("Festival not found");
    await sql.query(`update festivals set status = 'LIVE' where id = $1`, [data.id]);
    await sql.query(`update planning_items set done = true where festival_id = $1`, [data.id]);
    if (fest.copartner) {
      const existing = await sql.query<any>(`select id from copartner_agreements where festival_id = $1`, [
        data.id,
      ]);
      if (existing[0]) {
        await sql.query(`update copartner_agreements set status = 'active' where festival_id = $1`, [data.id]);
      } else {
        await sql.query(
          `insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes)
           values ($1,$2,$3,'active',30,'HQ published this tenant as digital co-partner.')`,
          [newId("cpa"), data.id, context.userId],
        );
      }
    }
    await grantSspOperators(sql, data.id);
    await audit(sql, context.userId, "festival.golive", "festival", data.id, { copartner: fest.copartner });
    return { ok: true, id: data.id };
  });

export const setNetworkEventStatus = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: any) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    const published = data.status === "live" || data.status === "published";
    await sql.query(`update events set status = $1, published = $2 where id = $3`, [
      data.status,
      published,
      data.id,
    ]);
    await audit(sql, context.userId, "event.status", "event", data.id, { status: data.status });
    return { ok: true };
  });

export const hqCreateEvent = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: any) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    const id = newId("evt");
    const starts = data.starts_at ? new Date(data.starts_at).toISOString() : new Date().toISOString();
    const ends = data.ends_at
      ? new Date(data.ends_at).toISOString()
      : new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
    await sql.query(
      `insert into events (
        id, festival_id, venue_id, category_id, name, description, organizer, event_type,
        starts_at, ends_at, capacity, registration_mode, access_mode, status, published,
        emergency_contact, sponsor_id, engagement_notes
      ) values ($1,$2,null,null,$3,$4,$5,$6,$7,$8,$9,'open','epass',$10,$11,'',$12,'')`,
      [
        id,
        data.festivalId,
        data.name,
        data.description || "",
        data.organizer || "TukodPH Headquarters",
        data.event_type || "physical",
        starts,
        ends,
        Number(data.capacity) || 1000,
        data.published ? "published" : "draft",
        Boolean(data.published),
        data.sponsor_id || null,
      ],
    );
    await sql.query(`update planning_items set done = true where festival_id = $1 and key = 'calendar'`, [
      data.festivalId,
    ]);
    await grantSspOperators(sql, data.festivalId);
    await audit(sql, context.userId, "event.create", "event", id, { festivalId: data.festivalId });
    return { id, festivalId: data.festivalId };
  });

export const getSspNetwork = createServerFn({ method: "GET" })
  .middleware([MW])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    const participants = await sql.query<any>(`select p.id, p.full_name, p.city, p.email, p.festival_id,
              f.name as festival_name, f.slug, ep.credential_id
       from participants p
       join festivals f on f.id = p.festival_id
       left join epasses ep on ep.participant_id = p.id
       order by p.created_at desc
       limit 60`);
    const sponsors = await sql.query<any>(`select s.id, s.name, s.tier, s.festival_id, f.name as festival_name
       from sponsors s
       join festivals f on f.id = s.festival_id
       order by s.name`);
    const vendors = await sql.query<any>(`select v.id, v.name, v.category, v.festival_id, f.name as festival_name
       from vendors v
       join festivals f on f.id = v.festival_id
       order by v.name`);
    const staff = await sql.query<any>(`select s.id, s.full_name, s.role, s.status, s.festival_id, f.name as festival_name
       from staff_members s
       join festivals f on f.id = s.festival_id
       order by s.full_name`);
    const partners = await sql.query<any>(`select r.*, f.name as festival_name
       from partner_requests r
       join festivals f on f.id = r.festival_id
       order by r.created_at desc
       limit 24`);
    const income = await sql.query<any>(`select i.id, i.channel, i.amount_php, i.recognized_on::text as recognized_on,
              f.name as festival_name, f.id as festival_id, s.name as sponsor_name, f.copartner
       from sponsor_income i
       join festivals f on f.id = i.festival_id
       left join sponsors s on s.id = i.sponsor_id
       order by i.recognized_on desc`);
    return { participants, sponsors, vendors, staff, partners, income };
  });

export const rotateSspPasskey = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: { operatorId: string; newPasskey: string; confirm: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    if (!data.newPasskey || data.newPasskey.length < 6) {
      throw new Error("Passkey must be at least 6 characters");
    }
    if (data.newPasskey !== data.confirm) throw new Error("Passkeys do not match");
    const target = (
      await sql.query<any>(`select id, username, kind from operator_accounts where id = $1`, [data.operatorId])
    )[0];
    if (!target || target.kind !== "ssp") throw new Error("Super Admin account not found");
    await sql.query(`update operator_accounts set pass_hash = $1 where id = $2`, [
      hashPass(data.newPasskey),
      target.id,
    ]);
    await audit(sql, context.userId, "ssp.passkey.rotate", "operator", target.id, {
      username: target.username,
    });
    return { ok: true, username: target.username };
  });

export const updateFestivalIdentity = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: any) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    const slug = String(data.slug ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!data.name || !slug) throw new Error("Name and slug are required");
    const clash = await sql.query<any>(`select id from festivals where slug = $1 and id <> $2`, [
      slug,
      data.id,
    ]);
    if (clash[0]) throw new Error("That slug is already in use");
    await sql.query(
      `update festivals set
         name = $1, slug = $2, city = $3, province = $4, starts_on = $5, ends_on = $6,
         tagline = $7, organizer_name = $8, contact_email = $9, logo_text = $10
       where id = $11`,
      [
        data.name,
        slug,
        data.city || "",
        data.province || "",
        data.starts_on,
        data.ends_on,
        data.tagline || "",
        data.organizer_name || "",
        data.contact_email || "",
        String(data.name).slice(0, 2).toUpperCase(),
        data.id,
      ],
    );
    await audit(sql, context.userId, "festival.identity", "festival", data.id, { slug });
    return { ok: true, id: data.id, slug };
  });

export const issueTenantOperator = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: any) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    await requireSsp(sql, context.userId);
    const username = String(data.username ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "");
    if (username.length < 3) throw new Error("User ID must be at least 3 characters");
    if (!data.passkey || String(data.passkey).length < 6) {
      throw new Error("Passkey must be at least 6 characters");
    }
    const existing = await sql.query<any>(`select id from operator_accounts where lower(username) = $1`, [
      username,
    ]);
    if (existing[0]) throw new Error("That User ID is already taken");
    const id = newId("op");
    await sql.query(
      `insert into operator_accounts (id, username, pass_hash, kind, display_name, organization_name, contact_email)
       values ($1,$2,$3,'tenant',$4,$5,$6)`,
      [
        id,
        username,
        hashPass(data.passkey),
        String(data.display_name || username).trim(),
        String(data.organization_name || "").trim(),
        String(data.contact_email || "").trim(),
      ],
    );
    if (data.festivalId) {
      await sql.query(
        `insert into festival_members (festival_id, user_id, role) values ($1,$2,'admin') on conflict do nothing`,
        [data.festivalId, id],
      );
    }
    await audit(sql, context.userId, "tenant.operator.issue", "operator", id, {
      username,
      festivalId: data.festivalId ?? null,
    });
    return { ok: true, id, username };
  });
