import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/crypto-pass-1fMc07Sa.js
var SECRET = "esaulog-dfems-operator-v1";
function hashPass(pass) {
	const salt = randomBytes(16).toString("hex");
	return `${salt}:${scryptSync(pass, salt, 32).toString("hex")}`;
}
function verifyPass(pass, stored) {
	const [salt, hash] = stored.split(":");
	if (!salt || !hash) return false;
	const next = scryptSync(pass, salt, 32);
	const prev = Buffer.from(hash, "hex");
	if (next.length !== prev.length) return false;
	return timingSafeEqual(prev, next);
}
function signOperator(payload) {
	const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
	return `${body}.${createHmac("sha256", SECRET).update(body).digest("base64url")}`;
}
function verifyOperatorToken(token) {
	if (!token) return null;
	const [body, sig] = token.split(".");
	if (!body || !sig) return null;
	const expect = createHmac("sha256", SECRET).update(body).digest("base64url");
	const a = Buffer.from(sig);
	const b = Buffer.from(expect);
	if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	try {
		const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
		if (!payload?.id || payload.exp < Date.now()) return null;
		return payload;
	} catch {
		return null;
	}
}
//#endregion
export { verifyPass as i, signOperator as n, verifyOperatorToken as r, hashPass as t };
