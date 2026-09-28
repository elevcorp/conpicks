import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

/**
 * Flow (b): 좋아요 / 공유 → 랭킹 점수 반영.
 * Hammer a low-ranked teaser with shares (weight 10), recompute, assert
 * its rank improved.
 */
test("reactions raise a teaser's ranking after recompute", async ({ page }) => {
  await loginAs(page, "오로라킴", "/");

  const before = await (await page.request.get("/api/ranking?limit=50")).json();
  const ranked = before.items.filter((i: { rank: number }) => i.rank > 0);
  const target = ranked[ranked.length - 1]; // lowest *ranked* teaser
  expect(target?.rank).toBeGreaterThan(3);

  // 20 shares from the API (each counts; spam cap is per-user/day = 3,
  // so also add likes to be safe)
  for (let i = 0; i < 25; i++) {
    await page.request.post(`/api/teasers/${target.teaser_id}/share`, {
      data: { channel: "link" },
    });
  }
  await page.request.post(`/api/teasers/${target.teaser_id}/like`);

  // recompute (admin session needed for the action; use the cron route)
  const cron = await page.request.post(
    "/api/cron/recompute-ranking?secret=dev-cron-secret",
  );
  expect(cron.ok()).toBeTruthy();

  const after = await (await page.request.get("/api/ranking?limit=50")).json();
  const now = after.items.find(
    (i: { teaser_id: string }) => i.teaser_id === target.teaser_id,
  );
  expect(now.rank).toBeLessThan(target.rank);
});
