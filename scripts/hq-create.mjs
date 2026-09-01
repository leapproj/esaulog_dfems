import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://127.0.0.1:8080/ssp/login", { waitUntil: "networkidle" });
await page.fill("#ssp-id", "tukodph_marc");
await page.fill("#ssp-key", "000000");
await page.click("button[type=submit]");
await page.waitForURL("**/ssp", { timeout: 15000 });
await page.waitForTimeout(600);

// Open existing tenant
await page.goto("http://127.0.0.1:8080/ssp/festivals/fst_higalaay2026", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const detail = await page.locator("body").innerText();
await page.screenshot({ path: "/workspace/screenshots/ssp-tenant-detail.png", fullPage: true });
console.log(JSON.stringify({
  url: page.url(),
  hasHigalaay: detail.includes("Higalaay"),
  hasCommand: detail.includes("Open command center"),
  hasStatus: detail.includes("LIVE"),
  errors,
}));

await page.getByRole("link", { name: "Open command center" }).click();
await page.waitForTimeout(1000);
const cmd = await page.locator("body").innerText();
await page.screenshot({ path: "/workspace/screenshots/ssp-command-from-hq.png", fullPage: true });
console.log(JSON.stringify({ commandUrl: page.url(), hasBack: cmd.includes("Back to HQ"), hasHigalaay: cmd.includes("Higalaay") }));

await browser.close();
