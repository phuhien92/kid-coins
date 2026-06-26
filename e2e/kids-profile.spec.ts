import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const EMAIL = `e2e-kids-${Date.now()}@test.earnie`;
const PASSWORD = "TestPass1!";
const FAMILY_NAME = "E2E Kids Family";
const KID_NAME = "Test Kid";
const KID_PIN = "1234";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

test.describe("Kid profile creation and character customization", () => {
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

  test("parent creates kid, kid customizes character, changes persist", async ({
    page,
  }) => {
    // ── Parent signup ──
    await page.goto("/signup");
    await page.fill("#su-email", EMAIL);
    await page.fill("#su-password", PASSWORD);
    await page.fill("#su-confirm", PASSWORD);
    await page.click('button:has-text("Continue")');
    await page.fill("#su-family-name", FAMILY_NAME);
    await page.click('button:has-text("Create account")');
    await page.waitForURL("**/profile-picker");

    // ── Parent creates kid profile ──
    await page.goto("/parent/kids");
    await page.getByRole("link", { name: "Add a kid" }).click();
    await expect(page).toHaveURL("/parent/kids/new");

    await page.getByPlaceholder("e.g. Emma").fill(KID_NAME);
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("button", { name: "Mint" }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.locator("#kid-pin").fill(KID_PIN);
    await page.locator("#kid-pin-confirm").fill(KID_PIN);
    await page.getByRole("button", { name: "Create profile" }).click();

    await page.waitForURL("**/parent/kids?created=1");
    await expect(page.getByText(KID_NAME)).toBeVisible();

    // ── Kid logs in with PIN ──
    await page.goto("/profile-picker");
    await page.getByRole("button", { name: new RegExp(KID_NAME) }).click();

    for (const digit of KID_PIN.split("")) {
      await page.getByRole("button", { name: digit, exact: true }).click();
    }

    await page.waitForURL("**/kid/home");

    // ── Kid customizes character ──
    await page.goto("/kid/profile");
    await page.getByRole("button", { name: /Edit my character/i }).click();
    await expect(page.getByText("Make it you!")).toBeVisible();

    await page.getByRole("button", { name: "Hat" }).click();
    await page.getByRole("button", { name: "Cap", exact: true }).click();

    await page.getByRole("button", { name: "Scene" }).click();
    await page.getByRole("button", { name: "mint", exact: true }).click();

    await page.getByRole("button", { name: "Save character" }).click();
    await expect(page.getByText("Character saved!")).toBeVisible();
    await expect(page.getByText("Make it you!")).not.toBeVisible();

    // ── Character persists across reload ──
    await page.reload();
    await expect(page.getByRole("button", { name: /Edit my character/i })).toBeVisible();

    const charStorage = await page.evaluate(() =>
      localStorage.getItem("earnie_char")
    );
    expect(charStorage).toContain('"hat":"cap"');
    expect(charStorage).toContain('"bg":"mint"');
  });
});

test.describe("Family provisioning on kid create", () => {
  const NO_FAMILY_EMAIL = `e2e-nofamily-${Date.now()}@test.earnie`;
  const PASSWORD = "TestPass1!";
  const KID_NAME = "Backfill Kid";
  const KID_PIN = "5678";

  test.afterAll(async () => {
    const { data: users } = await admin.auth.admin.listUsers();
    const user = users?.users.find((u) => u.email === NO_FAMILY_EMAIL);
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

  test("parent without a family row can create a kid after login", async ({
    page,
  }) => {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: NO_FAMILY_EMAIL,
        password: PASSWORD,
        email_confirm: true,
      });
    expect(createError).toBeNull();
    expect(created.user).toBeTruthy();

    const { data: familyBefore } = await admin
      .from("families")
      .select("id")
      .eq("parent_user_id", created.user!.id)
      .maybeSingle();
    expect(familyBefore).toBeNull();

    await page.goto("/login");
    await page.fill('input[type="email"]', NO_FAMILY_EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL("**/profile-picker");

    await page.goto("/parent/kids/new");
    await page.getByPlaceholder("e.g. Emma").fill(KID_NAME);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Sky" }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.locator("#kid-pin").fill(KID_PIN);
    await page.locator("#kid-pin-confirm").fill(KID_PIN);
    await page.getByRole("button", { name: "Create profile" }).click();

    await page.waitForURL("**/parent/kids?created=1");
    await expect(page.getByText(KID_NAME)).toBeVisible();
    await expect(page.getByText("Family not found")).not.toBeVisible();

    const { data: familyAfter } = await admin
      .from("families")
      .select("id")
      .eq("parent_user_id", created.user!.id)
      .maybeSingle();
    expect(familyAfter).toBeTruthy();
  });
});
