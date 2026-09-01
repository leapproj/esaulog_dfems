import { r as __exportAll } from "../_runtime.mjs";
import { c as __exportAll$1 } from "./ssr.mjs";
import { t as TSS_SERVER_FUNCTION } from "./ssr2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createServerRpc-L9LYBe9K.js
var createServerRpc_L9LYBe9K_exports = /* @__PURE__ */ __exportAll({
	a: () => qrPayload,
	i: () => newId,
	n: () => credentialFromSeq,
	r: () => ids_exports,
	t: () => createServerRpc
});
var ids_exports = /* @__PURE__ */ __exportAll$1({
	credentialFromSeq: () => credentialFromSeq,
	newId: () => newId,
	qrPayload: () => qrPayload
});
function newId(prefix) {
	return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
function credentialFromSeq(seq) {
	return `ESA-${String(seq).padStart(7, "0")}`;
}
function qrPayload(credentialId) {
	return `esaulog:epass:${credentialId}`;
}
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
export { qrPayload as a, newId as i, createServerRpc_L9LYBe9K_exports as n, credentialFromSeq as r, createServerRpc as t };
