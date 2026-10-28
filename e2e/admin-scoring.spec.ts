import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.fill('input[name="name"]', "admin");
  await page.fill('input[name="password"]', "admin");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/");
}

test.describe("Admin Round Management & Match Scoring", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("opens round detail and verifies schedule & action buttons", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/rounds/11");

    // Header and round info
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("button", { name: /Kopírovat veřejný odkaz/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Export CSV/i })).toBeVisible();

    // Schedule section
    await expect(page.getByRole("heading", { name: /Rozpis zápasů na stoly/i })).toBeVisible();
  });

  test("opens score dialog, updates match score, and verifies toast confirmation", async ({ page }) => {
    await page.goto("/rounds/11");

    // Click on the first match action button (Vyplnit or Upravit)
    const matchBtn = page.getByRole("button", { name: /(Vyplnit|Upravit)/i }).first();
    await expect(matchBtn).toBeVisible();
    await matchBtn.click();

    // Verify modal opened
    const dialogTitle = page.getByRole("heading", { name: "Zápis výsledku zápasu" });
    await expect(dialogTitle).toBeVisible();

    // Submit button inside dialog
    const saveBtn = page.getByRole("button", { name: /Uložit výsledek zápasu/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify toast confirmation
    await expect(page.getByText("Výsledek zápasu byl uložen", { exact: true })).toBeVisible();

    // Verify dialog closed
    await expect(dialogTitle).not.toBeVisible();
  });
});
