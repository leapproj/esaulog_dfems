import { r as getSql } from "./db-DeV0fZK1.mjs";
import { i as createServerFn } from "./ssr2.mjs";
import { i as newId, t as createServerRpc } from "./createServerRpc-L9LYBe9K.mjs";
import { c as track } from "./helpers-Ceyqsr-3.mjs";
import { t as ensureSeed } from "./seed-BTVIGMLs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gate-Cj3Wea5l.js
var redeemAccessKey_createServerFn_handler = createServerRpc({
	id: "682226d8ec9ff59108fdeada546b3d5ed874fcbecd6c75a351dc0fefe98cc983",
	name: "redeemAccessKey",
	filename: "src/lib/server/gate.ts"
}, (opts) => redeemAccessKey.__executeServer(opts));
var redeemAccessKey = createServerFn({ method: "POST" }).validator((code) => code.trim().toUpperCase()).handler(redeemAccessKey_createServerFn_handler, async ({ data: code }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const k = (await sql.query(`select k.id, k.code, k.festival_id, k.event_id, k.staff_role, k.active,
              f.name as festival_name, e.name as event_name, g.name as gate_name
       from gate_access_keys k
       join festivals f on f.id = k.festival_id
       join events e on e.id = k.event_id
       left join gates g on g.id = k.gate_id
       where k.code = $1`, [code]))[0];
	if (!k || !k.active) return {
		ok: false,
		reason: "Unknown or inactive access key"
	};
	await track(sql, {
		name: "gate_access",
		festivalId: k.festival_id,
		payload: { code }
	});
	return {
		ok: true,
		session: {
			keyId: k.id,
			code: k.code,
			festivalId: k.festival_id,
			festivalName: k.festival_name,
			eventId: k.event_id,
			eventName: k.event_name,
			gateName: k.gate_name,
			staffRole: k.staff_role
		}
	};
});
function parseCredential(raw) {
	const t = raw.trim();
	if (t.startsWith("esaulog:epass:")) return t.slice(14);
	return t.toUpperCase().startsWith("ESA-") ? t.toUpperCase() : t;
}
var scanEpass_createServerFn_handler = createServerRpc({
	id: "99d5a4f9ffa37a286e6644ee342d4f135f3bae625f6b0e69ad181052254de12f",
	name: "scanEpass",
	filename: "src/lib/server/gate.ts"
}, (opts) => scanEpass.__executeServer(opts));
var scanEpass = createServerFn({ method: "POST" }).validator((input) => input).handler(scanEpass_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const key = (await sql.query(`select id, event_id, gate_id, festival_id, active from gate_access_keys where code = $1`, [data.code.trim().toUpperCase()]))[0];
	if (!key || !key.active) return {
		ok: false,
		reason: "Invalid access key"
	};
	const cred = parseCredential(data.credential);
	const pass = (await sql.query(`select ep.id, ep.credential_id, ep.status, ep.participant_id, p.full_name, ep.festival_id
       from epasses ep join participants p on p.id = ep.participant_id
       where ep.credential_id = $1 or ep.qr_payload = $2`, [cred, data.credential.trim()]))[0];
	if (!pass) {
		await sql.query(`insert into checkins (id, epass_id, event_id, gate_id, access_key_id, result, reason)
         select $1, ep.id, $2, $3, $4, 'invalid', 'Unknown credential' from epasses ep limit 0`, [
			newId("chk"),
			key.event_id,
			key.gate_id,
			key.id
		]);
		return {
			ok: false,
			reason: "Unknown ePASS"
		};
	}
	if (pass.status !== "active") return {
		ok: false,
		reason: `Credential ${pass.status}`,
		participant: {
			name: pass.full_name,
			credentialId: pass.credential_id
		}
	};
	if (!(await sql.query(`select id from event_registrations where event_id = $1 and participant_id = $2`, [key.event_id, pass.participant_id]))[0]) {
		await sql.query(`insert into checkins (id, epass_id, event_id, gate_id, access_key_id, result, reason)
         values ($1,$2,$3,$4,$5,'invalid','Not registered for this event')`, [
			newId("chk"),
			pass.id,
			key.event_id,
			key.gate_id,
			key.id
		]);
		return {
			ok: false,
			reason: "Not registered for this event",
			participant: {
				name: pass.full_name,
				credentialId: pass.credential_id
			}
		};
	}
	if ((await sql.query(`select id from checkins where epass_id = $1 and event_id = $2 and result = 'valid'`, [pass.id, key.event_id]))[0]) return {
		ok: false,
		reason: "Already checked in",
		participant: {
			name: pass.full_name,
			credentialId: pass.credential_id
		}
	};
	await sql.query(`insert into checkins (id, epass_id, event_id, gate_id, access_key_id, result, reason)
       values ($1,$2,$3,$4,$5,'valid','')`, [
		newId("chk"),
		pass.id,
		key.event_id,
		key.gate_id,
		key.id
	]);
	await track(sql, {
		name: "checkin_completed",
		festivalId: key.festival_id,
		participantId: pass.participant_id,
		payload: { eventId: key.event_id }
	});
	const event = await sql.query(`select name from events where id = $1`, [key.event_id]);
	return {
		ok: true,
		participant: {
			name: pass.full_name,
			credentialId: pass.credential_id,
			participantId: pass.participant_id,
			eventName: event[0]?.name ?? ""
		}
	};
});
var listRecentCheckins_createServerFn_handler = createServerRpc({
	id: "a78bacb617b26d63f3e6b9fc8e4ec9b8d69e954b1e433d1cfd9db4866ed00234",
	name: "listRecentCheckins",
	filename: "src/lib/server/gate.ts"
}, (opts) => listRecentCheckins.__executeServer(opts));
var listRecentCheckins = createServerFn({ method: "GET" }).validator((code) => code.trim().toUpperCase()).handler(listRecentCheckins_createServerFn_handler, async ({ data: code }) => {
	const sql = await getSql();
	const key = await sql.query(`select event_id from gate_access_keys where code = $1`, [code]);
	if (!key[0]) return [];
	return sql.query(`select c.id, c.result, c.reason, p.full_name, ep.credential_id, c.checked_in_at::text as checked_in_at
       from checkins c
       join epasses ep on ep.id = c.epass_id
       join participants p on p.id = ep.participant_id
       where c.event_id = $1
       order by c.checked_in_at desc
       limit 12`, [key[0].event_id]);
});
//#endregion
export { listRecentCheckins_createServerFn_handler, redeemAccessKey_createServerFn_handler, scanEpass_createServerFn_handler };
