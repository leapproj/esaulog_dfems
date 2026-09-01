import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/ids";
import { tenantMiddleware as MW } from "./operator-auth";
import { audit, eventReadiness, mapEvent, requireFestivalMember } from "./helpers";
import { ensureSeed } from "./seed";

export const getAdminDashboard = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireFestivalMember(sql, context.userId, festivalId);
	const festival = (await sql.query<any>(`select * from festivals where id = $1`, [festivalId]))[0];
	if (!festival) throw new Error("Festival not found");
	const stats = await sql.query<any>(`select
        (select count(*)::int from participants where festival_id = $1) as participants,
        (select count(*)::int from events where festival_id = $1) as events,
        (select count(*)::int from events where festival_id = $1 and starts_at::date = date '2026-08-22') as today_events,
        (select count(*)::int from checkins c join events e on e.id = c.event_id where e.festival_id = $1 and c.result = 'valid') as checkins,
        (select count(*)::int from gate_access_keys where festival_id = $1 and active) as gate_keys,
        (select count(*)::int from vendors where festival_id = $1) as vendors`, [festivalId]);
	const mapped = (await sql.query<any>(`select e.*, v.name as venue_name,
              (select count(*)::int from event_registrations r where r.event_id = e.id) as registered_count,
              (select count(*)::int from checkins c where c.event_id = e.id and c.result = 'valid') as checkin_count
       from events e
       left join venues v on v.id = e.venue_id
       where e.festival_id = $1
       order by e.starts_at`, [festivalId])).map(mapEvent);
	const engagement = mapped.length === 0 ? 0 : Math.round(mapped.filter((e: any) => e.published).length / mapped.length * 70 + Math.min(30, stats[0].checkins / Math.max(1, stats[0].participants) * 30));
	const readinessScores = await Promise.all(mapped.slice(0, 8).map(async (e: any) => ({
		id: e.id,
		...await eventReadiness(sql, e.id)
	})));
	const avgReady = readinessScores.length === 0 ? 0 : Math.round(readinessScores.reduce((a: number, b: any) => a + b.score, 0) / readinessScores.length);
	return {
		festival,
		stats: stats[0],
		events: mapped,
		engagement,
		readiness: avgReady,
		readinessScores
	};
});
export const getAdminEvents = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	const events = await sql.query<any>(`select e.*, v.name as venue_name, c.name as category_name,
              (select count(*)::int from event_registrations r where r.event_id = e.id) as registered_count,
              (select count(*)::int from checkins ch where ch.event_id = e.id and ch.result = 'valid') as checkin_count
       from events e
       left join venues v on v.id = e.venue_id
       left join event_categories c on c.id = e.category_id
       where e.festival_id = $1
       order by e.starts_at`, [festivalId]);
	const venues = await sql.query<any>(`select * from venues where festival_id = $1`, [festivalId]);
	const categories = await sql.query<any>(`select * from event_categories where festival_id = $1`, [festivalId]);
	const sponsors = await sql.query<any>(`select id, name from sponsors where festival_id = $1`, [festivalId]);
	return {
		events: events.map(mapEvent),
		venues,
		categories,
		sponsors
	};
});
export const getAdminEvent = createServerFn({ method: "GET" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const rows = await sql.query<any>(`select e.*, v.name as venue_name, c.name as category_name
       from events e
       left join venues v on v.id = e.venue_id
       left join event_categories c on c.id = e.category_id
       where e.id = $1 and e.festival_id = $2`, [data.eventId, data.festivalId]);
	if (!rows[0]) return null;
	const readiness = await eventReadiness(sql, data.eventId);
	const keys = await sql.query<any>(`select k.*, g.name as gate_name from gate_access_keys k
       left join gates g on g.id = k.gate_id
       where k.event_id = $1`, [data.eventId]);
	return {
		event: mapEvent(rows[0]),
		readiness,
		keys
	};
});
export const createEvent = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const id = newId("evt");
	await sql.query<any>(`insert into events (
        id, festival_id, venue_id, category_id, name, description, organizer, event_type,
        starts_at, ends_at, capacity, registration_mode, access_mode, status, published,
        emergency_contact, sponsor_id, engagement_notes
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`, [
		id,
		data.festivalId,
		data.venue_id,
		data.category_id,
		data.name,
		data.description,
		data.organizer,
		data.event_type,
		data.starts_at,
		data.ends_at,
		data.capacity,
		data.registration_mode,
		data.access_mode,
		data.published ? "published" : "draft",
		data.published,
		data.emergency_contact,
		data.sponsor_id,
		data.engagement_notes
	]);
	await audit(sql, context.userId, "event.create", "event", id);
	await sql.query<any>(`update planning_items set done = true where festival_id = $1 and key = 'calendar'`, [data.festivalId]);
	return { id };
});
export const getParticipants = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	return sql.query<any>(`select p.*, e.credential_id
       from participants p
       left join epasses e on e.participant_id = p.id
       where p.festival_id = $1
       order by p.created_at desc`, [festivalId]);
});
export const getVenues = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	return sql.query<any>(`select * from venues where festival_id = $1`, [festivalId]);
});
export const createVenue = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const id = newId("ven");
	await sql.query<any>(`insert into venues (id, festival_id, name, address, capacity, kind) values ($1,$2,$3,$4,$5,$6)`, [
		id,
		data.festivalId,
		data.name,
		data.address,
		data.capacity,
		data.kind
	]);
	return { id };
});
export const getCmsPages = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	return sql.query<any>(`select * from festival_pages where festival_id = $1 order by slug`, [festivalId]);
});
export const saveCmsPage = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	await sql.query<any>(`update festival_pages set title = $1, body = $2, updated_at = now() where id = $3 and festival_id = $4`, [
		data.title,
		data.body,
		data.id,
		data.festivalId
	]);
	return { ok: true };
});
export const getGateKeys = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	return sql.query<any>(`select k.*, e.name as event_name, g.name as gate_name
       from gate_access_keys k
       join events e on e.id = k.event_id
       left join gates g on g.id = k.gate_id
       where k.festival_id = $1
       order by k.code`, [festivalId]);
});
export const createGateKey = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const id = newId("key");
	const gateId = newId("gate");
	await sql.query<any>(`insert into gates (id, festival_id, event_id, name) values ($1,$2,$3,$4)`, [
		gateId,
		data.festivalId,
		data.eventId,
		"Gate"
	]);
	await sql.query<any>(`insert into gate_access_keys (id, festival_id, event_id, gate_id, code, staff_role, max_devices, active)
       values ($1,$2,$3,$4,$5,$6,$7,true)`, [
		id,
		data.festivalId,
		data.eventId,
		gateId,
		data.code.toUpperCase(),
		data.staff_role,
		data.max_devices
	]);
	await audit(sql, context.userId, "gate.key.create", "gate_access_key", id);
	await sql.query<any>(`update planning_items set done = true where festival_id = $1 and key = 'gate_staff'`, [data.festivalId]);
	return {
		id,
		code: data.code.toUpperCase()
	};
});
export const getAdminAnalytics = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	return {
		byName: await sql.query<any>(`select name, count(*)::int as n from analytics_events
       where festival_id = $1 group by name order by n desc`, [festivalId]),
		byDay: await sql.query<any>(`select created_at::date::text as day, count(*)::int as n
       from analytics_events where festival_id = $1
       group by created_at::date order by day`, [festivalId]),
		eventPerf: await sql.query<any>(`select e.name,
              (select count(*)::int from event_registrations r where r.event_id = e.id) as registered,
              (select count(*)::int from checkins c where c.event_id = e.id and c.result = 'valid') as checkins
       from events e where e.festival_id = $1 order by e.starts_at`, [festivalId]),
		cities: await sql.query<any>(`select city, count(*)::int as n from participants where festival_id = $1 group by city order by n desc`, [festivalId])
	};
});
export const listFestivalsForUser = createServerFn({ method: "GET" }).middleware([MW]).handler(async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	return sql.query<any>(`select f.* from festivals f
       join festival_members m on m.festival_id = f.id
       where m.user_id = $1
       order by f.starts_on`, [context.userId]);
});


export const getStaff = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	return sql.query<any>(`select s.*, e.name as event_name from staff_members s left join events e on e.id = s.assigned_event_id where s.festival_id = $1 order by s.full_name`, [festivalId]);
});
export const addStaff = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const id = newId("stf");
	await sql.query<any>(`insert into staff_members (id, festival_id, full_name, role, phone, email, status, assigned_event_id, notes) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [id, data.festivalId, data.full_name, data.role, data.phone || "", data.email || "", data.status || "active", data.assigned_event_id || null, data.notes || ""]);
	return { id };
});
export const getGateCheckins = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	return sql.query<any>(`select c.id, c.event_id, c.result, c.checked_in_at::text as created_at, p.full_name as participant_name, ep.credential_id, e.name as event_name
     from checkins c
     join epasses ep on ep.id = c.epass_id
     join participants p on p.id = ep.participant_id
     join events e on e.id = c.event_id
     where e.festival_id = $1
     order by c.checked_in_at desc
     limit 80`, [festivalId]);
});

export type EventDraft = {
  festivalId: string;
  name: string;
  description: string;
  organizer: string;
  category_id: string | null;
  event_type: string;
  starts_at: string;
  ends_at: string;
  venue_id: string | null;
  capacity: number;
  registration_mode: string;
  access_mode: string;
  engagement_notes: string;
  sponsor_id: string | null;
  emergency_contact: string;
  published: boolean;
};
