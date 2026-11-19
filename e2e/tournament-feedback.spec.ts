import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.fill('input[name="name"]', "admin");
  await page.fill('input[name="password"]', "admin");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/");
}

test.describe("Tournament Feedback & Field-Tested Features", () => {
  test("export dropdown menu clearly offers XLSX as recommended primary action and CSV", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/rounds/11");

    // Open export dropdown
    const exportDropdown = page.getByRole("button", { name: /Exportovat výsledky/i });
    await expect(exportDropdown).toBeVisible();
    await exportDropdown.click();

    // Primary XLSX option
    const xlsxBtn = page.getByRole("button", { name: /Excel \(\.xlsx\)/i });
    await expect(xlsxBtn).toBeVisible();
    await xlsxBtn.click();
    await expect(page.getByText("XLSX export stažen", { exact: true })).toBeVisible();

    // Reopen dropdown and test CSV option
    await exportDropdown.click();
    const csvBtn = page.getByRole("button", { name: /CSV \(\.csv\)/i });
    await expect(csvBtn).toBeVisible();
    await csvBtn.click();
    await expect(page.getByText("CSV export stažen", { exact: true })).toBeVisible();
  });

  test("leaderboard cards display top 5 and open full list dialog with search filter", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/");

    // Leaderboards exist on homepage
    await expect(page.getByRole("heading", { name: "Král střelců semestru" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "BlowJob King semestru" })).toBeVisible();

    // View more button
    const viewMoreBtn = page.getByRole("button", { name: /Zobrazit celý žebříček/i }).first();
    if (await viewMoreBtn.isVisible()) {
      await viewMoreBtn.click();

      // Dialog opens
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByPlaceholder(/Vyhledat hráče/i)).toBeVisible();

      // Search filter works
      await dialog.getByPlaceholder(/Vyhledat hráče/i).fill("nonexistentplayerxyz");
      await expect(dialog.getByText(/Nenalezen žádný hráč/i)).toBeVisible();

      // Close dialog
      await dialog.getByRole("button", { name: "Zavřít" }).click();
      await expect(dialog).not.toBeVisible();
    }
  });

  test("tournament stopwatch is available in schedule and can be started, paused and minimized", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/rounds/11");

    // Stopwatch card exists
    await expect(page.getByRole("heading", { name: "Turnajové stopky" })).toBeVisible();

    // Click Start
    const startBtn = page.getByRole("button", { name: /^Spustit$/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Button transitions to Pause
    const pauseBtn = page.getByRole("button", { name: /Pozastavit/i });
    await expect(pauseBtn).toBeVisible();
    await pauseBtn.click();

    // Minimize button
    const minimizeBtn = page.getByTitle("Minimalizovat do plovoucího widgetu");
    await expect(minimizeBtn).toBeVisible();
    await minimizeBtn.click();

    // Floating pill appears with maximize button
    const maximizeBtn = page.getByTitle("Maximalizovat stopky");
    await expect(maximizeBtn).toBeVisible();
    await maximizeBtn.click();

    // Restores full stopwatch
    await expect(page.getByRole("heading", { name: "Turnajové stopky" })).toBeVisible();

    // Verify presets are strictly 6m and 10m
    await expect(page.getByRole("button", { name: "6m" })).toBeVisible();
    await expect(page.getByRole("button", { name: "10m" })).toBeVisible();
    await expect(page.getByRole("button", { name: "12m" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "15m" })).not.toBeVisible();
  });

  test("stopwatch is NOT present on public pages", async ({ page }) => {
    await page.goto("/public");
    await expect(page.getByRole("heading", { name: "Turnajové stopky" })).not.toBeVisible();

    await page.goto("/public/rounds/11");
    await expect(page.getByRole("heading", { name: "Turnajové stopky" })).not.toBeVisible();
  });

  test("collapsible Odehraná utkání večera can be toggled", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/rounds/11");

    const sectionHeading = page.getByRole("heading", { name: "Odehraná utkání večera" });
    await expect(sectionHeading).toBeVisible();

    // The parent details element is open by default
    const details = page.locator("details:has-text('Odehraná utkání večera')");
    await expect(details).toHaveAttribute("open", "");

    // Click summary to collapse
    await details.locator("summary").click();
    await expect(details).not.toHaveAttribute("open", "");
  });

  test("navbar contains explicit navigation buttons and season selector", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/");

    const vp = page.viewportSize();
    if (vp && vp.width >= 640) {
      await expect(page.getByRole("link", { name: "Přehled ligy" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Správa ligy" })).toBeVisible();
    }
    await expect(page.getByRole("combobox", { name: "Výběr semestru" })).toBeVisible();
  });

  test("opens team detail modal and player detail modal", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/");

    // Click first team button in standings
    const teamBtn = page.locator("table button:has-text('Tým')").first();
    if (await teamBtn.isVisible()) {
      await teamBtn.click();
      await expect(page.getByRole("heading", { name: "Detail týmu" })).toBeVisible();
      await page.getByRole("button", { name: "Zavřít" }).click();
      await expect(page.getByRole("heading", { name: "Detail týmu" })).not.toBeVisible();
    }

    // Click player button in leaderboard
    const playerBtn = page.locator("[role='button']:has-text('Hráč')").first();
    if (await playerBtn.isVisible()) {
      await playerBtn.click();
      await expect(page.getByRole("heading", { name: "Detail hráče" })).toBeVisible();
      await page.getByRole("button", { name: "Zavřít" }).click();
      await expect(page.getByRole("heading", { name: "Detail hráče" })).not.toBeVisible();
    }
  });
});
