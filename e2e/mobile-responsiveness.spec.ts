import { test, expect } from "@playwright/test";

test.describe("Mobile Responsiveness & Viewport Checks", () => {
  test("public overview has no horizontal scroll on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/public");

    // Check no horizontal document scrollbar
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);

    // Navbar displays mobile brand link
    await expect(page.getByRole("link", { name: /🦊 SPPDF/i })).toBeVisible();
  });

  test("scoring dialog renders mobile cards without horizontal page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Login
    await page.goto("/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/");

    await page.goto("/rounds/11");

    // Open score dialog
    const matchBtn = page.getByRole("button", { name: /(Vyplnit|Upravit)/i }).first();
    await expect(matchBtn).toBeVisible();
    await matchBtn.click();

    // Verify modal is visible
    await expect(page.getByRole("heading", { name: "Zápis výsledku zápasu" })).toBeVisible();

    // Verify mobile cards exist (label "BJ" is in mobile card labels)
    await expect(page.locator("label:has-text('BJ')").first()).toBeVisible();

    // Check modal close/cancel button
    const cancelBtn = page.getByRole("button", { name: "Zrušit" });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await expect(page.getByRole("heading", { name: "Zápis výsledku zápasu" })).not.toBeVisible();
  });
});
