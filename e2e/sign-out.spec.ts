import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const EMAIL = `e2e-signout-${Date.now()}@test.earnie`;
const PASSWORD = "TestPass1!";
const FAMILY_NAME = "E2E Signout Family";
const KID_NAME = "Signout Kid";
const KID_PIN = "4321";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function signUp(page: import("@playwright/test").Page) {
  await page.goto("/signup");
  await page.fill("#su-email", EMAIL);
  await page.fill("#su-password", PASSWORD);
  await page.fill("#su-confirm", PASSWORD);
  await page.click('button:has-text("Continue")');
  await page.fill("#su-family-name", FAMILY_NAME);
  await page.click('button:has-text("Create account")');
  await page.waitForURL("**/profile-picker");
}

async function createKid(page: import("@playwright/test").Page) {
  await page.goto("/parent/kids/new");
  await page.getByRole("button", { name: "Continue — customize" }).click();
  await page.getByRole("button", { name: "Continue — name & PIN" }).click();
  await page.getByPlaceholder("e.g. Emma").fill(KID_NAME);
  await page.locator("#kid-pin").fill(KID_PIN);
  await page.locator("#kid-pin-confirm").fill(KID_PIN);
  await page.getByRole("button", { name: "Create profile" }).click();
  await page.waitForURL("**/parent/kids?created=1");
}

async function enterKidApp(page: import("@playwright/test").Page) {
  await page.goto("/profile-picker");
  await page.getByRole("button", { name: new RegExp(KID_NAME) }).click();
  for (const digit of KID_PIN.split("")) {
    await page.getByRole("button", { name: digit, exact: true }).click();
  }
  await page.waitForURL("**/kid/home");
}

test.describe("Sign-out flow", () => {
  test.afterAll(async () => {
    const { data: users } = await admin.auth.admin.listUsers();
    const user = users?.users.find((u) => u.email === EMAIL);
    if (user) {
      const { data: family } = await admin
        .from("families")
        .select("id")
        .eq("parent_user_id", user.id)
        .maybeSingle();

      if (family?.id) {
        const { data: kids } = await admin
          .from("kid_profiles")
          .select("id")
          .eq("family_id", family.id);

        for (const kid of kids ?? []) {
          await admin.from("characters").delete().eq("kid_id", kid.id);
        }
        await admin.from("kid_profiles").delete().eq("family_id", family.id);
        await admin.from("activity_log").delete().eq("family_id", family.id);
        await admin.from("families").delete().eq("id", family.id);
      }

      await admin.auth.admin.deleteUser(user.id);
    }
  });

  test("parent can sign out from settings and protected routes redirect to login", async ({
    page,
  }) => {
    await signUp(page);

    await page.goto("/parent/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await page.getByRole("button", { name: /Sign out/i }).click();

    await page.waitForURL("**/login");
    await expect(page).toHaveURL("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();

    const sbKeys = await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith("sb-"))
    );
    expect(sbKeys).toHaveLength(0);

    await page.goto("/parent/home");
    await page.waitForURL("**/login");
    await expect(page).toHaveURL("/login");
  });

  test("parent can sign out from profile picker", async ({ page }) => {
    await signUp(page);

    await page.getByRole("button", { name: /Sign out/i }).click();
    await page.waitForURL("**/login");
    await expect(page).toHaveURL("/login");
  });

  test("kid can sign out from profile and parent session is cleared", async ({
    page,
  }) => {
    await signUp(page);
    await createKid(page);
    await enterKidApp(page);

    await page.goto("/kid/profile");
    await page.getByRole("button", { name: /Sign out/i }).click();

    await page.waitForURL("**/login");
    await expect(page).toHaveURL("/login");

    const storage = await page.evaluate(() => ({
      sb: Object.keys(localStorage).filter((k) => k.startsWith("sb-")),
      earnie: Object.keys(localStorage).filter((k) => k.startsWith("earnie_")),
    }));
    expect(storage.sb).toHaveLength(0);
    expect(storage.earnie).toHaveLength(0);

    await page.goto("/kid/home");
    await page.waitForURL("**/login");
    await expect(page).toHaveURL("/login");
  });
});
