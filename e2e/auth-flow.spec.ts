import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const EMAIL = `e2e-${Date.now()}@test.earnie`;
const PASSWORD = "TestPass1!";
const FAMILY_NAME = "E2E Test Family";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

test.describe("Signup → Signin flow", () => {
  test.afterAll(async () => {
    // Cleanup: find and delete the test user
    const { data: users } = await admin.auth.admin.listUsers();
    const user = users?.users.find((u) => u.email === EMAIL);
    if (user) {
      // Delete their family row first (cascades to kids, etc.)
      await admin.from("families").delete().eq("parent_user_id", user.id);
      await admin.auth.admin.deleteUser(user.id);
    }
  });

  test("full signup and signin experience", async ({ page }) => {
    // ── Signup ──
    await page.goto("/signup");
    await expect(page.getByText("Create your account")).toBeVisible();

    // Step 1: credentials
    await page.fill("#su-email", EMAIL);
    await page.fill("#su-password", PASSWORD);
    await page.fill("#su-confirm", PASSWORD);
    await page.click('button:has-text("Continue")');

    // Step 2: family name
    await expect(page.getByText("About your family")).toBeVisible();
    await page.fill("#su-family-name", FAMILY_NAME);
    await page.click('button:has-text("Create account")');

    // Redirected to parent home
    await page.waitForURL("/parent/home");

    // ── Sign out (no UI for this yet, clear browser state) ──
    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("sb-")) localStorage.removeItem(key);
      }
    });
    await page.context().clearCookies();

    // ── Sign in ──
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();

    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button:has-text("Sign in")');

    // Redirected to parent home
    await page.waitForURL("/parent/home");
    await expect(page).toHaveURL("/parent/home");
  });
});
