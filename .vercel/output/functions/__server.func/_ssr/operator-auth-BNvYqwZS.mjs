import { i as createServerFn, n as createMiddleware } from "./ssr2.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { r as verifyOperatorToken } from "./crypto-pass-1fMc07Sa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/operator-auth-BNvYqwZS.js
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
var sspMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
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
	if (session.kind !== "ssp") throw new Error("SSP access required");
	return next({ context: {
		userId: session.id,
		operator: session
	} });
});
var signInTenant = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("779cb13377065d339d64d3441f7969673302759e242bea3a51e7eebdccd348cb"));
var signInSsp = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("e0c7f848610c84ba3c98e225a487b0949f13a341e52ae9ed7d983d11234ed852"));
var signUpTenant = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("79c8e26638b7afea5b798a4dd30613b3d796f5bec1b2d35f084fa81e15a1bf75"));
createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("41dc24646959f3df11fc14178c5abda9a2d203ddbf0aabd6e51276bb4e8fb52c"));
createServerFn({ method: "GET" }).middleware([tenantMiddleware]).handler(createSsrRpc("9a2a4385c1b457c9dfafe131e0fa6e6b59d177d0edf41128f172b8a6ab662e02"));
//#endregion
export { tenantMiddleware as a, sspMiddleware as i, signInTenant as n, signUpTenant as r, signInSsp as t };
