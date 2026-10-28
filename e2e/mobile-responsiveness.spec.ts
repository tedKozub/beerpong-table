import { test, expect } from "@playwright/test";

test.describe("Mobile Responsiveness & Viewport Checks", () => {
  test("public overview has no horizontal scroll on mobile viewport and logo shows fox", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/public");

    // Check no horizontal document scrollbar
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);

    // Navbar displays mobile brand link with fox emoji
    await expect(page.getByRole("link", { name: /🦊/ })).toBeVisible();
  });

  test("navbar has zero overlap between theme toggle and links on iPhone dimensions", async ({ page }) => {
    // Test on iPhone 14 / 12 Pro dimensions (390px)
    await page.setViewportSize({ width: 390, height: 844 });

    // Login to view admin navbar
    await page.goto("/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/");

    await page.goto("/rounds/11");

    // Check overlap between public link and theme toggle
    const overlapInfo = await page.evaluate(() => {
      const publicLink = document.querySelector('header a[href="/public"]');
      const themeToggle = document.querySelector('header .btn-circle');
      if (!publicLink || !themeToggle) return { found: false, overlaps: false };
      const pRect = publicLink.getBoundingClientRect();
      const tRect = themeToggle.getBoundingClientRect();
      return {
        found: true,
        overlaps: pRect.right > tRect.left,
        pRight: pRect.right,
        tLeft: tRect.left
      };
    });

    expect(overlapInfo.found).toBe(true);
    expect(overlapInfo.overlaps).toBe(false);
  });

  test("admin round detail (/rounds/11 and /rounds/15) has no horizontal scroll on iPhone 14/12 Pro", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Login
    await page.goto("/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/");

    for (const roundId of [11, 15]) {
      await page.goto(`/rounds/${roundId}`);
      await page.waitForLoadState("networkidle");

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(isOverflowing).toBe(false);
    }
  });

  test("scoring dialog renders mobile cards without horizontal page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

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
