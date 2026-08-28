import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

/**
 * Flow (a): 창작자 업로드 → reviewer 승인 2인 → 공개.
 * The upload step is exercised through the API (the wizard's file probe
 * needs a real media file); the review + auto-publish is driven via UI.
 */
test("upload → 2-approval review → published", async ({ page, request }) => {
  // --- creator submits a teaser via the API (creator session cookie) ---
  await loginAs(page, "김레이", "/upload");
  await expect(page.getByText("영상 업로드")).toBeVisible();

  const title = `E2E 테스트작 ${Date.now()}`;
  const res = await page.request.post("/api/teasers", {
    data: {
      title,
      logline: "자동화 테스트용 티저",
      synopsis: "E2E",
      genres: ["SF"],
      tags: ["e2e"],
      durationSec: 120,
      aiTools: ["Sora"],
      credits: "",
      posterUrl: "https://picsum.photos/seed/e2e-p/600/900",
      thumbnailUrl: "https://picsum.photos/seed/e2e-t/960/540",
      playbackUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      videoProvider: "mock",
      videoId: "e2e",
    },
  });
  expect(res.ok()).toBeTruthy();
  const { teaser } = await res.json();
  expect(teaser.status).toBe("submitted");

  // --- reviewer #1 approves ---
  await loginAs(page, "MCN_리원", "/reviewer");
  const card1 = page.locator("article", { hasText: title });
  await expect(card1).toBeVisible();
  await card1.getByRole("button", { name: "승인" }).click();
  await expect(page.getByText(/승인 1\/2/)).toBeVisible();

  // --- reviewer #2 (admin) approves -> auto publish ---
  await loginAs(page, "지무비", "/reviewer");
  const card2 = page.locator("article", { hasText: title });
  await card2.getByRole("button", { name: "승인" }).click();
  await expect(page.getByText(/작품이 공개됐어요/)).toBeVisible();

  // --- teaser now visible publicly ---
  const list = await request.get("/api/teasers?limit=48");
  const body = await list.json();
  expect(
    body.items.some((i: { teaser: { title: string } }) => i.teaser.title === title),
  ).toBeTruthy();
});
