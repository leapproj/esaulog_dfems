import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HELPER = `var __defProp = Object.defineProperty;
var __exportAll$1 = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
`;

const root = process.cwd();
const ssr = join(root, ".vercel/output/functions/__server.func/_ssr/ssr.mjs");
const ssr2 = join(root, ".vercel/output/functions/__server.func/_ssr/ssr2.mjs");
const libs = join(root, ".vercel/output/functions/__server.func/_libs");
const pgliteDist = join(root, "node_modules/@electric-sql/pglite/dist");

if (existsSync(ssr)) {
  let src = readFileSync(ssr, "utf8");
  let next = src.replace("ssr_exports as s", "server_default as s");
  next = next.replace("const ssr_exports = {};\n", "");
  if (next !== src) writeFileSync(ssr, next);
}

if (existsSync(ssr2)) {
  let src = readFileSync(ssr2, "utf8");
  const circular = 'import { c as __exportAll$1 } from "./ssr.mjs";\n';
  if (src.includes(circular)) {
    src = src.replace(circular, HELPER);
    writeFileSync(ssr2, src);
  }
}

if (existsSync(libs) && existsSync(pgliteDist)) {
  mkdirSync(libs, { recursive: true });
  for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
    const from = join(pgliteDist, name);
    const to = join(libs, name);
    if (existsSync(from) && !existsSync(to)) copyFileSync(from, to);
  }
}
