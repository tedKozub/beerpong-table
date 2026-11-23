import { Page, expect } from "@playwright/test";

export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "SppdfBeerpongAdmin2026!",
};

export async function loginAsAdmin(page: Page) {
  const response = await page.request.post("/api/auth/login", {
    data: {
      name: ADMIN_CREDENTIALS.username,
      password: ADMIN_CREDENTIALS.password,
    },
  });
  expect(response.ok()).toBeTruthy();
}
