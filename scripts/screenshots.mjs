// Captures mobile + desktop screenshots of key screens from a running server.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir] [routes...]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [base = "http://localhost:3000", out = "screenshots", ...only] = process.argv.slice(2);
const ROUTES = only.length
  ? only
  : ["/", "/weekly", "/ranking", "/league", "/work/wt_04", "/work/wt_01?tab=episodes", "/viewer/wt_04/1", "/library", "/my"];
const VIEWPORTS = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  pc: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const [name, opts] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ ...opts, locale: "ko-KR" });
  // Skip the once-per-session splash; THEME=light captures light mode.
  await ctx.addInitScript((theme) => {
    sessionStorage.setItem("cnpx-splash", "1");
    localStorage.setItem("cnpx-theme", JSON.stringify({ state: { theme }, version: 0 }));
  }, process.env.THEME === "light" ? "light" : "dark");
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1600); // let enter animations settle
    const file = join(out, `${name}_${route.replace(/[/?=]+/g, "_").replace(/^_|_$/g, "") || "home"}.png`);
    await page.screenshot({ path: file });
    console.log("saved", file);
  }
  await ctx.close();
}
await browser.close();
