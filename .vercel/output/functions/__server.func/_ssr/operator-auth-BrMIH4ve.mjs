import { r as getSql } from "./db-DeV0fZK1.mjs";
import { i as createServerFn, n as createMiddleware } from "./ssr2.mjs";
import { i as verifyPass, n as signOperator, r as verifyOperatorToken, t as hashPass } from "./crypto-pass-1fMc07Sa.mjs";
import { i as newId, t as createServerRpc } from "./createServerRpc-L9LYBe9K.mjs";
import { t as ensureSeed } from "./seed-BTVIGMLs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/operator-auth-BrMIH4ve.js
var OperatorUnauthorized = class extends Error {
	status = 401;
	constructor() {
		super("Unauthorized");
		this.name = "UnauthorizedError";
	}
};
var tenantMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getOperatorToken } = await import("./operator-session-B3mLSVbp.mjs").then((n) => n.r).then((n) => n.r);
	return next({ sendContext: { operatorToken: getOperatorToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	let token = context.operatorToken;
	if (!token) {
		const { getCookie } = await import("./ssr.mjs").then((n) => n.s).then((n) => n.t);
		token = getCookie("esaulog_op");
	}
	const session = verifyOperatorToken(token);
	if (!session) throw new OperatorUnauthorized();
	return next({ context: {
		userId: session.id,
		operator: session
	} });
});
function issue(row) {
	const profile = {
		id: row.id,
		username: row.username,
		kind: row.kind,
		display_name: row.display_name || row.username
	};
	return {
		token: signOperator({
			...profile,
			exp: Date.now() + 6048e5
		}),
		profile
	};
}
var signInTenant_createServerFn_handler = createServerRpc({
	id: "779cb13377065d339d64d3441f7969673302759e242bea3a51e7eebdccd348cb",
	name: "signInTenant",
	filename: "src/lib/server/operator-auth.ts"
}, (opts) => signInTenant.__executeServer(opts));
var signInTenant = createServerFn({ method: "POST" }).validator((input) => input).handler(signInTenant_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const username = data.username.trim().toLowerCase();
	const row = (await sql.query(`select * from operator_accounts where lower(username) = $1`, [username]))[0];
	if (!row) throw new Error("Invalid tenant User ID or passkey");
	if (row.kind === "ssp") throw new Error("This is a TukodPH Super Admin account, not a Festival Tenant account. Please sign in via TukodPH SSP Headquarters at /ssp/login.");
	if (!verifyPass(data.password, row.pass_hash)) throw new Error("Invalid tenant passkey");
	await sql.query(`update operator_accounts set last_seen_at = now() where id = $1`, [row.id]);
	return issue(row);
});
var signInSsp_createServerFn_handler = createServerRpc({
	id: "e0c7f848610c84ba3c98e225a487b0949f13a341e52ae9ed7d983d11234ed852",
	name: "signInSsp",
	filename: "src/lib/server/operator-auth.ts"
}, (opts) => signInSsp.__executeServer(opts));
var signInSsp = createServerFn({ method: "POST" }).validator((input) => input).handler(signInSsp_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const username = data.username.trim().toLowerCase();
	const cleanUsername = username.replace(/^tukodph[_-]/, "");
	const row = (await sql.query(`select * from operator_accounts where 
        lower(username) = $1 
        or lower(username) = $2 
        or ('tukodph_' || lower(username)) = $1 
        or (id = 'op_ssp_van' and $1 in ('van', 'vanz', 'tukodph_van', 'tukodph_vanz'))
        or (id = 'op_ssp_lanz' and $1 in ('lanz', 'tukodph_lanz'))
        or (id = 'op_ssp_marc' and $1 in ('marc', 'tukodph_marc'))`, [username, cleanUsername]))[0];
	if (!row) throw new Error("Invalid TukodPH Super Admin User ID");
	if (row.kind !== "ssp") throw new Error("This is a Festival Tenant account, not a Super Admin account. Festival tenants must sign in at the Tenant Portal (/login).");
	if (!verifyPass(data.password, row.pass_hash)) throw new Error("Invalid Super Admin passkey");
	await sql.query(`update operator_accounts set last_seen_at = now() where id = $1`, [row.id]);
	return issue(row);
});
var signUpTenant_createServerFn_handler = createServerRpc({
	id: "79c8e26638b7afea5b798a4dd30613b3d796f5bec1b2d35f084fa81e15a1bf75",
	name: "signUpTenant",
	filename: "src/lib/server/operator-auth.ts"
}, (opts) => signUpTenant.__executeServer(opts));
var signUpTenant = createServerFn({ method: "POST" }).validator((input) => input).handler(signUpTenant_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const username = data.username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
	if (username.length < 3) throw new Error("Username must be at least 3 characters");
	if (data.password.length < 6) throw new Error("Passkey must be at least 6 characters");
	if ((await sql.query(`select id from operator_accounts where lower(username) = $1`, [username]))[0]) throw new Error("That ID is already taken");
	const id = newId("op");
	await sql.query(`insert into operator_accounts (id, username, pass_hash, kind, display_name, organization_name, contact_email)
       values ($1,$2,$3,'tenant',$4,$5,$6)`, [
		id,
		username,
		hashPass(data.password),
		data.display_name.trim() || username,
		data.organization_name.trim(),
		data.contact_email.trim()
	]);
	return issue({
		id,
		username,
		kind: "tenant",
		display_name: data.display_name.trim() || username
	});
});
var demoLogin_createServerFn_handler = createServerRpc({
	id: "41dc24646959f3df11fc14178c5abda9a2d203ddbf0aabd6e51276bb4e8fb52c",
	name: "demoLogin",
	filename: "src/lib/server/operator-auth.ts"
}, (opts) => demoLogin.__executeServer(opts));
var demoLogin = createServerFn({ method: "POST" }).validator((input) => input).handler(demoLogin_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	await ensureSeed(sql);
	const username = data.username.trim().toLowerCase();
	const cleanUsername = username.replace(/^tukodph[_-]/, "");
	const row = (await sql.query(`select * from operator_accounts where 
        lower(username) = $1 
        or lower(username) = $2 
        or ('tukodph_' || lower(username)) = $1 
        or (id = 'op_ssp_van' and $1 in ('van', 'vanz', 'tukodph_van', 'tukodph_vanz'))
        or (id = 'op_ssp_lanz' and $1 in ('lanz', 'tukodph_lanz'))
        or (id = 'op_ssp_marc' and $1 in ('marc', 'tukodph_marc'))
        or (id = 'op_higalaay' and $1 in ('higalaay', 'cdo'))
        or (id = 'op_diyandi' and $1 in ('diyandi', 'iligan'))
        or (id = 'op_lanzones' and $1 in ('lanzones', 'camiguin'))
      limit 1`, [username, cleanUsername]))[0];
	if (!row) throw new Error(`Demo account for '${username}' not found.`);
	await sql.query(`update operator_accounts set last_seen_at = now() where id = $1`, [row.id]);
	const issued = issue(row);
	const redirectUrl = data.targetUrl || (row.kind === "ssp" ? "/ssp" : "/hub");
	return {
		...issued,
		redirectUrl
	};
});
var getOperatorMe_createServerFn_handler = createServerRpc({
	id: "9a2a4385c1b457c9dfafe131e0fa6e6b59d177d0edf41128f172b8a6ab662e02",
	name: "getOperatorMe",
	filename: "src/lib/server/operator-auth.ts"
}, (opts) => getOperatorMe.__executeServer(opts));
var getOperatorMe = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).handler(getOperatorMe_createServerFn_handler, async ({ context }) => context.operator);
//#endregion
export { demoLogin_createServerFn_handler, getOperatorMe_createServerFn_handler, signInSsp_createServerFn_handler, signInTenant_createServerFn_handler, signUpTenant_createServerFn_handler };
