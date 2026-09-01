import { r as getSql } from "./db-DeV0fZK1.mjs";
import { i as createServerFn } from "./ssr2.mjs";
import { i as newId, t as createServerRpc } from "./createServerRpc-L9LYBe9K.mjs";
import { a as mapEvent, c as track } from "./helpers-Ceyqsr-3.mjs";
import { t as ensureSeed } from "./seed-BTVIGMLs.mjs";
import { t as authMiddleware } from "./middleware-B9YrVm38.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/participant-DrmKWvwi.js
var getParticipantHome_createServerFn_handler = createServerRpc({
	id: "9e872de8911a4da765c701ff59cadfb62d14017aa4c52e9d5cb9cd4b6129f485",
	name: "getParticipantHome",
	filename: "src/lib/server/participant.ts"
}, (opts) => getParticipantHome.__executeServer(opts));
var getParticipantHome = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getParticipantHome_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const hid = "fst_higalaay2026";
	const festivals = await sql.query(`select * from festivals where id = $1`, [hid]);
	const participant = (await sql.query(`select id, full_name, status from participants where festival_id = $1 and user_id = $2`, [hid, context.userId]))[0] ?? null;
	const epass = participant ? (await sql.query(`select * from epasses where participant_id = $1`, [participant.id]))[0] : null;
	const events = await sql.query(`select e.*, v.name as venue_name, c.name as category_name,
              exists(select 1 from event_registrations r where r.event_id = e.id and r.participant_id = $2) as registered
       from events e
       left join venues v on v.id = e.venue_id
       left join event_categories c on c.id = e.category_id
       where e.festival_id = $1 and e.published = true
       order by e.starts_at`, [hid, participant?.id ?? ""]);
	const missions = await sql.query(`select m.*, b.name as badge_name from missions m
       left join badges b on b.id = m.badge_id
       where m.festival_id = $1 and m.active = true`, [hid]);
	const checkins = participant ? await sql.query(`select count(*)::int as n from checkins c
           join epasses ep on ep.id = c.epass_id
           where ep.participant_id = $1 and c.result = 'valid'`, [participant.id]) : [{ n: 0 }];
	const points = participant ? await sql.query(`select points from participant_points where participant_id = $1`, [participant.id]) : [];
	const badges = participant ? await sql.query(`select b.* from participant_badges pb join badges b on b.id = pb.badge_id
           where pb.participant_id = $1`, [participant.id]) : [];
	const vendors = await sql.query(`select * from vendors where festival_id = $1 order by booster desc, name`, [hid]);
	const rewards = await sql.query(`select * from rewards where festival_id = $1`, [hid]);
	const offers = await sql.query(`select o.id, o.title, o.description, o.code, v.name as vendor_name
       from offers o join vendors v on v.id = o.vendor_id
       where o.festival_id = $1 and o.active = true`, [hid]);
	const withProgress = missions.map((m) => {
		const n = checkins[0]?.n ?? 0;
		const progress = m.condition_type === "checkins" ? Math.min(m.condition_value, n) : 0;
		return {
			...m,
			progress,
			completed: progress >= m.condition_value
		};
	});
	return {
		festival: festivals[0],
		participant,
		epass: epass ? {
			...epass,
			issued_at: String(epass.issued_at),
			expires_at: epass.expires_at ? String(epass.expires_at) : null
		} : null,
		events: events.map((e) => ({
			...mapEvent(e),
			registered: Boolean(e.registered)
		})),
		missions: withProgress,
		points: points[0]?.points ?? 0,
		badges,
		vendors,
		rewards,
		offers
	};
});
var registerForEvent_createServerFn_handler = createServerRpc({
	id: "cd236fc19e0abc85cadeaa8edfe5f3968aaf84acca09046383b902acb473fa51",
	name: "registerForEvent",
	filename: "src/lib/server/participant.ts"
}, (opts) => registerForEvent.__executeServer(opts));
var registerForEvent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((eventId) => eventId).handler(registerForEvent_createServerFn_handler, async ({ context, data: eventId }) => {
	const sql = await getSql();
	const me = await sql.query(`select id from participants where user_id = $1 limit 1`, [context.userId]);
	if (!me[0]) throw new Error("Register for the festival first");
	await sql.query(`insert into event_registrations (id, event_id, participant_id, status)
       values ($1,$2,$3,'registered') on conflict do nothing`, [
		newId("reg"),
		eventId,
		me[0].id
	]);
	const ev = await sql.query(`select festival_id from events where id = $1`, [eventId]);
	await track(sql, {
		name: "event_registered",
		festivalId: ev[0]?.festival_id,
		userId: context.userId,
		participantId: me[0].id,
		payload: { eventId }
	});
	return { ok: true };
});
var selfCheckIn_createServerFn_handler = createServerRpc({
	id: "9229c1474bf20cfe2c4f7a215a9fe59a37fd37434eae1b8587c19cc46f459509",
	name: "selfCheckIn",
	filename: "src/lib/server/participant.ts"
}, (opts) => selfCheckIn.__executeServer(opts));
var selfCheckIn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((eventId) => eventId).handler(selfCheckIn_createServerFn_handler, async ({ context, data: eventId }) => {
	const sql = await getSql();
	const me = await sql.query(`select id from participants where user_id = $1 limit 1`, [context.userId]);
	if (!me[0]) throw new Error("No participant profile");
	const ep = await sql.query(`select id from epasses where participant_id = $1`, [me[0].id]);
	if (!ep[0]) throw new Error("No ePASS");
	if ((await sql.query(`select id from checkins where epass_id = $1 and event_id = $2 and result = 'valid'`, [ep[0].id, eventId]))[0]) return {
		ok: false,
		reason: "Already checked in"
	};
	await sql.query(`insert into checkins (id, epass_id, event_id, result, reason) values ($1,$2,$3,'valid','self')`, [
		newId("chk"),
		ep[0].id,
		eventId
	]);
	await track(sql, {
		name: "checkin_completed",
		userId: context.userId,
		participantId: me[0].id,
		payload: {
			eventId,
			mode: "self"
		}
	});
	return { ok: true };
});
var castVote_createServerFn_handler = createServerRpc({
	id: "93835dd2a8c06a760650d2adcb33c3604c5ece8afdaa5a0f3339d899ab03da0b",
	name: "castVote",
	filename: "src/lib/server/participant.ts"
}, (opts) => castVote.__executeServer(opts));
var castVote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(castVote_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const me = await sql.query(`select id from participants where user_id = $1 limit 1`, [context.userId]);
	if (!me[0]) throw new Error("No participant profile");
	await sql.query(`insert into votes (id, event_id, participant_id, choice) values ($1,$2,$3,$4)
       on conflict (event_id, participant_id) do update set choice = excluded.choice`, [
		newId("vot"),
		data.eventId,
		me[0].id,
		data.choice
	]);
	await track(sql, {
		name: "vote_cast",
		userId: context.userId,
		participantId: me[0].id,
		payload: { choice: data.choice }
	});
	return { ok: true };
});
var claimReward_createServerFn_handler = createServerRpc({
	id: "ef19817eceed4246e2e2941a26497e977ba47ba0f4fa0281b4c170fe65a86f3b",
	name: "claimReward",
	filename: "src/lib/server/participant.ts"
}, (opts) => claimReward.__executeServer(opts));
var claimReward = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((rewardId) => rewardId).handler(claimReward_createServerFn_handler, async ({ context, data: rewardId }) => {
	const sql = await getSql();
	const me = await sql.query(`select id from participants where user_id = $1 limit 1`, [context.userId]);
	if (!me[0]) throw new Error("No participant profile");
	const reward = await sql.query(`select points_cost, inventory from rewards where id = $1`, [rewardId]);
	if (!reward[0] || reward[0].inventory <= 0) throw new Error("Reward unavailable");
	if (((await sql.query(`select points from participant_points where participant_id = $1`, [me[0].id]))[0]?.points ?? 0) < reward[0].points_cost) throw new Error("Not enough points");
	await sql.query(`update participant_points set points = points - $1, updated_at = now() where participant_id = $2`, [reward[0].points_cost, me[0].id]);
	await sql.query(`update rewards set inventory = inventory - 1 where id = $1`, [rewardId]);
	await sql.query(`insert into redemptions (id, reward_id, participant_id, status) values ($1,$2,$3,'claimed')`, [
		newId("rdm"),
		rewardId,
		me[0].id
	]);
	await track(sql, {
		name: "reward_claimed",
		userId: context.userId,
		participantId: me[0].id,
		payload: { rewardId }
	});
	return { ok: true };
});
var issueCoupon_createServerFn_handler = createServerRpc({
	id: "a800e7d50fc7ed0c555dd0d2ddee363f1f86d2eae85cc7d3823c9d0e804d1d13",
	name: "issueCoupon",
	filename: "src/lib/server/participant.ts"
}, (opts) => issueCoupon.__executeServer(opts));
var issueCoupon = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((offerId) => offerId).handler(issueCoupon_createServerFn_handler, async ({ context, data: offerId }) => {
	const sql = await getSql();
	const me = await sql.query(`select id from participants where user_id = $1 limit 1`, [context.userId]);
	if (!me[0]) throw new Error("No participant profile");
	const code = `${(await sql.query(`select code from offers where id = $1`, [offerId]))[0]?.code || "HIGALA"}-${me[0].id.slice(-4).toUpperCase()}`;
	await sql.query(`insert into coupons (id, offer_id, participant_id, code, status) values ($1,$2,$3,$4,'issued')`, [
		newId("cpn"),
		offerId,
		me[0].id,
		code
	]);
	await track(sql, {
		name: "coupon_redeemed",
		userId: context.userId,
		participantId: me[0].id
	});
	return { code };
});
//#endregion
export { castVote_createServerFn_handler, claimReward_createServerFn_handler, getParticipantHome_createServerFn_handler, issueCoupon_createServerFn_handler, registerForEvent_createServerFn_handler, selfCheckIn_createServerFn_handler };
