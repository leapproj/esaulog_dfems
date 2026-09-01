import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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

// Populate dist/ directory for deployment platforms expecting standard build artifacts
const dist = join(root, "dist");
const staticDir = join(root, ".vercel/output/static");

mkdirSync(dist, { recursive: true });

if (existsSync(staticDir)) {
  cpSync(staticDir, dist, { recursive: true, force: true });
}

// Ensure dist/index.html exists for static hosts and artifact verification
const distIndex = join(dist, "index.html");
if (!existsSync(distIndex)) {
  let cssHref = "";
  const assetsDir = join(dist, "assets");
  if (existsSync(assetsDir)) {
    const files = readdirSync(assetsDir);
    const cssFile = files.find((f) => f.endsWith(".css"));
    if (cssFile) cssHref = `/assets/${cssFile}`;
  }

  const html = `<!DOCTYPE html>
<html lang="en" class="antialiased">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>eSAULOG DFEMS</title>
    <meta name="theme-color" content="#160910" />
    <meta name="description" content="eSAULOG DFEMS — Digital Festival Operating System for Philippine festivals. Plan, authenticate, engage, and measure." />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/__grok/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/__grok/icon-180.png" />
    ${cssHref ? `<link rel="stylesheet" href="${cssHref}" />` : ""}
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" />
  </head>
  <body class="min-h-screen bg-[#160910] font-sans text-[#fff4e0]">
    <div id="app"></div>
    <script>
      // Fallback reload / router bridge if static host serves index.html
      if (window.location.pathname !== "/" && !window.location.pathname.startsWith("/assets")) {
        window.history.replaceState(null, "", window.location.href);
      }
    </script>
  </body>
</html>`;
  writeFileSync(distIndex, html, "utf8");
}

