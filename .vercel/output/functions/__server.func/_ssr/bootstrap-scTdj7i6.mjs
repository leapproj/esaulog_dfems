import { r as getSql } from "./db-DeV0fZK1.mjs";
import { i as createServerFn } from "./ssr2.mjs";
import { a as qrPayload, i as newId, r as credentialFromSeq, t as createServerRpc } from "./createServerRpc-L9LYBe9K.mjs";
import { c as track, t as audit } from "./helpers-Ceyqsr-3.mjs";
import { t as ensureSeed } from "./seed-BTVIGMLs.mjs";
import { t as authMiddleware } from "./middleware-B9YrVm38.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bootstrap-scTdj7i6.js
var bootstrapWorkspace_createServerFn_handler = createServerRpc({
	id: "cc9077b886bef3a49f3703748d3c56048ba7d66679dcd19fa5b40a0268f83980",
	name: "bootstrapWorkspace",
	filename: "src/lib/server/bootstrap.ts"
}, (opts) => bootstrapWorkspace.__executeServer(opts));
var bootstrapWorkspace = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(bootstrapWorkspace_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const userId = context.userId;
	const hid = "fst_higalaay2026";
	let me = await sql.query(`select id, full_name from participants where festival_id = $1 and user_id = $2`, [hid, userId]);
	if (!me[0]) {
		const seqRow = await sql.query(`select count(*)::int as n from epasses`);
		const cred = credentialFromSeq(1900 + (seqRow[0]?.n ?? 0));
		const pid = newId("par");
		await sql.query(`insert into participants (id, festival_id, user_id, full_name, email, city, age_bracket, status)
         values ($1,$2,$3,$4,'','Cagayan de Oro','25-34','active')`, [
			pid,
			hid,
			userId,
			"Festival guest"
		]);
		await sql.query(`insert into epasses (id, festival_id, participant_id, credential_id, qr_payload, status, expires_at)
         values ($1,$2,$3,$4,$5,'active','2026-08-29T23:59:00+08:00')`, [
			newId("eps"),
			hid,
			pid,
			cred,
			qrPayload(cred)
		]);
		for (const ev of [
			"evt_kahimunan",
			"evt_msme",
			"evt_watch",
			"evt_culinary"
		]) await sql.query(`insert into event_registrations (id, event_id, participant_id, status)
           values ($1,$2,$3,'registered') on conflict do nothing`, [
			newId("reg"),
			ev,
			pid
		]);
		await sql.query(`insert into participant_points (participant_id, festival_id, points) values ($1,$2,40) on conflict do nothing`, [pid, hid]);
		await track(sql, {
			name: "participant_registered",
			festivalId: hid,
			userId,
			participantId: pid
		});
		await track(sql, {
			name: "epass_issued",
			festivalId: hid,
			userId,
			participantId: pid
		});
		me = [{
			id: pid,
			full_name: "Festival guest"
		}];
	}
	await audit(sql, userId, "workspace.bootstrap", "user", userId);
	const epass = await sql.query(`select credential_id from epasses where participant_id = $1`, [me[0].id]);
	return {
		userId,
		participantId: me[0].id,
		credentialId: epass[0]?.credential_id ?? null,
		festivalId: hid
	};
});
//#endregion
export { bootstrapWorkspace_createServerFn_handler };
