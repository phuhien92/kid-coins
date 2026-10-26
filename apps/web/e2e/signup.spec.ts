import { test, expect } from "@playwright/test";

test.describe("Signup flow", () => {
  test("renders signup page and advances to family step", async ({ page }) => {
    await page.goto("/signup");

    // Brand
    await expect(page.getByText("Earnie")).toBeVisible();
    await expect(page.getByText("Create your account")).toBeVisible();

    // Step indicator shows step 1 active
    await expect(page.locator("text=1").first()).toBeVisible();

    // Fill credentials
    await page.fill("#su-email", "test@example.com");
    await page.fill("#su-password", "StrongPass1!");
    await page.fill("#su-confirm", "StrongPass1!");

    // Advance to family step
    await page.click('button:has-text("Continue")');

    // Now on family step
    await expect(page.getByText("About your family")).toBeVisible();
    await expect(page.getByText("Create account")).toBeVisible();
  });

  test("shows validation errors for invalid input", async ({ page }) => {
    await page.goto("/signup");

    // Submit empty form on step 1
    await page.click('button:has-text("Continue")');
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();

    // Invalid email
    await page.fill("#su-email", "not-an-email");
    await page.click('button:has-text("Continue")');
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();

    // Short password
    await page.fill("#su-email", "test@example.com");
    await page.fill("#su-password", "short");
    await page.fill("#su-confirm", "short");
    await page.click('button:has-text("Continue")');
    await expect(page.getByText("Password must be at least 8 characters.")).toBeVisible();

    // Mismatched passwords
    await page.fill("#su-password", "LongPass1!");
    await page.fill("#su-confirm", "Different1!");
    await page.click('button:has-text("Continue")');
    await expect(page.getByText("Passwords don't match.")).toBeVisible();
  });

  test("back button returns to credentials step", async ({ page }) => {
    await page.goto("/signup");

    await page.fill("#su-email", "test@example.com");
    await page.fill("#su-password", "StrongPass1!");
    await page.fill("#su-confirm", "StrongPass1!");
    await page.click('button:has-text("Continue")');

    await expect(page.getByText("About your family")).toBeVisible();

    // Click Back
    await page.click('button:has-text("Back")');
    await expect(page.getByText("Create your account")).toBeVisible();
  });
});
