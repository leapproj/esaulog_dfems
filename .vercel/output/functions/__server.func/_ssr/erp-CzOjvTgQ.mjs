import { r as getSql } from "./db-DeV0fZK1.mjs";
import { i as createServerFn } from "./ssr2.mjs";
import { a as tenantMiddleware } from "./operator-auth-BNvYqwZS.mjs";
import { i as newId, t as createServerRpc } from "./createServerRpc-L9LYBe9K.mjs";
import { i as isSsp, o as requireFestivalMember, r as grantSspOperators, s as requireSsp, t as audit } from "./helpers-Ceyqsr-3.mjs";
import { t as ensureSeed } from "./seed-BTVIGMLs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/erp-CzOjvTgQ.js
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
var listPackages_createServerFn_handler = createServerRpc({
	id: "5909485e94cdef090ef0f1b561923480a26c4b5840a0e860235687a034fd3f03",
	name: "listPackages",
	filename: "src/lib/server/erp.ts"
}, (opts) => listPackages.__executeServer(opts));
var listPackages = createServerFn({ method: "GET" }).handler(listPackages_createServerFn_handler, async () => {
	const sql = await getSql();
	await ensureSeed(sql);
	return sql.query(`select * from license_packages order by commission_pct, price_php`);
});
var submitApplication_createServerFn_handler = createServerRpc({
	id: "42b85cbd7e568418b61ce59ebb9b4142b07cf334ae55b99c9678d08e261b68b5",
	name: "submitApplication",
	filename: "src/lib/server/erp.ts"
}, (opts) => submitApplication.__executeServer(opts));
var submitApplication = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(submitApplication_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const id = newId("app");
	await sql.query(`insert into tenant_applications (
        id, user_id, organization_name, festival_name, city, province,
        contact_name, contact_email, package_id, notes, status
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')`, [
		id,
		context.userId,
		data.organization_name,
		data.festival_name,
		data.city,
		data.province,
		data.contact_name,
		data.contact_email,
		data.package_id,
		data.notes
	]);
	await audit(sql, context.userId, "tenant.apply", "application", id);
	return { id };
});
var myApplications_createServerFn_handler = createServerRpc({
	id: "665c2e481d6cc3e2815b13e1758dfd93516014416201c01f7972bee8ad8926a4",
	name: "myApplications",
	filename: "src/lib/server/erp.ts"
}, (opts) => myApplications.__executeServer(opts));
var myApplications = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).handler(myApplications_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	return sql.query(`select a.*, a.created_at::text as created_at, p.name as package_name
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       where a.user_id = $1
       order by a.created_at desc`, [context.userId]);
});
async function provisionFestival(sql, opts) {
	const id = newId("fst");
	const slug = `${opts.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id.slice(-4)}`;
	await sql.query(`insert into festivals (
      id, organization_id, name, slug, tagline, description, logo_text, city, province,
      starts_on, ends_on, timezone, status, organizer_name, contact_email, created_by,
      package_id, copartner
    ) values ($1,'org_tukodph',$2,$3,$12,'',$4,$5,$6,$13,$14,'Asia/Manila','DRAFT',$7,$8,$9,$10,$11)`, [
		id,
		opts.name,
		slug,
		opts.name.slice(0, 2).toUpperCase(),
		opts.city,
		opts.province,
		opts.organizer,
		opts.email,
		opts.userId,
		opts.packageId,
		opts.copartner,
		opts.tagline || "",
		opts.starts_on || "2026-11-01",
		opts.ends_on || "2026-11-08"
	]);
	await sql.query(`insert into festival_members (festival_id, user_id, role) values ($1,$2,'admin') on conflict do nothing`, [id, opts.userId]);
	await grantSspOperators(sql, id);
	const pageId = newId("pg");
	await sql.query(`insert into festival_pages (id, festival_id, slug, title, body, published)
     values ($1,$2,'home',$3,'Draft website. Open the CMS to build blocks.', false)`, [
		pageId,
		id,
		opts.name
	]);
	if (opts.packageId) await sql.query(`insert into festival_licenses (id, festival_id, package_id, user_id, status)
     values ($1,$2,$3,$4,'active')`, [
		newId("lic"),
		id,
		opts.packageId,
		opts.userId
	]);
	for (const item of PLAN_KEYS) await sql.query(`insert into planning_items (id, festival_id, key, label, done) values ($1,$2,$3,$4,$5) on conflict do nothing`, [
		newId("pln"),
		id,
		item.key,
		item.label,
		item.key === "identity"
	]);
	if (opts.copartner) {
		const pkg = opts.packageId ? (await sql.query(`select * from license_packages where id = $1`, [opts.packageId]))[0] : null;
		const commissionPct = pkg?.commission_pct ?? 25;
		const notes = pkg?.slug === "copartner_pro" ? "Smart Festival Pro Co-Partner — TukodPH full-scale digital organizer, pre-event sponsor outsourcing, on-ground support, and post-event evaluation report (40% revenue share)." : "Digital Festival Lite Co-Partner — TukodPH digital consultant, online CMS, terminals, and 25% revenue share.";
		await sql.query(`insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes)
       values ($1,$2,$3,'requested',$4,$5)`, [
			newId("cpa"),
			id,
			opts.userId,
			commissionPct,
			notes
		]);
	}
	return {
		id,
		slug
	};
}
var purchasePackage_createServerFn_handler = createServerRpc({
	id: "6b06f03da16489a0792bebd56d4d4ad231881f09ed0c305789b2cf1784b343e8",
	name: "purchasePackage",
	filename: "src/lib/server/erp.ts"
}, (opts) => purchasePackage.__executeServer(opts));
var purchasePackage = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(purchasePackage_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const pkg = (await sql.query(`select * from license_packages where id = $1`, [data.package_id]))[0];
	if (!pkg) throw new Error("Unknown package");
	const copartner = pkg.kind === "copartner";
	const fest = await provisionFestival(sql, {
		userId: context.userId,
		packageId: pkg.id,
		name: data.festival_name,
		city: data.city,
		province: data.province,
		organizer: data.organizer_name,
		email: data.contact_email,
		copartner
	});
	const appId = newId("app");
	await sql.query(`insert into tenant_applications (
        id, user_id, organization_name, festival_name, city, province,
        contact_name, contact_email, package_id, notes, status, festival_id
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active',$11)`, [
		appId,
		context.userId,
		data.organizer_name,
		data.festival_name,
		data.city,
		data.province,
		data.organizer_name,
		data.contact_email,
		pkg.id,
		copartner ? "Co-partner digital festival" : "Self-serve license",
		fest.id
	]);
	await audit(sql, context.userId, "package.purchase", "festival", fest.id, { package: pkg.slug });
	return {
		...fest,
		copartner
	};
});
var getOccHome_createServerFn_handler = createServerRpc({
	id: "6a085161a4c293a8f34fa49abd412bbc992ddaa37ac758caa3e537410bbe6871",
	name: "getOccHome",
	filename: "src/lib/server/erp.ts"
}, (opts) => getOccHome.__executeServer(opts));
var getOccHome = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).handler(getOccHome_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const ssp = await isSsp(sql, context.userId);
	return {
		festivals: ssp ? await sql.query(`select f.*, p.name as package_name,
              (select count(*)::int from planning_items i where i.festival_id = f.id and i.done) as plan_done,
              (select count(*)::int from planning_items i where i.festival_id = f.id) as plan_total
       from festivals f
       left join license_packages p on p.id = f.package_id
       order by f.starts_on`) : await sql.query(`select f.*, p.name as package_name,
              (select count(*)::int from planning_items i where i.festival_id = f.id and i.done) as plan_done,
              (select count(*)::int from planning_items i where i.festival_id = f.id) as plan_total
       from festivals f
       join festival_members m on m.festival_id = f.id and m.user_id = $1
       left join license_packages p on p.id = f.package_id
       order by f.created_at desc`, [context.userId]),
		apps: ssp ? await sql.query(`select a.*, a.created_at::text as created_at, p.name as package_name
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       order by a.created_at desc limit 8`) : await sql.query(`select a.*, a.created_at::text as created_at, p.name as package_name
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       where a.user_id = $1
       order by a.created_at desc
       limit 8`, [context.userId]),
		ssp
	};
});
var getPlanning_createServerFn_handler = createServerRpc({
	id: "f0a951bebeb6196be0efadf09008ca751421e46a00fb96ec3145b8c8dfe1b912",
	name: "getPlanning",
	filename: "src/lib/server/erp.ts"
}, (opts) => getPlanning.__executeServer(opts));
var getPlanning = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).validator((festivalId) => festivalId).handler(getPlanning_createServerFn_handler, async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	const items = await sql.query(`select * from planning_items where festival_id = $1`, [festivalId]);
	const a = (await sql.query(`select
        (select count(*)::int from events where festival_id = $1) as events,
        (select count(*)::int from sponsors where festival_id = $1) as sponsors,
        (select count(*)::int from festival_pages where festival_id = $1) as pages,
        (select count(*)::int from gate_access_keys where festival_id = $1) as keys`, [festivalId]))[0];
	return {
		items,
		derived: {
			calendar: (a?.events ?? 0) > 0,
			sponsors: (a?.sponsors ?? 0) > 0,
			cms: (a?.pages ?? 0) > 0,
			gate_staff: (a?.keys ?? 0) > 0,
			participant_portal: true
		},
		auto: a
	};
});
var togglePlanning_createServerFn_handler = createServerRpc({
	id: "2a7f2626aa7e74910e4c92864b4102b924c031a9d6dfeae84f029b34aa4a8373",
	name: "togglePlanning",
	filename: "src/lib/server/erp.ts"
}, (opts) => togglePlanning.__executeServer(opts));
var togglePlanning = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(togglePlanning_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	await sql.query(`update planning_items set done = $1 where festival_id = $2 and key = $3`, [
		data.done,
		data.festivalId,
		data.key
	]);
	return { ok: true };
});
var getCmsWorkspace_createServerFn_handler = createServerRpc({
	id: "33838eda7bdfb8efdd73dea270e71669ea72d22a662f3b2c0b47f89afdd81bf6",
	name: "getCmsWorkspace",
	filename: "src/lib/server/erp.ts"
}, (opts) => getCmsWorkspace.__executeServer(opts));
var getCmsWorkspace = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).validator((festivalId) => festivalId).handler(getCmsWorkspace_createServerFn_handler, async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	return {
		pages: await sql.query(`select * from festival_pages where festival_id = $1 order by slug`, [festivalId]),
		blocks: await sql.query(`select * from cms_blocks where festival_id = $1 order by sort_order, id`, [festivalId]),
		festival: (await sql.query(`select * from festivals where id = $1`, [festivalId]))[0]
	};
});
var createCmsPage_createServerFn_handler = createServerRpc({
	id: "4e4b309cde1fe3de4b69679f0dd2ea4e7da264877faaf465578a3aed6057aee4",
	name: "createCmsPage",
	filename: "src/lib/server/erp.ts"
}, (opts) => createCmsPage.__executeServer(opts));
var createCmsPage = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createCmsPage_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const id = newId("pg");
	const slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	await sql.query(`insert into festival_pages (id, festival_id, slug, title, body, published)
       values ($1,$2,$3,$4,'', false)`, [
		id,
		data.festivalId,
		slug,
		data.title
	]);
	return { id };
});
var addCmsBlock_createServerFn_handler = createServerRpc({
	id: "f9d058651a513306f70cdf5f2c0b5d8781092865629e6e9358dfb3cc8e6b442c",
	name: "addCmsBlock",
	filename: "src/lib/server/erp.ts"
}, (opts) => addCmsBlock.__executeServer(opts));
var addCmsBlock = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(addCmsBlock_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const max = await sql.query(`select coalesce(max(sort_order),0)::int as n from cms_blocks where page_id = $1`, [data.pageId]);
	const id = newId("blk");
	await sql.query(`insert into cms_blocks (id, page_id, festival_id, kind, heading, body, meta_json, sort_order, visible)
       values ($1,$2,$3,$4,$5,$6,'{}',$7,true)`, [
		id,
		data.pageId,
		data.festivalId,
		data.kind,
		data.heading,
		data.body,
		(max[0]?.n ?? 0) + 1
	]);
	return { id };
});
var saveCmsBlock_createServerFn_handler = createServerRpc({
	id: "5f8c95a1920810299bbcb03e3eac16058bde661b6326a7d0b25a43810266eee9",
	name: "saveCmsBlock",
	filename: "src/lib/server/erp.ts"
}, (opts) => saveCmsBlock.__executeServer(opts));
var saveCmsBlock = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(saveCmsBlock_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	await sql.query(`update cms_blocks set heading = $1, body = $2, visible = $3 where id = $4 and festival_id = $5`, [
		data.heading,
		data.body,
		data.visible,
		data.id,
		data.festivalId
	]);
	return { ok: true };
});
var publishCmsPage_createServerFn_handler = createServerRpc({
	id: "f8c8ab9dd9f0872d2e15487ca15c9e8376692ac255b90c04506e2437a05b37ce",
	name: "publishCmsPage",
	filename: "src/lib/server/erp.ts"
}, (opts) => publishCmsPage.__executeServer(opts));
var publishCmsPage = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(publishCmsPage_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	await sql.query(`update festival_pages set published = $1, title = $2, body = $3, updated_at = now()
       where id = $4 and festival_id = $5`, [
		data.published,
		data.title,
		data.body,
		data.id,
		data.festivalId
	]);
	if (data.published) await sql.query(`update planning_items set done = true where festival_id = $1 and key = 'cms'`, [data.festivalId]);
	return { ok: true };
});
var getPublicBlocks_createServerFn_handler = createServerRpc({
	id: "46c293b95ef509cf6eb6c97e6ff2aef46dac0b76608b850a0a071d91e811a487",
	name: "getPublicBlocks",
	filename: "src/lib/server/erp.ts"
}, (opts) => getPublicBlocks.__executeServer(opts));
var getPublicBlocks = createServerFn({ method: "GET" }).validator((slug) => slug).handler(getPublicBlocks_createServerFn_handler, async ({ data: slug }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const f = (await sql.query(`select id from festivals where slug = $1`, [slug]))[0];
	if (!f) return [];
	return sql.query(`select b.* from cms_blocks b
       join festival_pages p on p.id = b.page_id
       where b.festival_id = $1 and b.visible = true and p.published = true
       order by b.sort_order`, [f.id]);
});
var getHqEconomics_createServerFn_handler = createServerRpc({
	id: "0a04feb923044438251039f65fea3e5a51fa90bb9bf308e604d6433554d597c2",
	name: "getHqEconomics",
	filename: "src/lib/server/erp.ts"
}, (opts) => getHqEconomics.__executeServer(opts));
var getHqEconomics = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).handler(getHqEconomics_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const apps = await sql.query(`select a.*, a.created_at::text as created_at, p.name as package_name
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       order by a.created_at desc`);
	const income = await sql.query(`select i.*, i.recognized_on::text as recognized_on, f.name as festival_name, s.name as sponsor_name
       from sponsor_income i
       join festivals f on f.id = i.festival_id
       left join sponsors s on s.id = i.sponsor_id
       order by i.recognized_on desc`);
	const totals = await sql.query(`select
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'physical'),0) as physical,
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'digital'),0) as digital,
        (select count(*)::int from participants) as turnout,
        (select count(*)::int from checkins where result = 'valid') as checkins`);
	const byFestival = await sql.query(`select f.id, f.name, f.status, f.copartner,
              (select count(*)::int from participants p where p.festival_id = f.id) as turnout,
              (select count(*)::int from checkins c join events e on e.id = c.event_id where e.festival_id = f.id and c.result = 'valid') as checkins,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'physical'),0) as physical,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'digital'),0) as digital
       from festivals f
       order by f.starts_on`);
	const agreements = await sql.query(`select a.*, f.name as festival_name
       from copartner_agreements a
       join festivals f on f.id = a.festival_id
       order by a.created_at desc`);
	const digital = totals[0]?.digital ?? 0;
	const commission = Math.round(byFestival.filter((f) => f.copartner).reduce((sum, f) => sum + f.digital * .3, 0));
	return {
		apps,
		income,
		totals: totals[0],
		byFestival,
		agreements,
		commission,
		digital
	};
});
var setApplicationStatus_createServerFn_handler = createServerRpc({
	id: "913894b850c54d9f7d1b0bb0d15c8ba88eb1da0a59de2519ee3d14d7bc4b8589",
	name: "setApplicationStatus",
	filename: "src/lib/server/erp.ts"
}, (opts) => setApplicationStatus.__executeServer(opts));
var setApplicationStatus = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(setApplicationStatus_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireSsp(sql, context.userId);
	const app = (await sql.query(`select * from tenant_applications where id = $1`, [data.id]))[0];
	if (!app) throw new Error("Application not found");
	let festivalId = app.festival_id;
	if (data.status === "approved" && !festivalId) {
		const pkg = (await sql.query(`select * from license_packages where id = $1`, [app.package_id]))[0];
		festivalId = (await provisionFestival(sql, {
			userId: app.user_id,
			packageId: app.package_id,
			name: app.festival_name,
			city: app.city,
			province: app.province,
			organizer: app.organization_name,
			email: app.contact_email,
			copartner: pkg?.kind === "copartner"
		})).id;
	}
	await sql.query(`update tenant_applications set status = $1, festival_id = $2 where id = $3`, [
		data.status,
		festivalId,
		data.id
	]);
	await audit(sql, context.userId, "application.status", "application", data.id, { status: data.status });
	return {
		ok: true,
		festivalId
	};
});
var setCopartnerStatus_createServerFn_handler = createServerRpc({
	id: "8059a821df28114672263ff49c300b1e2081970a0035635d8898684611ab94bb",
	name: "setCopartnerStatus",
	filename: "src/lib/server/erp.ts"
}, (opts) => setCopartnerStatus.__executeServer(opts));
var setCopartnerStatus = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(setCopartnerStatus_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireSsp(sql, context.userId);
	await sql.query(`update copartner_agreements set status = $1 where id = $2`, [data.status, data.id]);
	return { ok: true };
});
var getFestivalIncome_createServerFn_handler = createServerRpc({
	id: "6dca4d44dbda2906e660c7650c749fdeb3a9655aa362fd9c4ec7da53825b0e90",
	name: "getFestivalIncome",
	filename: "src/lib/server/erp.ts"
}, (opts) => getFestivalIncome.__executeServer(opts));
var getFestivalIncome = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).validator((festivalId) => festivalId).handler(getFestivalIncome_createServerFn_handler, async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	const rows = await sql.query(`select i.*, i.recognized_on::text as recognized_on, s.name as sponsor_name
       from sponsor_income i
       left join sponsors s on s.id = i.sponsor_id
       where i.festival_id = $1
       order by i.recognized_on desc`, [festivalId]);
	const fest = (await sql.query(`select copartner, name from festivals where id = $1`, [festivalId]))[0];
	const physical = rows.filter((r) => r.channel === "physical").reduce((a, r) => a + r.amount_php, 0);
	const digital = rows.filter((r) => r.channel === "digital").reduce((a, r) => a + r.amount_php, 0);
	return {
		rows,
		physical,
		digital,
		commission: fest?.copartner ? Math.round(digital * .3) : 0,
		copartner: Boolean(fest?.copartner),
		name: fest?.name ?? ""
	};
});
var createDraftFestival_createServerFn_handler = createServerRpc({
	id: "71c9cd28a9b1fbb7de98f152513b3946f6466ab2eb0067499db500253c903885",
	name: "createDraftFestival",
	filename: "src/lib/server/erp.ts"
}, (opts) => createDraftFestival.__executeServer(opts));
var createDraftFestival = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createDraftFestival_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	return provisionFestival(sql, {
		userId: context.userId,
		packageId: null,
		name: data.name,
		city: data.city,
		province: data.province,
		organizer: data.organizer || data.name,
		email: data.email || "",
		copartner: false,
		tagline: data.tagline || "",
		starts_on: data.starts_on,
		ends_on: data.ends_on
	});
});
var payAndPublish_createServerFn_handler = createServerRpc({
	id: "a4a23e09f10088bec8e0af67a64629675fd2213313608cb6d4e8a8b46ee5ec50",
	name: "payAndPublish",
	filename: "src/lib/server/erp.ts"
}, (opts) => payAndPublish.__executeServer(opts));
var payAndPublish = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(payAndPublish_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const pkg = (await sql.query(`select * from license_packages where id = $1`, [data.packageId]))[0];
	if (!pkg) throw new Error("Unknown package");
	const copartner = pkg.kind === "copartner";
	await sql.query(`update festivals set package_id = $1, copartner = $2, status = 'SETUP' where id = $3`, [
		pkg.id,
		copartner,
		data.festivalId
	]);
	await sql.query(`insert into festival_licenses (id, festival_id, package_id, user_id, status) values ($1,$2,$3,$4,'active')`, [
		newId("lic"),
		data.festivalId,
		pkg.id,
		context.userId
	]);
	if (copartner) {
		const commissionPct = pkg.commission_pct ?? 25;
		const notes = pkg.slug === "copartner_pro" ? "Smart Festival Pro Co-Partner — TukodPH full-scale digital organizer, pre-event sponsor outsourcing, on-ground support, and post-event evaluation report (40% revenue share)." : "Digital Festival Lite Co-Partner — TukodPH digital consultant, online CMS, terminals, and 25% revenue share.";
		await sql.query(`insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes) values ($1,$2,$3,'requested',$4,$5)`, [
			newId("cpa"),
			data.festivalId,
			context.userId,
			commissionPct,
			notes
		]);
	}
	await sql.query(`update planning_items set done = true where festival_id = $1 and key = 'go_live'`, [data.festivalId]);
	await audit(sql, context.userId, "festival.pay_publish", "festival", data.festivalId, { package: pkg.slug });
	return {
		ok: true,
		slug: (await sql.query(`select slug from festivals where id = $1`, [data.festivalId]))[0]?.slug,
		copartner
	};
});
//#endregion
export { addCmsBlock_createServerFn_handler, createCmsPage_createServerFn_handler, createDraftFestival_createServerFn_handler, getCmsWorkspace_createServerFn_handler, getFestivalIncome_createServerFn_handler, getHqEconomics_createServerFn_handler, getOccHome_createServerFn_handler, getPlanning_createServerFn_handler, getPublicBlocks_createServerFn_handler, listPackages_createServerFn_handler, myApplications_createServerFn_handler, payAndPublish_createServerFn_handler, publishCmsPage_createServerFn_handler, purchasePackage_createServerFn_handler, saveCmsBlock_createServerFn_handler, setApplicationStatus_createServerFn_handler, setCopartnerStatus_createServerFn_handler, submitApplication_createServerFn_handler, togglePlanning_createServerFn_handler };
