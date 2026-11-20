import { test, expect } from "@playwright/test";

test.describe("Admin Authentication & Protected Routes", () => {
  test("unauthenticated access redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText("Přihlášení");
  });

  test("shows client validation errors when submitting empty form", async ({ page }) => {
    await page.goto("/login");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Vyplňte prosím uživatelské jméno")).toBeVisible();
    await expect(page.getByText("Vyplňte prosím heslo")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows error toast and alert on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="name"]', "spatne_jmeno");
    await page.fill('input[name="password"]', "spatne_heslo");
    await page.click('button[type="submit"]');

    // Verify error toast and inline alert
    await expect(page.getByText("Chyba přihlášení").first()).toBeVisible();
    await expect(page.getByText("Nesprávné přihlašovací jméno nebo heslo.").first()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("API route /api/auth/login returns 401 on bad credentials and 400 on missing fields", async ({ request }) => {
    // Missing fields
    const resBad = await request.post("/api/auth/login", {
      data: { name: "" },
    });
    expect(resBad.status()).toBe(400);

    // Invalid credentials
    const resUnauthorized = await request.post("/api/auth/login", {
      data: { name: "admin", password: "wrong_password" },
    });
    expect(resUnauthorized.status()).toBe(401);
    const json = await resUnauthorized.json();
    expect(json.error).toBe("Nesprávné přihlašovací jméno nebo heslo.");
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
    const vp = page.viewportSize();
    if (vp && vp.width >= 640) {
      await expect(page.getByRole("link", { name: /(About|O lize)/i })).toBeVisible();
    }

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
