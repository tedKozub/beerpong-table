import { test, expect } from "@playwright/test";

test.describe("Public Views & Navigation", () => {
  test("loads public homepage with league overview and standings", async ({ page }) => {
    await page.goto("/public");

    // Title and branding
    await expect(page.locator("h1")).toContainText("SPPDF Beerpong");

    // Navigation bar links
    await expect(page.getByRole("link", { name: "🦊 SPPDF" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Admin \/ Zápis/i })).toBeVisible();

    // Section for rounds
    await expect(page.getByRole("heading", { name: /Turnajové večery/i })).toBeVisible();

    // Standings table
    await expect(page.getByRole("heading", { name: /Celkové Týmové Pořadí/i })).toBeVisible();
  });

  test("loads round public detail with schedule, copy link, and csv export", async ({ page, context }) => {
    // Grant clipboard permissions for copy link test
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/public/rounds/11");

    // Check round header
    await expect(page.locator("h1")).toBeVisible();

    // Verify Copy Link button
    const copyBtn = page.getByRole("button", { name: /Kopírovat veřejný odkaz/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Verify toast notification for copy
    await expect(page.getByText("Odkaz zkopírován", { exact: true })).toBeVisible();

    // Verify Export CSV button
    const exportBtn = page.getByRole("button", { name: /Export CSV/i });
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Verify toast notification for export
    await expect(page.getByText("CSV export stažen", { exact: true })).toBeVisible();

    // Verify standings table is visible
    await expect(page.getByRole("heading", { name: /Pořadí večera/i })).toBeVisible();
  });

  test("loads about page with rules and system info", async ({ page }) => {
    await page.goto("/about");

    await expect(page.locator("h1")).toContainText("O aplikaci & Pravidla ligy");
    await expect(page.getByText("VIP Oznámení")).toBeVisible();
    await expect(page.getByRole("link", { name: /Zpět na přehled/i })).toBeVisible();
  });
});
