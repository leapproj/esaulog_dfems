import { i as createServerFn } from "./ssr2.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/public-afjHg-9_.js
var getHomeData = createServerFn({ method: "GET" }).handler(createSsrRpc("8e516e6c233a5b7ed69769059de3433e6aaa7835b16e18357cec1779bd83c31e"));
var getPublicFestival = createServerFn({ method: "GET" }).validator((slug) => slug).handler(createSsrRpc("f86409414aa016d4b0087e45dde5d9f6e6651674bcd7b9cc4b7e9c272b5bb51f"));
createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("d269b08ac9ba0ab75bd557aa59db9af6165d500115f955dea95f122c71ff3e4f"));
var listFestivalCatalog = createServerFn({ method: "GET" }).handler(createSsrRpc("0b9ccbae418bd88dd14acdc4a61675478b94126c9e436eddd3c7ad68301a671b"));
var getFestivalHub = createServerFn({ method: "GET" }).validator((slug) => slug).handler(createSsrRpc("d2ddcba5805f48dc6c02b11119d78835d91643f55836e5a250b8ccbe1e474efa"));
var submitPartnerRequest = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("0b7358bee5bc7b1e0568a31b92f901d528eb6271f3108fda875510f3d082da43"));
//#endregion
export { submitPartnerRequest as a, listFestivalCatalog as i, getHomeData as n, getPublicFestival as r, getFestivalHub as t };
