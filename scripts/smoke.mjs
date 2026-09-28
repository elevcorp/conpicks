// Visits routes headlessly and reports console errors / failed requests / HTTP errors.
// Usage: node scripts/smoke.mjs [baseUrl]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const ROUTES = [
  "/", "/weekly", "/weekly?day=완결", "/ranking", "/ranking?tab=league", "/league", "/work/wt_01", "/work/wt_04?tab=info",
  "/work/wt_25?tab=comments", "/work/wt_02?tab=episodes", "/viewer/wt_04/1", "/viewer/wt_02/3", "/viewer/wt_04/6", "/viewer/wt_05/40", "/library", "/my", "/settings", "/search?q=로판",
  "/notifications", "/film", "/film/feed", "/film/ranking", "/film/funding", "/film/work/fm_01", "/film/work/fm_22",
  "/film/collection/jimovie", "/film/collection/SF", "/nope",
];
const browser = await chromium.launch();
let bad = 0;
for (const vp of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  const ctx = await browser.newContext({ viewport: vp });
  await ctx.addInitScript(() => sessionStorage.setItem("cnpx-splash", "1"));
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    const errs = [];
    const onConsole = (m) =>
      m.type() === "error" && !(r === "/nope" && m.text().includes("404")) && errs.push(m.text().split("\n")[0].slice(0, 160));
    const onFail = (res) => res.status() >= 400 && !res.url().includes("/nope") && errs.push(`HTTP ${res.status()} ${res.url()}`);
    page.on("console", onConsole);
    page.on("response", onFail);
    const res = await page.goto(base + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    page.off("console", onConsole);
    page.off("response", onFail);
    const status = res?.status();
    const expected = r === "/nope" ? 404 : 200;
    if (errs.length || status !== expected) {
      bad++;
      console.log(`✗ ${vp.width} ${r} [${status}]`, errs.slice(0, 4));
    }
  }
  await ctx.close();
}
await browser.close();
console.log(bad ? `${bad} route(s) with problems` : "✓ all routes clean");
process.exit(bad ? 1 : 0);
