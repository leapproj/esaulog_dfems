import { i as createServerFn } from "./ssr2.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { i as sspMiddleware } from "./operator-auth-BNvYqwZS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ssp-GAJfNAfc.js
var getSspOverview = createServerFn({ method: "GET" }).middleware([sspMiddleware]).handler(createSsrRpc("0cb38cb4613649ce0145b4654c86371a5c018907a8952aacc32a6fac0ded2289"));
var getSspIntelligence = createServerFn({ method: "GET" }).middleware([sspMiddleware]).handler(createSsrRpc("2993142267a99944f63b4bb133e7b0d71747fe62983807d73e9c0d3bf8d59eea"));
var listNetworkEvents = createServerFn({ method: "GET" }).middleware([sspMiddleware]).handler(createSsrRpc("56d7eb32a81cd238a29a0b935dff2b446d722325a0b755699eaeb0290f59f836"));
var createFestivalTenant = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createSsrRpc("5c358a927533004cc3a723e5e17e8ce1779c55f5dcc55ce5d219ed1da4fe4477"));
var updateFestivalStatus = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createSsrRpc("2e85a117ad835b49b9f185830d89cd95329a06beff2dfd34680509d2dfa9a81b"));
var setFestivalCopartner = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createSsrRpc("eba8b6c96ba39165987019ed6a8e548ff773e6cef8b10022c0b88db9995f81cc"));
var hqGoLive = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createSsrRpc("b8cf01e2ef1e394fb727cf91241c2498afd9b224b65ddc821e6d5a947771ea1a"));
var setNetworkEventStatus = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createSsrRpc("152e2a4d94576b38d77d27a3f9a52f2422662ada62d22bae67edd58ad195d734"));
var hqCreateEvent = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createSsrRpc("22d0b8891b9b17c4a397b885cc8e3bebae5a43718db084dd94a4b089f5f96b17"));
var getSspNetwork = createServerFn({ method: "GET" }).middleware([sspMiddleware]).handler(createSsrRpc("3d9f56690da9f932d492b834889a1758a6799257d941111f8c40af78ff109a54"));
var rotateSspPasskey = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createSsrRpc("9cc91271a8bd31e72c39293142e80c56b2b4f50f7e99df7baf95afb286881385"));
var updateFestivalIdentity = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createSsrRpc("4810316b352244dae7287de20f5de698f361b825e2d0655306127d3d452cae65"));
var issueTenantOperator = createServerFn({ method: "POST" }).middleware([sspMiddleware]).validator((input) => input).handler(createSsrRpc("04092cd22d137e3111d025a0e2b38acc97849d5deef1a6abb6cb555a6dabbcc5"));
//#endregion
export { hqCreateEvent as a, listNetworkEvents as c, setNetworkEventStatus as d, updateFestivalIdentity as f, getSspOverview as i, rotateSspPasskey as l, getSspIntelligence as n, hqGoLive as o, updateFestivalStatus as p, getSspNetwork as r, issueTenantOperator as s, createFestivalTenant as t, setFestivalCopartner as u };
