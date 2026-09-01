import { i as createServerFn } from "./ssr2.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { a as tenantMiddleware } from "./operator-auth-BNvYqwZS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/erp-HZWhHu0d.js
var listPackages = createServerFn({ method: "GET" }).handler(createSsrRpc("5909485e94cdef090ef0f1b561923480a26c4b5840a0e860235687a034fd3f03"));
createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("42b85cbd7e568418b61ce59ebb9b4142b07cf334ae55b99c9678d08e261b68b5"));
createServerFn({ method: "GET" }).middleware([tenantMiddleware]).handler(createSsrRpc("665c2e481d6cc3e2815b13e1758dfd93516014416201c01f7972bee8ad8926a4"));
createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("6b06f03da16489a0792bebd56d4d4ad231881f09ed0c305789b2cf1784b343e8"));
var getOccHome = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).handler(createSsrRpc("6a085161a4c293a8f34fa49abd412bbc992ddaa37ac758caa3e537410bbe6871"));
var getPlanning = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).validator((festivalId) => festivalId).handler(createSsrRpc("f0a951bebeb6196be0efadf09008ca751421e46a00fb96ec3145b8c8dfe1b912"));
var togglePlanning = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("2a7f2626aa7e74910e4c92864b4102b924c031a9d6dfeae84f029b34aa4a8373"));
var getCmsWorkspace = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).validator((festivalId) => festivalId).handler(createSsrRpc("33838eda7bdfb8efdd73dea270e71669ea72d22a662f3b2c0b47f89afdd81bf6"));
var createCmsPage = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("4e4b309cde1fe3de4b69679f0dd2ea4e7da264877faaf465578a3aed6057aee4"));
var addCmsBlock = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("f9d058651a513306f70cdf5f2c0b5d8781092865629e6e9358dfb3cc8e6b442c"));
var saveCmsBlock = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("5f8c95a1920810299bbcb03e3eac16058bde661b6326a7d0b25a43810266eee9"));
var publishCmsPage = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("f8c8ab9dd9f0872d2e15487ca15c9e8376692ac255b90c04506e2437a05b37ce"));
createServerFn({ method: "GET" }).validator((slug) => slug).handler(createSsrRpc("46c293b95ef509cf6eb6c97e6ff2aef46dac0b76608b850a0a071d91e811a487"));
var getHqEconomics = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).handler(createSsrRpc("0a04feb923044438251039f65fea3e5a51fa90bb9bf308e604d6433554d597c2"));
var setApplicationStatus = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("913894b850c54d9f7d1b0bb0d15c8ba88eb1da0a59de2519ee3d14d7bc4b8589"));
var setCopartnerStatus = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("8059a821df28114672263ff49c300b1e2081970a0035635d8898684611ab94bb"));
var getFestivalIncome = createServerFn({ method: "GET" }).middleware([tenantMiddleware]).validator((festivalId) => festivalId).handler(createSsrRpc("6dca4d44dbda2906e660c7650c749fdeb3a9655aa362fd9c4ec7da53825b0e90"));
var createDraftFestival = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("71c9cd28a9b1fbb7de98f152513b3946f6466ab2eb0067499db500253c903885"));
var payAndPublish = createServerFn({ method: "POST" }).middleware([tenantMiddleware]).validator((input) => input).handler(createSsrRpc("a4a23e09f10088bec8e0af67a64629675fd2213313608cb6d4e8a8b46ee5ec50"));
//#endregion
export { getFestivalIncome as a, getPlanning as c, publishCmsPage as d, saveCmsBlock as f, togglePlanning as h, getCmsWorkspace as i, listPackages as l, setCopartnerStatus as m, createCmsPage as n, getHqEconomics as o, setApplicationStatus as p, createDraftFestival as r, getOccHome as s, addCmsBlock as t, payAndPublish as u };
