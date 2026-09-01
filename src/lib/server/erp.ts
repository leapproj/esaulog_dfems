import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { newId } from "@/lib/ids";
import { tenantMiddleware as MW } from "./operator-auth";
import { audit, requireFestivalMember, requireSsp, isSsp, grantSspOperators } from "./helpers";
import { ensureSeed } from "./seed";

export const PLAN_KEYS = [
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
export const listPackages = createServerFn({ method: "GET" }).handler(async () => {
	const sql = await getSql();
	await ensureSeed(sql);
	return sql.query<any>(`select * from license_packages order by commission_pct, price_php`);
});
export const submitApplication = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const id = newId("app");
	await sql.query<any>(`insert into tenant_applications (
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
export const myApplications = createServerFn({ method: "GET" }).middleware([MW]).handler(async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	return sql.query<any>(`select a.*, a.created_at::text as created_at, p.name as package_name
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       where a.user_id = $1
       order by a.created_at desc`, [context.userId]);
});
async function provisionFestival(sql: Sql, opts: any) {
	const id = newId("fst");
	const slug = `${opts.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id.slice(-4)}`;
	await sql.query<any>(`insert into festivals (
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
		opts.tagline || '',
		opts.starts_on || '2026-11-01',
		opts.ends_on || '2026-11-08',
	]);
	await sql.query<any>(`insert into festival_members (festival_id, user_id, role) values ($1,$2,'admin') on conflict do nothing`, [id, opts.userId]);
	await grantSspOperators(sql, id);
	const pageId = newId("pg");
	await sql.query<any>(`insert into festival_pages (id, festival_id, slug, title, body, published)
     values ($1,$2,'home',$3,'Draft website. Open the CMS to build blocks.', false)`, [
		pageId,
		id,
		opts.name
	]);
	if (opts.packageId) await sql.query<any>(`insert into festival_licenses (id, festival_id, package_id, user_id, status)
     values ($1,$2,$3,$4,'active')`, [
		newId("lic"),
		id,
		opts.packageId,
		opts.userId
	]);
	for (const item of PLAN_KEYS) await sql.query<any>(`insert into planning_items (id, festival_id, key, label, done) values ($1,$2,$3,$4,$5) on conflict do nothing`, [
		newId("pln"),
		id,
		item.key,
		item.label,
		item.key === "identity"
	]);
	if (opts.copartner) {
		const pkg = opts.packageId ? (await sql.query<any>(`select * from license_packages where id = $1`, [opts.packageId]))[0] : null;
		const commissionPct = pkg?.commission_pct ?? 25;
		const notes = pkg?.slug === "copartner_pro"
			? "Smart Festival Pro Co-Partner — TukodPH full-scale digital organizer, pre-event sponsor outsourcing, on-ground support, and post-event evaluation report (40% revenue share)."
			: "Digital Festival Lite Co-Partner — TukodPH digital consultant, online CMS, terminals, and 25% revenue share.";
		await sql.query<any>(`insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes)
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
export const purchasePackage = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const pkg = (await sql.query<any>(`select * from license_packages where id = $1`, [data.package_id]))[0];
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
	await sql.query<any>(`insert into tenant_applications (
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
export const getOccHome = createServerFn({ method: "GET" }).middleware([MW]).handler(async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const ssp = await isSsp(sql, context.userId);
	const festivals = ssp
		? await sql.query<any>(`select f.*, p.name as package_name,
              (select count(*)::int from planning_items i where i.festival_id = f.id and i.done) as plan_done,
              (select count(*)::int from planning_items i where i.festival_id = f.id) as plan_total
       from festivals f
       left join license_packages p on p.id = f.package_id
       order by f.starts_on`)
		: await sql.query<any>(`select f.*, p.name as package_name,
              (select count(*)::int from planning_items i where i.festival_id = f.id and i.done) as plan_done,
              (select count(*)::int from planning_items i where i.festival_id = f.id) as plan_total
       from festivals f
       join festival_members m on m.festival_id = f.id and m.user_id = $1
       left join license_packages p on p.id = f.package_id
       order by f.created_at desc`, [context.userId]);
	const apps = ssp
		? await sql.query<any>(`select a.*, a.created_at::text as created_at, p.name as package_name
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       order by a.created_at desc limit 8`)
		: await sql.query<any>(`select a.*, a.created_at::text as created_at, p.name as package_name
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       where a.user_id = $1
       order by a.created_at desc
       limit 8`, [context.userId]);
	return { festivals, apps, ssp };
});
export const getPlanning = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	const items = await sql.query<any>(`select * from planning_items where festival_id = $1`, [festivalId]);
	const a = (await sql.query<any>(`select
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
export const togglePlanning = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	await sql.query<any>(`update planning_items set done = $1 where festival_id = $2 and key = $3`, [
		data.done,
		data.festivalId,
		data.key
	]);
	return { ok: true };
});
export const getCmsWorkspace = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	return {
		pages: await sql.query<any>(`select * from festival_pages where festival_id = $1 order by slug`, [festivalId]),
		blocks: await sql.query<any>(`select * from cms_blocks where festival_id = $1 order by sort_order, id`, [festivalId]),
		festival: (await sql.query<any>(`select * from festivals where id = $1`, [festivalId]))[0]
	};
});
export const createCmsPage = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const id = newId("pg");
	const slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	await sql.query<any>(`insert into festival_pages (id, festival_id, slug, title, body, published)
       values ($1,$2,$3,$4,'', false)`, [
		id,
		data.festivalId,
		slug,
		data.title
	]);
	return { id };
});
export const addCmsBlock = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const max = await sql.query<any>(`select coalesce(max(sort_order),0)::int as n from cms_blocks where page_id = $1`, [data.pageId]);
	const id = newId("blk");
	await sql.query<any>(`insert into cms_blocks (id, page_id, festival_id, kind, heading, body, meta_json, sort_order, visible)
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
export const saveCmsBlock = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	await sql.query<any>(`update cms_blocks set heading = $1, body = $2, visible = $3 where id = $4 and festival_id = $5`, [
		data.heading,
		data.body,
		data.visible,
		data.id,
		data.festivalId
	]);
	return { ok: true };
});
export const publishCmsPage = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	await sql.query<any>(`update festival_pages set published = $1, title = $2, body = $3, updated_at = now()
       where id = $4 and festival_id = $5`, [
		data.published,
		data.title,
		data.body,
		data.id,
		data.festivalId
	]);
	if (data.published) await sql.query<any>(`update planning_items set done = true where festival_id = $1 and key = 'cms'`, [data.festivalId]);
	return { ok: true };
});
export const getPublicBlocks = createServerFn({ method: "GET" }).validator((slug: any) => slug).handler(async ({ data: slug }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const f = (await sql.query<any>(`select id from festivals where slug = $1`, [slug]))[0];
	if (!f) return [];
	return sql.query<any>(`select b.* from cms_blocks b
       join festival_pages p on p.id = b.page_id
       where b.festival_id = $1 and b.visible = true and p.published = true
       order by b.sort_order`, [f.id]);
});
export const getHqEconomics = createServerFn({ method: "GET" }).middleware([MW]).handler(async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	await requireSsp(sql, context.userId);
	const apps = await sql.query<any>(`select a.*, a.created_at::text as created_at, p.name as package_name
       from tenant_applications a
       join license_packages p on p.id = a.package_id
       order by a.created_at desc`);
	const income = await sql.query<any>(`select i.*, i.recognized_on::text as recognized_on, f.name as festival_name, s.name as sponsor_name
       from sponsor_income i
       join festivals f on f.id = i.festival_id
       left join sponsors s on s.id = i.sponsor_id
       order by i.recognized_on desc`);
	const totals = await sql.query<any>(`select
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'physical'),0) as physical,
        coalesce((select sum(amount_php)::int from sponsor_income where channel = 'digital'),0) as digital,
        (select count(*)::int from participants) as turnout,
        (select count(*)::int from checkins where result = 'valid') as checkins`);
	const byFestival = await sql.query<any>(`select f.id, f.name, f.status, f.copartner,
              (select count(*)::int from participants p where p.festival_id = f.id) as turnout,
              (select count(*)::int from checkins c join events e on e.id = c.event_id where e.festival_id = f.id and c.result = 'valid') as checkins,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'physical'),0) as physical,
              coalesce((select sum(amount_php)::int from sponsor_income i where i.festival_id = f.id and i.channel = 'digital'),0) as digital
       from festivals f
       order by f.starts_on`);
	const agreements = await sql.query<any>(`select a.*, f.name as festival_name
       from copartner_agreements a
       join festivals f on f.id = a.festival_id
       order by a.created_at desc`);
	const digital = totals[0]?.digital ?? 0;
	const commission = Math.round(byFestival.filter((f: any) => f.copartner).reduce((sum: number, f: any) => sum + f.digital * .3, 0));
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
export const setApplicationStatus = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireSsp(sql, context.userId);
	const app = (await sql.query<any>(`select * from tenant_applications where id = $1`, [data.id]))[0];
	if (!app) throw new Error("Application not found");
	let festivalId = app.festival_id;
	if (data.status === "approved" && !festivalId) {
		const pkg = (await sql.query<any>(`select * from license_packages where id = $1`, [app.package_id]))[0];
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
	await sql.query<any>(`update tenant_applications set status = $1, festival_id = $2 where id = $3`, [
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
export const setCopartnerStatus = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireSsp(sql, context.userId);
	await sql.query<any>(`update copartner_agreements set status = $1 where id = $2`, [data.status, data.id]);
	return { ok: true };
});
export const getFestivalIncome = createServerFn({ method: "GET" }).middleware([MW]).validator((festivalId: any) => festivalId).handler(async ({ context, data: festivalId }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, festivalId);
	const rows = await sql.query<any>(`select i.*, i.recognized_on::text as recognized_on, s.name as sponsor_name
       from sponsor_income i
       left join sponsors s on s.id = i.sponsor_id
       where i.festival_id = $1
       order by i.recognized_on desc`, [festivalId]);
	const fest = (await sql.query<any>(`select copartner, name from festivals where id = $1`, [festivalId]))[0];
	const physical = rows.filter((r: any) => r.channel === "physical").reduce((a: number, r: any) => a + r.amount_php, 0);
	const digital = rows.filter((r: any) => r.channel === "digital").reduce((a: number, r: any) => a + r.amount_php, 0);
	return {
		rows,
		physical,
		digital,
		commission: fest?.copartner ? Math.round(digital * .3) : 0,
		copartner: Boolean(fest?.copartner),
		name: fest?.name ?? ""
	};
});


export const createDraftFestival = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
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
		ends_on: data.ends_on,
	});
});

export const payAndPublish = createServerFn({ method: "POST" }).middleware([MW]).validator((input: any) => input).handler(async ({ context, data }) => {
	const sql = await getSql();
	await requireFestivalMember(sql, context.userId, data.festivalId);
	const pkg = (await sql.query<any>(`select * from license_packages where id = $1`, [data.packageId]))[0];
	if (!pkg) throw new Error("Unknown package");
	const copartner = pkg.kind === "copartner";
	await sql.query<any>(`update festivals set package_id = $1, copartner = $2, status = 'SETUP' where id = $3`, [pkg.id, copartner, data.festivalId]);
	await sql.query<any>(`insert into festival_licenses (id, festival_id, package_id, user_id, status) values ($1,$2,$3,$4,'active')`, [newId("lic"), data.festivalId, pkg.id, context.userId]);
	if (copartner) {
		const commissionPct = pkg.commission_pct ?? 25;
		const notes = pkg.slug === "copartner_pro"
			? "Smart Festival Pro Co-Partner — TukodPH full-scale digital organizer, pre-event sponsor outsourcing, on-ground support, and post-event evaluation report (40% revenue share)."
			: "Digital Festival Lite Co-Partner — TukodPH digital consultant, online CMS, terminals, and 25% revenue share.";
		await sql.query<any>(`insert into copartner_agreements (id, festival_id, user_id, status, commission_pct, notes) values ($1,$2,$3,'requested',$4,$5)`, [
			newId("cpa"),
			data.festivalId,
			context.userId,
			commissionPct,
			notes
		]);
	}
	await sql.query<any>(`update planning_items set done = true where festival_id = $1 and key = 'go_live'`, [data.festivalId]);
	await audit(sql, context.userId, "festival.pay_publish", "festival", data.festivalId, { package: pkg.slug });
	const fest = (await sql.query<any>(`select slug from festivals where id = $1`, [data.festivalId]))[0];
	return { ok: true, slug: fest?.slug, copartner };
});
