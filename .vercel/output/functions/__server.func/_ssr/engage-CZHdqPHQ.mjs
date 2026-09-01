import { i as createServerFn } from "./ssr2.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-B9YrVm38.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engage-CZHdqPHQ.js
var getVendorDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3d84885b7eb8728530e01fe76387a898ebaebe40422d3e520f6eb91fc82b6c81"));
var addProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("9a1e0b5f39a1b6ab92183d7b4871dae31656f8bd1feadcef195d24a909e65892"));
var setVendorBooster = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("6aa2cf9f654a002200a1b3750c39ebdb8a2201d7f76c417f157cdbd9d182e9df"));
var getSponsorDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("c76f0e1e3c6ac5af31f97d62f0e1649a362fba89dd7843fd5484177e4ec911c9"));
var bumpCampaignScan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((campaignId) => campaignId).handler(createSsrRpc("13b0b12480ea5f94088d010dc98999e20a53309e034ef434394869cf70f3a45a"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("6bc2b1703e13a5ded5a832dfe884ff6e5a0e5f5dd1e2960c322c60aa8ea1cbb9"));
//#endregion
export { setVendorBooster as a, getVendorDesk as i, bumpCampaignScan as n, getSponsorDesk as r, addProduct as t };
