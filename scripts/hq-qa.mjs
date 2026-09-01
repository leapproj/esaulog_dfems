import { chromium } from "playwright";
import { mkdirSync } from "fs";

mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

async function shot(name) {
  await page.screenshot({ path: `/workspace/screenshots/${name}.png`, fullPage: true });
}

function leakedKeys(text) {
  return text.includes("926324") || text.includes("123456") || text.includes("000000");
}

// 1. SSP login page — must NOT show demo passkeys or user IDs
await page.goto("http://127.0.0.1:8080/ssp/login", { waitUntil: "networkidle" });
const loginText = await page.locator("body").innerText();
await shot("ssp-login");
console.log(
  JSON.stringify({
    step: "login-page",
    leaked: leakedKeys(loginText) || loginText.includes("tukodph_van"),
    hasHq: loginText.includes("Headquarters"),
    hasSsp: loginText.includes("Solution System Portal") || loginText.includes("Super Admin"),
  }),
);

async function signInHq(id, key) {
  await page.goto("http://127.0.0.1:8080/ssp/login", { waitUntil: "networkidle" });
  await page.fill("#ssp-id", id);
  await page.fill("#ssp-key", key);
  await page.click("button[type=submit]");
  await page.waitForURL("**/ssp", { timeout: 20000 });
  await page.waitForTimeout(1200);
}

// 2. Sign in as Van
await signInHq("tukodph_van", "926324");
const hqText = await page.locator("body").innerText();
await shot("ssp-hq");
console.log(
  JSON.stringify({
    step: "hq-van",
    url: page.url(),
    hasHeadquarters: hqText.includes("Headquarters") || hqText.includes("Super Admin"),
    hasVan: hqText.includes("Van"),
    hasHigalaay: hqText.includes("Higalaay"),
    hasCopartner: hqText.includes("Co-partner") || hqText.includes("co-partner"),
    leakedKeys: leakedKeys(hqText),
    hasDashboard: hqText.includes("Dashboard") || hqText.includes("Live tenants"),
  }),
);

// 3. Tenants
await page.goto("http://127.0.0.1:8080/ssp/festivals", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const tenText = await page.locator("body").innerText();
await shot("ssp-tenants");
console.log(
  JSON.stringify({
    step: "tenants",
    hasCreate: tenText.includes("Create as co-partner"),
    hasDiyandi: tenText.includes("Diyandi"),
  }),
);

// 4. Tenant detail + command
const firstTenant = page.locator("a[href*='/ssp/festivals/']").first();
if (await firstTenant.count()) {
  await firstTenant.click();
  await page.waitForTimeout(1000);
  const detText = await page.locator("body").innerText();
  await shot("ssp-tenant-detail");
  console.log(
    JSON.stringify({
      step: "tenant-detail",
      hasCommand: detText.includes("command center") || detText.includes("Command"),
      hasEdit: detText.includes("Edit identity"),
      hasCopartner: detText.includes("Co-partner") || detText.includes("co-partner"),
    }),
  );
}

// 5. Events
await page.goto("http://127.0.0.1:8080/ssp/events", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const evText = await page.locator("body").innerText();
await shot("ssp-events");
console.log(
  JSON.stringify({
    step: "events",
    hasCreate: evText.includes("Create event"),
    hasProgram: evText.includes("Event") || evText.includes("Opening") || evText.includes("Kahimunan"),
  }),
);

// 6. Intelligence
await page.goto("http://127.0.0.1:8080/ssp/analytics", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const intelText = await page.locator("body").innerText();
await shot("ssp-intel");
console.log(
  JSON.stringify({
    step: "intel",
    hasIntel: intelText.includes("Intelligence") || intelText.includes("intelligence"),
    hasCommission: intelText.includes("30%"),
    hasLedger: intelText.includes("Income ledger") || intelText.includes("Physical"),
  }),
);

// 7. Access keys — three Super Admins, no passkeys
await page.goto("http://127.0.0.1:8080/ssp/users", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const opText = await page.locator("body").innerText();
await shot("ssp-operators");
console.log(
  JSON.stringify({
    step: "operators",
    hasVan: opText.includes("Van"),
    hasLanz: opText.includes("Lanz"),
    hasMarc: opText.includes("Marc"),
    hasVanId: opText.includes("tukodph_van"),
    hasLanzId: opText.includes("tukodph_lanz"),
    hasMarcId: opText.includes("tukodph_marc"),
    hasHigalaayTenant: opText.includes("higalaay"),
    leaked: leakedKeys(opText),
  }),
);

// 8. Sign in as Lanz
await page.evaluate(() => {
  sessionStorage.clear();
  document.cookie = "esaulog_op=; path=/; max-age=0";
});
await signInHq("tukodph_lanz", "123456");
const lanzText = await page.locator("body").innerText();
console.log(
  JSON.stringify({
    step: "hq-lanz",
    hasLanz: lanzText.includes("Lanz"),
    hasOps: lanzText.includes("Platform Operations") || lanzText.includes("Super Admin"),
    leaked: leakedKeys(lanzText),
  }),
);

// 9. Sign in as Marc
await page.evaluate(() => {
  sessionStorage.clear();
  document.cookie = "esaulog_op=; path=/; max-age=0";
});
await signInHq("tukodph_marc", "000000");
const marcText = await page.locator("body").innerText();
console.log(
  JSON.stringify({
    step: "hq-marc",
    hasMarc: marcText.includes("Marc"),
    hasOps: marcText.includes("Festival Operations") || marcText.includes("Super Admin"),
    leaked: leakedKeys(marcText),
  }),
);

// 10. Tenant isolation
await page.evaluate(() => {
  sessionStorage.clear();
  document.cookie = "esaulog_op=; path=/; max-age=0";
});
await page.goto("http://127.0.0.1:8080/login", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const userField = (await page.locator("#username").count()) ? "#username" : "#tenant-id";
const passField = (await page.locator("#password").count()) ? "#password" : "#tenant-key";
await page.fill(userField, "higalaay");
await page.fill(passField, "higalaay2026");
await page.click("button[type=submit]");
await page.waitForTimeout(2000);
await page.goto("http://127.0.0.1:8080/ssp", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const blockedUrl = page.url();
await shot("tenant-blocked");
console.log(
  JSON.stringify({
    step: "tenant-isolation",
    url: blockedUrl,
    blocked: !blockedUrl.endsWith("/ssp") && !blockedUrl.match(/\/ssp\/?$/),
  }),
);

console.log(JSON.stringify({ errors }));
await browser.close();
