import { expect, type Page } from "@playwright/test";

/** Mock-mode login: pick a seed account by nickname on /login. */
export async function loginAs(page: Page, nickname: string, next = "/") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByRole("button", { name: new RegExp(nickname) }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

export async function expectVisible(page: Page, text: string | RegExp) {
  await expect(page.getByText(text).first()).toBeVisible();
}
