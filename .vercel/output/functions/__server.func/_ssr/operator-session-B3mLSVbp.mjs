import { r as __exportAll } from "../_runtime.mjs";
import { c as __exportAll$1 } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/operator-session-B3mLSVbp.js
var operator_session_B3mLSVbp_exports = /* @__PURE__ */ __exportAll({
	i: () => setOperatorSession,
	n: () => getOperatorProfile,
	r: () => operator_session_exports,
	t: () => clearOperatorSession
});
var operator_session_exports = /* @__PURE__ */ __exportAll$1({
	clearOperatorSession: () => clearOperatorSession,
	getOperatorProfile: () => getOperatorProfile,
	getOperatorToken: () => getOperatorToken,
	setOperatorSession: () => setOperatorSession
});
var TOKEN_KEY = "esaulog.operator.token";
var PROFILE_KEY = "esaulog.operator.profile";
function getOperatorToken() {
	if (typeof window === "undefined") return null;
	try {
		return window.sessionStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}
function getOperatorProfile() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.sessionStorage.getItem(PROFILE_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function setOperatorSession(token, profile) {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.setItem(TOKEN_KEY, token);
		window.sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
		document.cookie = `esaulog_op=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
	} catch {}
}
function clearOperatorSession() {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.removeItem(TOKEN_KEY);
		window.sessionStorage.removeItem(PROFILE_KEY);
		document.cookie = "esaulog_op=; path=/; max-age=0; SameSite=Lax";
	} catch {}
}
//#endregion
export { setOperatorSession as i, getOperatorProfile as n, operator_session_B3mLSVbp_exports as r, clearOperatorSession as t };
