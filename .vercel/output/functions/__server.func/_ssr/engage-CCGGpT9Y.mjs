import { r as getSql } from "./db-DeV0fZK1.mjs";
import { i as createServerFn } from "./ssr2.mjs";
import { i as newId, t as createServerRpc } from "./createServerRpc-L9LYBe9K.mjs";
import { t as ensureSeed } from "./seed-BTVIGMLs.mjs";
import { t as authMiddleware } from "./middleware-B9YrVm38.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engage-CCGGpT9Y.js
var getVendorDesk_createServerFn_handler = createServerRpc({
	id: "3d84885b7eb8728530e01fe76387a898ebaebe40422d3e520f6eb91fc82b6c81",
	name: "getVendorDesk",
	filename: "src/lib/server/engage.ts"
}, (opts) => getVendorDesk.__executeServer(opts));
var getVendorDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getVendorDesk_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	context.userId;
	return {
		vendors: await sql.query(`select * from vendors where festival_id = 'fst_higalaay2026' order by name`),
		products: await sql.query(`select p.*, v.name as vendor_name from products p join vendors v on v.id = p.vendor_id
       where v.festival_id = 'fst_higalaay2026'`),
		offers: await sql.query(`select o.id, o.title, o.code, o.kind, v.name as vendor_name
       from offers o join vendors v on v.id = o.vendor_id
       where o.festival_id = 'fst_higalaay2026'`),
		couponCount: (await sql.query(`select count(*)::int as n from coupons`))[0]?.n ?? 0
	};
});
var addProduct_createServerFn_handler = createServerRpc({
	id: "9a1e0b5f39a1b6ab92183d7b4871dae31656f8bd1feadcef195d24a909e65892",
	name: "addProduct",
	filename: "src/lib/server/engage.ts"
}, (opts) => addProduct.__executeServer(opts));
var addProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(addProduct_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	context.userId;
	const id = newId("prd");
	await sql.query(`insert into products (id, vendor_id, name, description, price_php, available) values ($1,$2,$3,'', $4, true)`, [
		id,
		data.vendorId,
		data.name,
		data.price_php
	]);
	return { id };
});
var setVendorBooster_createServerFn_handler = createServerRpc({
	id: "6aa2cf9f654a002200a1b3750c39ebdb8a2201d7f76c417f157cdbd9d182e9df",
	name: "setVendorBooster",
	filename: "src/lib/server/engage.ts"
}, (opts) => setVendorBooster.__executeServer(opts));
var setVendorBooster = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setVendorBooster_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	context.userId;
	await sql.query(`update vendors set booster = $1 where id = $2`, [data.booster, data.vendorId]);
	return { ok: true };
});
var getSponsorDesk_createServerFn_handler = createServerRpc({
	id: "c76f0e1e3c6ac5af31f97d62f0e1649a362fba89dd7843fd5484177e4ec911c9",
	name: "getSponsorDesk",
	filename: "src/lib/server/engage.ts"
}, (opts) => getSponsorDesk.__executeServer(opts));
var getSponsorDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSponsorDesk_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	context.userId;
	return {
		sponsors: await sql.query(`select * from sponsors where festival_id = 'fst_higalaay2026'`),
		campaigns: await sql.query(`select c.id, c.name, c.description, c.status, c.scans, c.participants_count, s.name as sponsor_name
       from sponsor_campaigns c join sponsors s on s.id = c.sponsor_id
       where c.festival_id = 'fst_higalaay2026'`)
	};
});
var bumpCampaignScan_createServerFn_handler = createServerRpc({
	id: "13b0b12480ea5f94088d010dc98999e20a53309e034ef434394869cf70f3a45a",
	name: "bumpCampaignScan",
	filename: "src/lib/server/engage.ts"
}, (opts) => bumpCampaignScan.__executeServer(opts));
var bumpCampaignScan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((campaignId) => campaignId).handler(bumpCampaignScan_createServerFn_handler, async ({ context, data: campaignId }) => {
	const sql = await getSql();
	context.userId;
	await sql.query(`update sponsor_campaigns set scans = scans + 1, participants_count = participants_count + 1 where id = $1`, [campaignId]);
	return { ok: true };
});
var getHubStats_createServerFn_handler = createServerRpc({
	id: "6bc2b1703e13a5ded5a832dfe884ff6e5a0e5f5dd1e2960c322c60aa8ea1cbb9",
	name: "getHubStats",
	filename: "src/lib/server/engage.ts"
}, (opts) => getHubStats.__executeServer(opts));
var getHubStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getHubStats_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const me = await sql.query(`select id, full_name from participants where user_id = $1 limit 1`, [context.userId]);
	const epass = me[0] ? await sql.query(`select credential_id from epasses where participant_id = $1`, [me[0].id]) : [];
	const live = await sql.query(`select count(*)::int as n from festivals where status = 'LIVE'`);
	return {
		participantName: me[0]?.full_name ?? "Operator",
		credentialId: epass[0]?.credential_id ?? null,
		liveFestivals: live[0]?.n ?? 0
	};
});
//#endregion
export { addProduct_createServerFn_handler, bumpCampaignScan_createServerFn_handler, getHubStats_createServerFn_handler, getSponsorDesk_createServerFn_handler, getVendorDesk_createServerFn_handler, setVendorBooster_createServerFn_handler };
