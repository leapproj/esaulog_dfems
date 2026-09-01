import { n as isoText } from "./format-CP3TpnOc.mjs";
import { r as getSql } from "./db-DeV0fZK1.mjs";
import { i as createServerFn } from "./ssr2.mjs";
import { t as createServerRpc } from "./createServerRpc-L9LYBe9K.mjs";
import { a as mapEvent, c as track } from "./helpers-Ceyqsr-3.mjs";
import { t as ensureSeed } from "./seed-BTVIGMLs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/public-Co0UsxBi.js
var getHomeData_createServerFn_handler = createServerRpc({
	id: "8e516e6c233a5b7ed69769059de3433e6aaa7835b16e18357cec1779bd83c31e",
	name: "getHomeData",
	filename: "src/lib/server/public.ts"
}, (opts) => getHomeData.__executeServer(opts));
var getHomeData = createServerFn({ method: "GET" }).handler(getHomeData_createServerFn_handler, async () => {
	const sql = await getSql();
	await ensureSeed(sql);
	const festivals = await sql.query(`select * from festivals order by starts_on`);
	const stats = await sql.query(`select
      (select count(*)::int from festivals) as festivals,
      (select count(*)::int from participants) as participants,
      (select count(*)::int from events) as events,
      (select count(*)::int from vendors) as vendors,
      (select count(*)::int from checkins where result = 'valid') as checkins`);
	const liveEvents = await sql.query(`select e.*, v.name as venue_name, f.name as festival_name, f.slug as festival_slug
     from events e
     left join venues v on v.id = e.venue_id
     join festivals f on f.id = e.festival_id
     where e.published = true and e.status in ('live','published')
     order by e.starts_at
     limit 6`);
	return {
		festivals,
		stats: stats[0],
		liveEvents: liveEvents.map((r) => ({
			...mapEvent(r),
			festival_name: String(r.festival_name),
			festival_slug: String(r.festival_slug)
		}))
	};
});
var getPublicFestival_createServerFn_handler = createServerRpc({
	id: "f86409414aa016d4b0087e45dde5d9f6e6651674bcd7b9cc4b7e9c272b5bb51f",
	name: "getPublicFestival",
	filename: "src/lib/server/public.ts"
}, (opts) => getPublicFestival.__executeServer(opts));
var getPublicFestival = createServerFn({ method: "GET" }).validator((slug) => slug).handler(getPublicFestival_createServerFn_handler, async ({ data: slug }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const festival = (await sql.query(`select * from festivals where slug = $1`, [slug]))[0];
	if (!festival) return null;
	const [pages, events, venues, vendors, sponsors, blocks] = await Promise.all([
		sql.query(`select * from festival_pages where festival_id = $1 and published = true`, [festival.id]),
		sql.query(`select e.*, v.name as venue_name, c.name as category_name,
                (select count(*)::int from event_registrations r where r.event_id = e.id) as registered_count
         from events e
         left join venues v on v.id = e.venue_id
         left join event_categories c on c.id = e.category_id
         where e.festival_id = $1 and e.published = true
         order by e.starts_at`, [festival.id]),
		sql.query(`select * from venues where festival_id = $1`, [festival.id]),
		sql.query(`select * from vendors where festival_id = $1`, [festival.id]),
		sql.query(`select * from sponsors where festival_id = $1`, [festival.id]),
		sql.query(`select b.* from cms_blocks b
         join festival_pages p on p.id = b.page_id
         where b.festival_id = $1 and b.visible = true and p.published = true
         order by b.sort_order`, [festival.id])
	]);
	await track(sql, {
		name: "event_viewed",
		festivalId: festival.id,
		payload: { slug }
	});
	return {
		festival,
		pages,
		events: events.map(mapEvent),
		venues,
		vendors,
		sponsors,
		blocks
	};
});
var getPublicEvent_createServerFn_handler = createServerRpc({
	id: "d269b08ac9ba0ab75bd557aa59db9af6165d500115f955dea95f122c71ff3e4f",
	name: "getPublicEvent",
	filename: "src/lib/server/public.ts"
}, (opts) => getPublicEvent.__executeServer(opts));
var getPublicEvent = createServerFn({ method: "GET" }).validator((input) => input).handler(getPublicEvent_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const rows = await sql.query(`select e.*, v.name as venue_name, c.name as category_name, f.name as festival_name, f.slug as festival_slug
       from events e
       left join venues v on v.id = e.venue_id
       left join event_categories c on c.id = e.category_id
       join festivals f on f.id = e.festival_id
       where e.id = $1 and f.slug = $2`, [data.eventId, data.slug]);
	if (!rows[0]) return null;
	return {
		event: mapEvent(rows[0]),
		festival_name: String(rows[0].festival_name),
		festival_slug: String(rows[0].festival_slug),
		starts_at: isoText(rows[0].starts_at)
	};
});
var listFestivalCatalog_createServerFn_handler = createServerRpc({
	id: "0b9ccbae418bd88dd14acdc4a61675478b94126c9e436eddd3c7ad68301a671b",
	name: "listFestivalCatalog",
	filename: "src/lib/server/public.ts"
}, (opts) => listFestivalCatalog.__executeServer(opts));
var listFestivalCatalog = createServerFn({ method: "GET" }).handler(listFestivalCatalog_createServerFn_handler, async () => {
	const sql = await getSql();
	await ensureSeed(sql);
	const festivals = await sql.query(`select * from festivals order by starts_on`);
	const today = "2026-08-25";
	return {
		live: festivals.filter((f) => f.status === "LIVE"),
		upcoming: festivals.filter((f) => f.status !== "LIVE" && f.starts_on >= today),
		past: festivals.filter((f) => f.ends_on < today && f.status !== "LIVE"),
		all: festivals,
		keys: await sql.query(`select k.code, k.staff_role, k.festival_id, e.name as event_name, f.name as festival_name, f.slug
     from gate_access_keys k
     join events e on e.id = k.event_id
     join festivals f on f.id = k.festival_id
     where k.active = true
     order by k.code`)
	};
});
var getFestivalHub_createServerFn_handler = createServerRpc({
	id: "d2ddcba5805f48dc6c02b11119d78835d91643f55836e5a250b8ccbe1e474efa",
	name: "getFestivalHub",
	filename: "src/lib/server/public.ts"
}, (opts) => getFestivalHub.__executeServer(opts));
var getFestivalHub = createServerFn({ method: "GET" }).validator((slug) => slug).handler(getFestivalHub_createServerFn_handler, async ({ data: slug }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const festival = (await sql.query(`select * from festivals where slug = $1`, [slug]))[0];
	if (!festival) return null;
	const events = await sql.query(`select e.*, v.name as venue_name from events e
       left join venues v on v.id = e.venue_id
       where e.festival_id = $1 order by e.starts_at`, [festival.id]);
	const keys = await sql.query(`select k.*, e.name as event_name, g.name as gate_name
       from gate_access_keys k
       join events e on e.id = k.event_id
       left join gates g on g.id = k.gate_id
       where k.festival_id = $1 and k.active = true`, [festival.id]);
	const sponsors = await sql.query(`select * from sponsors where festival_id = $1`, [festival.id]);
	const vendors = await sql.query(`select * from vendors where festival_id = $1`, [festival.id]);
	return {
		festival,
		events: events.map(mapEvent),
		keys,
		sponsors,
		vendors
	};
});
var submitPartnerRequest_createServerFn_handler = createServerRpc({
	id: "0b7358bee5bc7b1e0568a31b92f901d528eb6271f3108fda875510f3d082da43",
	name: "submitPartnerRequest",
	filename: "src/lib/server/public.ts"
}, (opts) => submitPartnerRequest.__executeServer(opts));
var submitPartnerRequest = createServerFn({ method: "POST" }).validator((input) => input).handler(submitPartnerRequest_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const f = (await sql.query(`select id from festivals where slug = $1`, [data.slug]))[0];
	if (!f) throw new Error("Festival not found");
	const id = (await import("./createServerRpc-L9LYBe9K.mjs").then((n) => n.n).then((n) => n.r)).newId("ptr");
	await sql.query(`insert into partner_requests (id, festival_id, kind, organization_name, contact_name, contact_email, notes, status)
       values ($1,$2,$3,$4,$5,$6,$7,'pending')`, [
		id,
		f.id,
		data.kind,
		data.organization_name,
		data.contact_name,
		data.contact_email,
		data.notes
	]);
	return { id };
});
//#endregion
export { getFestivalHub_createServerFn_handler, getHomeData_createServerFn_handler, getPublicEvent_createServerFn_handler, getPublicFestival_createServerFn_handler, listFestivalCatalog_createServerFn_handler, submitPartnerRequest_createServerFn_handler };
