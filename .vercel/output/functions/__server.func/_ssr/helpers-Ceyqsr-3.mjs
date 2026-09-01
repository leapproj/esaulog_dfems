import { n as isoText } from "./format-CP3TpnOc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/helpers-Ceyqsr-3.js
function mapEvent(row) {
	return {
		id: String(row.id),
		festival_id: String(row.festival_id),
		venue_id: row.venue_id ? String(row.venue_id) : null,
		category_id: row.category_id ? String(row.category_id) : null,
		name: String(row.name),
		description: String(row.description ?? ""),
		organizer: String(row.organizer ?? ""),
		event_type: row.event_type ?? "physical",
		starts_at: isoText(row.starts_at),
		ends_at: isoText(row.ends_at),
		capacity: Number(row.capacity ?? 0),
		registration_mode: String(row.registration_mode ?? "open"),
		access_mode: String(row.access_mode ?? "epass"),
		status: row.status ?? "draft",
		published: Boolean(row.published),
		emergency_contact: String(row.emergency_contact ?? ""),
		sponsor_id: row.sponsor_id ? String(row.sponsor_id) : null,
		engagement_notes: String(row.engagement_notes ?? ""),
		venue_name: row.venue_name ? String(row.venue_name) : null,
		category_name: row.category_name ? String(row.category_name) : null,
		registered_count: row.registered_count != null ? Number(row.registered_count) : void 0,
		checkin_count: row.checkin_count != null ? Number(row.checkin_count) : void 0
	};
}
async function track(sql, input) {
	const { newId } = await import("./createServerRpc-L9LYBe9K.mjs").then((n) => n.n).then((n) => n.r);
	await sql.query(`insert into analytics_events (id, festival_id, user_id, participant_id, name, payload_json)
     values ($1,$2,$3,$4,$5,$6)`, [
		newId("an"),
		input.festivalId ?? null,
		input.userId ?? null,
		input.participantId ?? null,
		input.name,
		JSON.stringify(input.payload ?? {})
	]);
}
async function audit(sql, actor, action, entity, entityId, meta = {}) {
	const { newId } = await import("./createServerRpc-L9LYBe9K.mjs").then((n) => n.n).then((n) => n.r);
	await sql.query(`insert into audit_logs (id, actor_user_id, action, entity, entity_id, meta_json)
     values ($1,$2,$3,$4,$5,$6)`, [
		newId("aud"),
		actor,
		action,
		entity,
		entityId,
		JSON.stringify(meta)
	]);
}
async function eventReadiness(sql, eventId) {
	const e = (await sql.query(`select e.*, v.id as venue_ok,
            (select count(*)::int from gate_access_keys k where k.event_id = e.id and k.active) as gate_keys,
            (select count(*)::int from surveys s where s.event_id = e.id) as surveys
     from events e
     left join venues v on v.id = e.venue_id
     where e.id = $1`, [eventId]))[0];
	if (!e) return {
		score: 0,
		items: []
	};
	const items = [
		{
			key: "info",
			label: "Event information",
			ok: Boolean(e.name && e.description)
		},
		{
			key: "venue",
			label: "Venue",
			ok: Boolean(e.venue_id)
		},
		{
			key: "registration",
			label: "Registration",
			ok: Boolean(e.registration_mode)
		},
		{
			key: "epass",
			label: "ePASS",
			ok: e.access_mode === "epass" || e.access_mode === "open"
		},
		{
			key: "gate",
			label: "Gate staff",
			ok: Number(e.gate_keys) > 0,
			warn: Number(e.gate_keys) === 0
		},
		{
			key: "sponsor",
			label: "Sponsor",
			ok: Boolean(e.sponsor_id)
		},
		{
			key: "survey",
			label: "Survey",
			ok: Number(e.surveys) > 0
		},
		{
			key: "emergency",
			label: "Emergency contact",
			ok: Boolean(String(e.emergency_contact ?? "").trim()),
			warn: !String(e.emergency_contact ?? "").trim()
		}
	];
	return {
		score: Math.round(items.filter((i) => i.ok).length / items.length * 100),
		items
	};
}
async function requireSsp(sql, userId) {
	if ((await sql.query(`select kind from operator_accounts where id = $1`, [userId]))[0]?.kind === "ssp") return;
	throw new Error("SSP access required");
}
async function grantSspOperators(sql, festivalId) {
	const ops = await sql.query(`select id from operator_accounts where kind = 'ssp'`);
	for (const op of ops) await sql.query(`insert into festival_members (festival_id, user_id, role) values ($1,$2,'admin') on conflict do nothing`, [festivalId, op.id]);
}
async function requireFestivalMember(sql, userId, festivalId) {
	if ((await sql.query(`select kind from operator_accounts where id = $1`, [userId]))[0]?.kind === "ssp") return "admin";
	const rows = await sql.query(`select role from festival_members where user_id = $1 and festival_id = $2`, [userId, festivalId]);
	if (!rows[0]) throw new Error("Festival access required");
	return rows[0].role;
}
async function isSsp(sql, userId) {
	return (await sql.query(`select kind from operator_accounts where id = $1`, [userId]))[0]?.kind === "ssp";
}
//#endregion
export { mapEvent as a, track as c, isSsp as i, eventReadiness as n, requireFestivalMember as o, grantSspOperators as r, requireSsp as s, audit as t };
