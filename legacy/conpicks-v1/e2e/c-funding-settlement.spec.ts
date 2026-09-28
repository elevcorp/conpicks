import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

/**
 * Flow (c): 펀딩 참여 → 관리자 정산 → MY에 배분액 표시.
 */
test("pledge → settlement → payout shown in MY", async ({ page }) => {
  // discover the open campaign id from the home bundle
  const home = await (await page.request.get("/api/home")).json().catch(() => null);
  // fallback: known seed campaign
  const campaignId = home?.funding?.[0]?.campaign?.id ?? "fc_01";

  // --- viewer pledges ---
  await loginAs(page, "한지우", `/funding/${campaignId}`);
  await expect(page.getByText(/펀딩 참여하기/)).toBeVisible();
  const pledge = await page.request.post("/api/funding/pledge", {
    data: { campaignId, amountKrw: 20000 },
  });
  expect(pledge.ok()).toBeTruthy();

  // --- admin runs settlement ---
  await loginAs(page, "지무비", "/admin/settlement");
  const panel = page.locator("section", { hasText: "정산" }).first();
  await expect(page.getByRole("heading", { name: /정산/ })).toBeVisible();

  // add revenue + generate payouts via the panel controls
  const anyPanel = page
    .locator("section")
    .filter({ hasText: "총 참여금" })
    .first();
  await anyPanel.getByPlaceholder("수익 항목").fill("E2E 광고수익");
  await anyPanel.getByPlaceholder("금액").fill("1000000");
  await anyPanel.getByRole("button", { name: "수익 추가" }).click();
  await anyPanel.getByRole("button", { name: "배분액 계산" }).click();
  // payout table row appears
  await expect(anyPanel.getByText("지급 처리").first()).toBeVisible();

  // --- viewer sees a payout figure in MY ---
  await loginAs(page, "한지우", "/my?tab=funding");
  await expect(page.getByText(/예상\/확정 배분/).first()).toBeVisible();
  await expect(page.getByText(/지급 대기|지급 완료/).first()).toBeVisible();
});
