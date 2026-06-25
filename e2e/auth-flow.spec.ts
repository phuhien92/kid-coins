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
    const { data: users } = await admin.auth.admin.listUsers();
    const user = users?.users.find((u) => u.email === EMAIL);
    if (user) {
      await admin.from("families").delete().eq("parent_user_id", user.id);
      await admin.auth.admin.deleteUser(user.id);
    }
  });

  test("full signup and signin experience", async ({ page }) => {
    page.on("console", (msg) => console.log("[browser]", msg.type(), msg.text()));
    page.on("pageerror", (err) => console.log("[page error]", err.message));

    // ── Signup ──
    await page.goto("/signup");
    await expect(page.getByText("Create your account")).toBeVisible();

    await page.fill("#su-email", EMAIL);
    await page.fill("#su-password", PASSWORD);
    await page.fill("#su-confirm", PASSWORD);
    await page.click('button:has-text("Continue")');

    await expect(page.getByText("About your family")).toBeVisible();
    await page.fill("#su-family-name", FAMILY_NAME);

    // Listen for navigation before clicking
    const navPromise = page.waitForURL("**/parent/home", { timeout: 20000 });
    await page.click('button:has-text("Create account")');

    // Wait a moment to see if errors appear
    await page.waitForTimeout(2000);

    const errorEl = page.locator('[role="alert"]');
    if (await errorEl.isVisible().catch(() => false)) {
      const text = await errorEl.textContent();
      console.log("Error on page:", text);
      await page.screenshot({ path: "test-results/signup-error.png" });
    }

    console.log("Current URL:", page.url());

    await navPromise;
    await expect(page).toHaveURL("/parent/home");

    // ── Sign in ──
    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("sb-")) localStorage.removeItem(key);
      }
    });
    await page.context().clearCookies();

    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();

    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button:has-text("Sign in")');

    await page.waitForURL("/parent/home");
    await expect(page).toHaveURL("/parent/home");
  });
});
