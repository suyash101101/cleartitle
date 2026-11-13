import { test, expect } from "@playwright/test";

test("home brand @smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText(/Clear/i);
  await expect(page.getByText(/Sell the seat/i)).toBeVisible();
});

test("demo night mid-payout journey @smoke", async ({ page }) => {
  await page.goto("/console");
  await page.getByRole("button", { name: /Load demo night/i }).click();
  await page.goto("/seat/3");
  await expect(page.getByText(/0 keys/i).first()).toBeVisible();
  await page.getByRole("button", { name: /^ada\.near$/ }).click();
  await page.getByRole("button", { name: /List @ 100/i }).click();
  await page.getByRole("button", { name: /Run diligence/i }).click();
  await expect(page.locator(".stamp")).toContainText(/PROVABLY CLEAN|FIX BEFORE BUY/);
  await page.getByRole("button", { name: /^priya\.near$/ }).click();
  await page.getByRole("button", { name: /Buy mid-payout/i }).click();
  await expect(page.getByText(/priya\.near/).first()).toBeVisible();
});

test("transfer lab expected fail @smoke", async ({ page }) => {
  await page.goto("/console");
  await page.getByRole("button", { name: /Load demo night/i }).click();
  await page.goto("/lab");
  await page.getByRole("button", { name: /Old owner withdraw/i }).click();
  await expect(page.getByText(/EXPECTED FAIL|not current owner|Lab/i).first()).toBeVisible();
});

test("member room locked @smoke", async ({ page }) => {
  await page.goto("/console");
  await page.getByRole("button", { name: /Load demo night/i }).click();
  await page.goto("/member/3");
  await page.getByRole("button", { name: /^fan\.near$/ }).click();
  await expect(page.getByText(/LOCKED/i)).toBeVisible();
});

test("verify matrix @smoke", async ({ page }) => {
  await page.goto("/verify");
  await expect(page.getByText(/sale_mid_payout_rebinds_pending/)).toBeVisible();
});
