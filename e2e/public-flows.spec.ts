import { test, expect } from "@playwright/test";

test.describe("Public Views & Navigation", () => {
  test("loads public homepage with league overview and standings", async ({ page }) => {
    await page.goto("/public");

    // Title and branding
    await expect(page.locator("h1")).toContainText("SPPDF Beerpong");

    // Navigation bar links
    await expect(page.getByRole("link", { name: /🦊/ })).toBeVisible();
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

    // Verify Export dropdown and CSV download
    const exportBtn = page.getByRole("button", { name: /Exportovat výsledky/i });
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();
    const csvOption = page.getByRole("button", { name: /CSV \(\.csv\)/i });
    await expect(csvOption).toBeVisible();
    await csvOption.click();

    // Verify toast notification for export
    await expect(page.getByText("CSV export stažen", { exact: true })).toBeVisible();

    // Verify standings table is visible
    await expect(page.getByRole("heading", { name: /Pořadí večera/i })).toBeVisible();

    // Verify admin score entering hint is NOT visible to public visitors
    await expect(page.getByText("Kliknutím na zápas otevřeš zadání bodů")).not.toBeVisible();
  });

  test("loads about page with authors and system info", async ({ page }) => {
    await page.goto("/about");

    await expect(page.locator("h1")).toContainText("O aplikaci");
    await expect(page.getByText("Tadeáš Kozub").first()).toBeVisible();
    await expect(page.getByText("Petr Hýbl").first()).toBeVisible();
    await expect(page.getByText("Štěpán Řihák").first()).toBeVisible();
    await expect(page.getByText(/IT divize spolku SPPDF MUNI/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /petrsgamers\/beerpong-table/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /tedKozub\/beerpong-table/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Zpět na přehled/i })).not.toBeVisible();
    await expect(page.getByRole("link", { name: /Přejít na design systém/i })).toBeVisible();
  });
});
