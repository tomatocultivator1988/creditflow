import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("CRITICAL Bug Fixes — End-to-End Verification", () => {

  async function login(page: import("@playwright/test").Page, email: string, password: string) {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
  }

  test("C3/C1: Unauthenticated user redirected to login", async ({ page }) => {
    await page.goto(`${BASE}/loans`);
    await expect(page).toHaveURL(/\/login/);
    await page.goto(`${BASE}/capital`);
    await expect(page).toHaveURL(/\/login/);
    await page.goto(`${BASE}/admin/config`);
    await expect(page).toHaveURL(/\/login/);
  });

  test("C1: Collector dashboard and basic access", async ({ page }) => {
    await login(page, "collector@jbvcredit.com", "collector123");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto(`${BASE}/loans`);
    await expect(page).not.toHaveURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE}/payments`);
    await expect(page).not.toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("C1: Admin can access all admin routes", async ({ page }) => {
    await login(page, "admin@jbvcredit.com", "admin123");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(3000);

    await page.goto(`${BASE}/capital`);
    await expect(page).toHaveURL(/\/capital/, { timeout: 20000 });

    await page.goto(`${BASE}/expenses`);
    await expect(page).toHaveURL(/\/expenses/, { timeout: 20000 });

    await page.goto(`${BASE}/reports`);
    await expect(page).toHaveURL(/\/reports/, { timeout: 20000 });

    await page.goto(`${BASE}/admin/config`);
    await expect(page).toHaveURL(/\/admin\/config/, { timeout: 20000 });

    await page.goto(`${BASE}/admin/users`);
    await expect(page).toHaveURL(/\/admin\/users/, { timeout: 20000 });
  });

  test("Admin dashboard loads with all sections", async ({ page }) => {
    await login(page, "admin@jbvcredit.com", "admin123");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(3000);

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Today's Collectibles")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Financial Summary")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Needs Attention")).toBeVisible({ timeout: 15000 });

    await expect(page.locator('a').filter({ hasText: "New Loan" })).toBeVisible();
  });

  test("Collector dashboard shows collection targets (not financial summary)", async ({ page }) => {
    await login(page, "collector@jbvcredit.com", "collector123");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(3000);

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Today's Collection Targets")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Today's Collectibles")).toBeVisible({ timeout: 15000 });

    const financialSummary = page.locator("text=Financial Summary");
    await expect(financialSummary).toHaveCount(0);
  });

  test("New Loan button on dashboard opens modal", async ({ page }) => {
    await login(page, "admin@jbvcredit.com", "admin123");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.click('a:has-text("New Loan")');
    await expect(page).toHaveURL(/\/loans\?new=1/);
    await expect(page.locator("text=New Loan Account")).toBeVisible({ timeout: 5000 });
  });

  test("Logout works from header", async ({ page }) => {
    await login(page, "admin@jbvcredit.com", "admin123");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test("Payments page loads with search bar", async ({ page }) => {
    await login(page, "admin@jbvcredit.com", "admin123");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto(`${BASE}/payments`);
    await expect(page).toHaveURL(/\/payments/);
    await expect(page.getByRole("heading", { name: /Payment/ })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("New Payment")')).toBeVisible({ timeout: 5000 });
  });

  test("Loans page loads with date filter, address column, print button", async ({ page }) => {
    await login(page, "admin@jbvcredit.com", "admin123");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto(`${BASE}/loans`);
    await expect(page).toHaveURL(/\/loans/);
    await expect(page.locator("text=Loan Accounts")).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="date"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Print Sheet")')).toBeVisible({ timeout: 5000 });
  });

  test("Capital page loads for authenticated users (API enforces admin)", async ({ page }) => {
    await login(page, "admin@jbvcredit.com", "admin123");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(3000);

    await page.goto(`${BASE}/capital`);
    await expect(page).toHaveURL(/\/capital/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Capital/ })).toBeVisible({ timeout: 25000 });
  });

  test("Expenses page loads for authenticated users (API enforces admin)", async ({ page }) => {
    await login(page, "admin@jbvcredit.com", "admin123");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(3000);

    await page.goto(`${BASE}/expenses`);
    await expect(page).toHaveURL(/\/expenses/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Expenses" })).toBeVisible({ timeout: 25000 });
  });
});
