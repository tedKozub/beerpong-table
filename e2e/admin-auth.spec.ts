import { test, expect } from "@playwright/test";

test.describe("Admin Authentication & Protected Routes", () => {
  test("unauthenticated access redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText("Přihlášení");
  });

  test("successful admin login grants access to dashboard and allows logout", async ({ page }) => {
    await page.goto("/login");

    // Fill login form
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("h1")).toContainText("Beerpong liga");

    // Verify navbar elements
    await expect(page.getByRole("link", { name: /🦊/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Veřejné/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /About/i })).toBeVisible();

    // Verify logout via user menu popover
    const userMenu = page.getByRole("button", { name: /Přihlášen jako správce/i });
    await expect(userMenu).toBeVisible();
    await userMenu.click();
    const logoutBtn = page.getByRole("button", { name: /Odhlásit se/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Should redirect back to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
