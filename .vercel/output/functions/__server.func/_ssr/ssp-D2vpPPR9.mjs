import { n as isoText } from "./format-CP3TpnOc.mjs";
import { r as getSql } from "./db-DeV0fZK1.mjs";
import { i as createServerFn } from "./ssr2.mjs";
import { t as hashPass } from "./crypto-pass-1fMc07Sa.mjs";
import { i as sspMiddleware } from "./operator-auth-BNvYqwZS.mjs";
import { i as newId, t as createServerRpc } from "./createServerRpc-L9LYBe9K.mjs";
import { r as grantSspOperators, s as requireSsp, t as audit } from "./helpers-Ceyqsr-3.mjs";
import { t as ensureSeed } from "./seed-BTVIGMLs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ssp-D2vpPPR9.js
var PLAN_KEYS = [
	{
		key: "identity",
		label: "Festival identity & dates"
	},
	{
		key: "calendar",
		label: "Event calendar"
	},
	{
		key: "sponsors",
		label: "Activate sponsors"
	},
	{
		key: "cms",
		label: "Build festival website (CMS)"
	},
	{
		key: "participant_portal",
		label: "Participant portal"
	},
	{
		key: "gate_staff",
		label: "Gate-staff portal"
	},
	{
		key: "go_live",
		label: "Ready to publish"
	}
];
async function seedPlanning(sql, festivalId) {
	for (const item of PLAN_KEYS) await sql.query(`insert into planning_items (id, festival_id, key, label, done) values ($1,$2,$3,$4,$5) on conflict do nothing`, [
		newId("pln"),
		festivalId,
		item.key,
		item.label,
		item.key === "identity"
	]);
}
var getSspOverview_createServerFn_handler = createServerRpc({
	id: "0cb38cb4613649ce0145b4654c86371a5c018907a8952aacc32a6fac0ded2289",
	name: "getSspOverview",
	filename: "src/lib/server/ssp.ts"
}, (opts) => getSspOverview.__executeServer(opts));
var getSspOverview = createServerFn({ method: "GET" }).middleware([sspMiddleware]).handler(getSspOverview_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const festivals = (await sql.query(`select f.*,
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
       order by f.starts_on`)).map((f) => ({
		...f,
		commission: f.copartner ? Math.round(f.digital * Number(f.commission_pct || 25) / 100) : 0
	}));
	const stats = await sql.query(`select
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
	const orgs = await sql.query(`select o.*,
              (select count(*)::int from festivals f where f.organization_id = o.id) as festivals
       from organizations o order by name`);
	const operators = await sql.query(`select id, username, kind, display_name, organization_name, contact_email, created_at::text as created_at, last_seen_at::text as last_seen_at
       from operator_accounts order by kind desc, display_name`);
	const members = await sql.query(`select user_id, role, created_at::text as created_at from platform_members order by created_at desc`);
	const auditLogs = await sql.query(`select id, actor_user_id, action, entity, entity_id, created_at::text as created_at
       from audit_logs order by created_at desc limit 16`);
	const apps = await sql.query(`select a.*, a.created_at::text as created_at, p.name as package_name, p.slug as package_slug, p.kind as package_kind
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       order by a.created_at desc limit 12`);
	const events = (await sql.query(`select e.id, e.name, e.starts_at, e.ends_at,
              e.status, e.event_type, e.published, e.festival_id,
              f.name as festival_name, f.slug, f.status as festival_status, f.copartner,
              (select count(*)::int from event_registrations r where r.event_id = e.id) as registered_count,
              (select count(*)::int from checkins c where c.event_id = e.id and c.result = 'valid') as checkin_count
       from events e
       join festivals f on f.id = e.festival_id
       order by e.starts_at
       limit 12`)).map((e) => ({
		...e,
		starts_at: isoText(e.starts_at),
		ends_at: isoText(e.ends_at)
	}));
	const commissionTotal = festivals.filter((f) => f.copartner).reduce((sum, f) => sum + (f.commission || 0), 0);
	const me = (await sql.query(`select id, username, kind, display_name, organization_name, contact_email, last_seen_at::text as last_seen_at
       from operator_accounts where id = $1`, [context.userId]))[0];
	const agreements = await sql.query(`select a.*, a.created_at::text as created_at, f.name as festival_name, f.slug as festival_slug, f.status as festival_status
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
		me
	};
});
var getSspIntelligence_createServerFn_handler = createServerRpc({
	id: "2993142267a99944f63b4bb133e7b0d71747fe62983807d73e9c0d3bf8d59eea",
	name: "getSspIntelligence",
	filename: "src/lib/server/ssp.ts"
}, (opts) => getSspIntelligence.__executeServer(opts));
var getSspIntelligence = createServerFn({ method: "GET" }).middleware([sspMiddleware]).handler(getSspIntelligence_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const byFestival = (await sql.query(`select f.id, f.name, f.status, f.copartner, f.city, f.slug,
              (select count(*)::int from participants p where p.festival_id = f.id) as turnout,
              (select count(*)::int from events e where e.festival_id = f.id) as events,
              (select count(*)::int from checkins c join events e on e.id = c.event_id where e.festival_id = f.id and c.result = 'valid') as checkins,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'physical'),0) as physical,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'digital'),0) as digital,
              coalesce(cpa.commission_pct, lp.commission_pct, 25) as commission_pct
       from festivals f
       left join copartner_agreements cpa on cpa.festival_id = f.id
       left join license_packages lp on lp.id = f.package_id
       order by f.starts_on`)).map((f) => ({
		...f,
		commission: f.copartner ? Math.round(f.digital * Number(f.commission_pct || 25) / 100) : 0
	}));
	const totals = await sql.query(`select
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'physical'),0) as physical,
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'digital'),0) as digital,
        (select count(*)::int from participants) as turnout,
        (select count(*)::int from checkins where result = 'valid') as checkins,
        (select count(*)::int from events) as events,
        (select count(*)::int from festivals) as tenants`);
	const income = await sql.query(`select i.*, i.recognized_on::text as recognized_on, f.name as festival_name, s.name as sponsor_name
       from sponsor_income i
       join festivals f on f.id = i.festival_id
       left join sponsors s on s.id = i.sponsor_id
       order by i.recognized_on desc`);
	const statusMix = await sql.query(`select status, count(*)::int as n from festivals group by status order by n desc`);
	const eventMix = await sql.query(`select event_type, count(*)::int as n from events group by event_type order by n desc`);
	const cityMix = await sql.query(`select coalesce(nullif(city,''),'Unknown') as city, count(*)::int as n
       from participants group by 1 order by n desc limit 8`);
	const commission = Math.round(byFestival.filter((f) => f.copartner).reduce((sum, f) => sum + (f.commission || 0), 0));
	return {
		byFestival,
		totals: totals[0],
		income,
		statusMix,
		eventMix,
		cityMix,
		commission,
		digital: totals[0]?.digital ?? 0
	};
});
var listNetworkEvents_createServerFn_handler = createServerRpc({
	id: "56d7eb32a81cd238a29a0b935dff2b446d722325a0b755699eaeb0290f59f836",
	name: "listNetworkEvents",
	filename: "src/lib/server/ssp.ts"
}, (opts) => listNetworkEvents.__executeServer(opts));
var listNetworkEvents = createServerFn({ method: "GET" }).middleware([sspMiddleware]).handler(listNetworkEvents_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	return {
		events: (await sql.query(`select e.id, e.name, e.starts_at, e.ends_at,
              e.status, e.event_type, e.published, e.festival_id, e.capacity,
              f.name as festival_name, f.slug, f.status as festival_status, f.copartner, f.city,
              (select count(*)::int from event_registrations r where r.event_id = e.id) as registered_count,
              (select count(*)::int from checkins c where c.event_id = e.id and c.result = 'valid') as checkin_count
       from events e
       join festivals f on f.id = e.festival_id
       order by e.starts_at`)).map((e) => ({
			...e,
			starts_at: isoText(e.starts_at),
			ends_at: isoText(e.ends_at)
		})),
		festivals: await sql.query(`select id, name, slug, status, copartner, city from festivals order by starts_on`)
	};
});
var createFestivalTenant_createServerFn_handler = createServerRpc({
	id: "5c358a927533004cc3a723e5e17e8ce1779c55f5dcc55ce5d219ed1da4fe4477",
	name: "createFestivalTenant",
	filename: "src/lib/server/ssp.ts"
}, (opts) => createFestivalTenant.__executeServer(opts));
var createFestivalTenant = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createFestivalTenant_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const id = newId("fst");
	const slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
	await sql.query(`insert into festivals (
        id, organization_id, name, slug, tagline, description, logo_text, city, province,
        starts_on, ends_on, timezone, status, organizer_name, contact_email, created_by,
        package_id, copartner, hero_kicker
      ) values ($1,'org_tukodph',$2,$3,$4,'',$5,$6,$7,$8,$9,'Asia/Manila','DRAFT',$10,$11,$12,$13,$14,$15)`, [
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
		copartner ? `TukodPH Co-Partner (${commissionPct}% RevShare) — digital festival operated from HQ` : "Provisioned from TukodPH Headquarters"
	]);
	await grantSspOperators(sql, id);
	await seedPlanning(sql, id);
	await sql.query(`insert into festival_pages (id, festival_id, slug, title, body, published)
       values ($1,$2,'home',$3,'Welcome to the festival tenant. Open the CMS to build the public site.', false)`, [
		newId("pg"),
		id,
		data.name
	]);
	await sql.query(`insert into festival_licenses (id, festival_id, package_id, user_id, status)
       values ($1,$2,$3,$4,'active')`, [
		newId("lic"),
		id,
		packageId,
		context.userId
	]);
	if (copartner) {
		const agreementNotes = data.notes || (packageId === "pkg_copartner_pro" ? "Smart Festival Pro Co-Partner — TukodPH full-scale digital organizer, pre-event sponsor outsourcing, on-ground support, and post-event evaluation report (40% revenue share)." : "Digital Festival Lite Co-Partner — TukodPH digital consultant, online CMS, terminals, and 25% revenue share.");
		await sql.query(`insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes)
         values ($1,$2,$3,'active',$4,$5)`, [
			newId("cpa"),
			id,
			context.userId,
			commissionPct,
			agreementNotes
		]);
	}
	await audit(sql, context.userId, "festival.create", "festival", id, {
		slug,
		copartner,
		packageId,
		commissionPct
	});
	return {
		id,
		slug,
		copartner,
		packageId,
		commissionPct
	};
});
var updateFestivalStatus_createServerFn_handler = createServerRpc({
	id: "2e85a117ad835b49b9f185830d89cd95329a06beff2dfd34680509d2dfa9a81b",
	name: "updateFestivalStatus",
	filename: "src/lib/server/ssp.ts"
}, (opts) => updateFestivalStatus.__executeServer(opts));
var updateFestivalStatus = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(updateFestivalStatus_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	await sql.query(`update festivals set status = $1 where id = $2`, [data.status, data.id]);
	if (data.status === "LIVE") await sql.query(`update planning_items set done = true where festival_id = $1 and key = 'go_live'`, [data.id]);
	await audit(sql, context.userId, "festival.status", "festival", data.id, { status: data.status });
	return { ok: true };
});
var setFestivalCopartner_createServerFn_handler = createServerRpc({
	id: "eba8b6c96ba39165987019ed6a8e548ff773e6cef8b10022c0b88db9995f81cc",
	name: "setFestivalCopartner",
	filename: "src/lib/server/ssp.ts"
}, (opts) => setFestivalCopartner.__executeServer(opts));
var setFestivalCopartner = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(setFestivalCopartner_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const copartner = Boolean(data.copartner);
	await sql.query(`update festivals set copartner = $1, package_id = case when $1 then 'pkg_copartner_lite' else package_id end where id = $2`, [copartner, data.id]);
	if (copartner) {
		if ((await sql.query(`select id from copartner_agreements where festival_id = $1`, [data.id]))[0]) await sql.query(`update copartner_agreements set status = 'active' where festival_id = $1`, [data.id]);
		else await sql.query(`insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes)
           values ($1,$2,$3,'active',30,'Activated from TukodPH Headquarters.')`, [
			newId("cpa"),
			data.id,
			context.userId
		]);
	}
	await grantSspOperators(sql, data.id);
	await audit(sql, context.userId, "festival.copartner", "festival", data.id, { copartner });
	return {
		ok: true,
		copartner
	};
});
var hqGoLive_createServerFn_handler = createServerRpc({
	id: "b8cf01e2ef1e394fb727cf91241c2498afd9b224b65ddc821e6d5a947771ea1a",
	name: "hqGoLive",
	filename: "src/lib/server/ssp.ts"
}, (opts) => hqGoLive.__executeServer(opts));
var hqGoLive = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(hqGoLive_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const fest = (await sql.query(`select * from festivals where id = $1`, [data.id]))[0];
	if (!fest) throw new Error("Festival not found");
	await sql.query(`update festivals set status = 'LIVE' where id = $1`, [data.id]);
	await sql.query(`update planning_items set done = true where festival_id = $1`, [data.id]);
	if (fest.copartner) {
		if ((await sql.query(`select id from copartner_agreements where festival_id = $1`, [data.id]))[0]) await sql.query(`update copartner_agreements set status = 'active' where festival_id = $1`, [data.id]);
		else await sql.query(`insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes)
           values ($1,$2,$3,'active',30,'HQ published this tenant as digital co-partner.')`, [
			newId("cpa"),
			data.id,
			context.userId
		]);
	}
	await grantSspOperators(sql, data.id);
	await audit(sql, context.userId, "festival.golive", "festival", data.id, { copartner: fest.copartner });
	return {
		ok: true,
		id: data.id
	};
});
var setNetworkEventStatus_createServerFn_handler = createServerRpc({
	id: "152e2a4d94576b38d77d27a3f9a52f2422662ada62d22bae67edd58ad195d734",
	name: "setNetworkEventStatus",
	filename: "src/lib/server/ssp.ts"
}, (opts) => setNetworkEventStatus.__executeServer(opts));
var setNetworkEventStatus = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(setNetworkEventStatus_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const published = data.status === "live" || data.status === "published";
	await sql.query(`update events set status = $1, published = $2 where id = $3`, [
		data.status,
		published,
		data.id
	]);
	await audit(sql, context.userId, "event.status", "event", data.id, { status: data.status });
	return { ok: true };
});
var hqCreateEvent_createServerFn_handler = createServerRpc({
	id: "22d0b8891b9b17c4a397b885cc8e3bebae5a43718db084dd94a4b089f5f96b17",
	name: "hqCreateEvent",
	filename: "src/lib/server/ssp.ts"
}, (opts) => hqCreateEvent.__executeServer(opts));
var hqCreateEvent = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(hqCreateEvent_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const id = newId("evt");
	const starts = data.starts_at ? new Date(data.starts_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
	const ends = data.ends_at ? new Date(data.ends_at).toISOString() : new Date(Date.now() + 108e5).toISOString();
	await sql.query(`insert into events (
        id, festival_id, venue_id, category_id, name, description, organizer, event_type,
        starts_at, ends_at, capacity, registration_mode, access_mode, status, published,
        emergency_contact, sponsor_id, engagement_notes
      ) values ($1,$2,null,null,$3,$4,$5,$6,$7,$8,$9,'open','epass',$10,$11,'',$12,'')`, [
		id,
		data.festivalId,
		data.name,
		data.description || "",
		data.organizer || "TukodPH Headquarters",
		data.event_type || "physical",
		starts,
		ends,
		Number(data.capacity) || 1e3,
		data.published ? "published" : "draft",
		Boolean(data.published),
		data.sponsor_id || null
	]);
	await sql.query(`update planning_items set done = true where festival_id = $1 and key = 'calendar'`, [data.festivalId]);
	await grantSspOperators(sql, data.festivalId);
	await audit(sql, context.userId, "event.create", "event", id, { festivalId: data.festivalId });
	return {
		id,
		festivalId: data.festivalId
	};
});
var getSspNetwork_createServerFn_handler = createServerRpc({
	id: "3d9f56690da9f932d492b834889a1758a6799257d941111f8c40af78ff109a54",
	name: "getSspNetwork",
	filename: "src/lib/server/ssp.ts"
}, (opts) => getSspNetwork.__executeServer(opts));
var getSspNetwork = createServerFn({ method: "GET" }).middleware([sspMiddleware]).handler(getSspNetwork_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	return {
		participants: await sql.query(`select p.id, p.full_name, p.city, p.email, p.festival_id,
              f.name as festival_name, f.slug, ep.credential_id
       from participants p
       join festivals f on f.id = p.festival_id
       left join epasses ep on ep.participant_id = p.id
       order by p.created_at desc
       limit 60`),
		sponsors: await sql.query(`select s.id, s.name, s.tier, s.festival_id, f.name as festival_name
       from sponsors s
       join festivals f on f.id = s.festival_id
       order by s.name`),
		vendors: await sql.query(`select v.id, v.name, v.category, v.festival_id, f.name as festival_name
       from vendors v
       join festivals f on f.id = v.festival_id
       order by v.name`),
		staff: await sql.query(`select s.id, s.full_name, s.role, s.status, s.festival_id, f.name as festival_name
       from staff_members s
       join festivals f on f.id = s.festival_id
       order by s.full_name`),
		partners: await sql.query(`select r.*, f.name as festival_name
       from partner_requests r
       join festivals f on f.id = r.festival_id
       order by r.created_at desc
       limit 24`),
		income: await sql.query(`select i.id, i.channel, i.amount_php, i.recognized_on::text as recognized_on,
              f.name as festival_name, f.id as festival_id, s.name as sponsor_name, f.copartner
       from sponsor_income i
       join festivals f on f.id = i.festival_id
       left join sponsors s on s.id = i.sponsor_id
       order by i.recognized_on desc`)
	};
});
var rotateSspPasskey_createServerFn_handler = createServerRpc({
	id: "9cc91271a8bd31e72c39293142e80c56b2b4f50f7e99df7baf95afb286881385",
	name: "rotateSspPasskey",
	filename: "src/lib/server/ssp.ts"
}, (opts) => rotateSspPasskey.__executeServer(opts));
var rotateSspPasskey = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(rotateSspPasskey_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	if (!data.newPasskey || data.newPasskey.length < 6) throw new Error("Passkey must be at least 6 characters");
	if (data.newPasskey !== data.confirm) throw new Error("Passkeys do not match");
	const target = (await sql.query(`select id, username, kind from operator_accounts where id = $1`, [data.operatorId]))[0];
	if (!target || target.kind !== "ssp") throw new Error("Super Admin account not found");
	await sql.query(`update operator_accounts set pass_hash = $1 where id = $2`, [hashPass(data.newPasskey), target.id]);
	await audit(sql, context.userId, "ssp.passkey.rotate", "operator", target.id, { username: target.username });
	return {
		ok: true,
		username: target.username
	};
});
var updateFestivalIdentity_createServerFn_handler = createServerRpc({
	id: "4810316b352244dae7287de20f5de698f361b825e2d0655306127d3d452cae65",
	name: "updateFestivalIdentity",
	filename: "src/lib/server/ssp.ts"
}, (opts) => updateFestivalIdentity.__executeServer(opts));
var updateFestivalIdentity = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(updateFestivalIdentity_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const slug = String(data.slug ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	if (!data.name || !slug) throw new Error("Name and slug are required");
	if ((await sql.query(`select id from festivals where slug = $1 and id <> $2`, [slug, data.id]))[0]) throw new Error("That slug is already in use");
	await sql.query(`update festivals set
         name = $1, slug = $2, city = $3, province = $4, starts_on = $5, ends_on = $6,
         tagline = $7, organizer_name = $8, contact_email = $9, logo_text = $10
       where id = $11`, [
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
		data.id
	]);
	await audit(sql, context.userId, "festival.identity", "festival", data.id, { slug });
	return {
		ok: true,
		id: data.id,
		slug
	};
});
var issueTenantOperator_createServerFn_handler = createServerRpc({
	id: "04092cd22d137e3111d025a0e2b38acc97849d5deef1a6abb6cb555a6dabbcc5",
	name: "issueTenantOperator",
	filename: "src/lib/server/ssp.ts"
}, (opts) => issueTenantOperator.__executeServer(opts));
var issueTenantOperator = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(issueTenantOperator_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const username = String(data.username ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
	if (username.length < 3) throw new Error("User ID must be at least 3 characters");
	if (!data.passkey || String(data.passkey).length < 6) throw new Error("Passkey must be at least 6 characters");
	if ((await sql.query(`select id from operator_accounts where lower(username) = $1`, [username]))[0]) throw new Error("That User ID is already taken");
	const id = newId("op");
	await sql.query(`insert into operator_accounts (id, username, pass_hash, kind, display_name, organization_name, contact_email)
       values ($1,$2,$3,'tenant',$4,$5,$6)`, [
		id,
		username,
		hashPass(data.passkey),
		String(data.display_name || username).trim(),
		String(data.organization_name || "").trim(),
		String(data.contact_email || "").trim()
	]);
	if (data.festivalId) await sql.query(`insert into festival_members (festival_id, user_id, role) values ($1,$2,'admin') on conflict do nothing`, [data.festivalId, id]);
	await audit(sql, context.userId, "tenant.operator.issue", "operator", id, {
		username,
		festivalId: data.festivalId ?? null
	});
	return {
		ok: true,
		id,
		username
	};
});
//#endregion
export { createFestivalTenant_createServerFn_handler, getSspIntelligence_createServerFn_handler, getSspNetwork_createServerFn_handler, getSspOverview_createServerFn_handler, hqCreateEvent_createServerFn_handler, hqGoLive_createServerFn_handler, issueTenantOperator_createServerFn_handler, listNetworkEvents_createServerFn_handler, rotateSspPasskey_createServerFn_handler, setFestivalCopartner_createServerFn_handler, setNetworkEventStatus_createServerFn_handler, updateFestivalIdentity_createServerFn_handler, updateFestivalStatus_createServerFn_handler };
