import { Page, expect } from "@playwright/test";

export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "SppdfBeerpongAdmin2026!",
};

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="name"]', ADMIN_CREDENTIALS.username);
  await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/$/);
}
