import { test, expect } from "@playwright/test";
import { castAs, enterPreview, hideDevChrome, seedPreviewSeat } from "./helpers";

test.describe("P0/P1 depth — title insurance layer", () => {
  test("home title-policy positioning @smoke", async ({ page }) => {
    await page.goto("/");
    await hideDevChrome(page);
    await expect(page.locator("h1")).toContainText(/CleanDeed/i);
    await expect(page.getByText(/Title insurance for earning seats/i)).toBeVisible();
    await expect(
      page.getByText(/title policy any venue attaches|Provably clean title/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/nfts · title policy/i)).toBeVisible();
    await expect(page.getByText(/business track|autonomous-business/i)).toHaveCount(0);
  });

  test("lab receipt wall has ≥8 named attacks @smoke", async ({ page }) => {
    await page.goto("/lab");
    await hideDevChrome(page);
    const receipts = page.locator(".lab-receipt-grid > li");
    await expect(receipts).toHaveCount(10);
    await expect(page.getByText(/Held-sig raw sign while listed/i)).toBeVisible();
    await expect(page.getByText(/Old owner withdraw after sale/i)).toBeVisible();
    await expect(page.getByText(/Sign-epoch bump on list/i)).toBeVisible();
    await expect(page.getByText(/Tip address continuity across sale/i)).toBeVisible();
    await expect(page.getByText(/Wash-flagged seat buy/i)).toBeVisible();
    const links = page.locator(".lab-receipt-grid a.mono");
    expect(await links.count()).toBeGreaterThanOrEqual(8);
  });

  test("full mid-payout + tip continuity + lease strip @smoke", async ({ page }) => {
    test.setTimeout(120_000);
    await seedPreviewSeat(page);

    await expect(page.getByLabel(/Cross-chain tip continuity/i)).toBeVisible();
    await expect(page.getByLabel(/Seat-cut lease/i)).toBeVisible();
    await expect(page.getByText(/Rent the cut\. Keep the title/i)).toBeVisible();

    const tipBtc = page.locator(".tip-addr").first();
    const btcBefore = (await tipBtc.textContent())?.trim() ?? "";
    expect(btcBefore.length).toBeGreaterThan(10);

    await castAs(page, /^seller\.near$/);
    await page.getByRole("button", { name: /List @ 100/i }).click({ force: true });
    await expect(page.getByText(/LISTED|FREEZE|listed/i).first()).toBeVisible();

    await page
      .getByRole("button", { name: /Run preview diligence|Run diligence|Unlock with diligence/i })
      .first()
      .click({ force: true });
    await expect(page.getByText(/PROVABLY CLEAN/i).first()).toBeVisible();

    await castAs(page, /^buyer\.near$/);
    await page.getByRole("button", { name: /^Buy mid-payout$/i }).click({ force: true });
    await expect(page.getByText(/buyer\.near/).first()).toBeVisible();

    const btcAfter = (await tipBtc.textContent())?.trim() ?? "";
    expect(btcAfter).toBe(btcBefore);

    await castAs(page, /^buyer\.near$/);
    const leaseStrip = page.getByLabel(/Seat-cut lease/i);
    await leaseStrip.scrollIntoViewIfNeeded();
    await expect(page.getByTestId("lease-offer")).toBeVisible();
    await page.getByTestId("lease-offer").dispatchEvent("click");
    const leaseStatus = page.getByTestId("lease-status");
    await expect
      .poll(async () => (await leaseStatus.textContent()) ?? "", { timeout: 10_000 })
      .toMatch(/Open offer/i);
    // Full take/settle reverse-heist is covered by `pnpm heist` + SDK unit tests.
    await expect(page.getByText(/Rent the cut\. Keep the title/i)).toBeVisible();
  });

  test("transfer lab all refuses @smoke", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/lab");
    await hideDevChrome(page);

    await page.getByRole("button", { name: /Run mid-payout scenario/i }).click({ force: true });
    await expect(page.getByText(/Mid-payout OK|rebound/i).first()).toBeVisible();
    await expect(page.getByText(/buyer\.near/).first()).toBeVisible();

    await page.getByRole("button", { name: /Seller recall withdraw|Old owner withdraw/i }).click({ force: true });
    await expect(page.getByText(/EXPECTED FAIL|not current owner/i).first()).toBeVisible();

    await page.getByRole("button", { name: /Held-sig raw sign/i }).click({ force: true });
    await expect(page.getByText(/EXPECTED FAIL|refused|freeze/i).first()).toBeVisible();

    await page.getByRole("button", { name: /Wash flag/i }).click({ force: true });
    await expect(page.getByText(/FIX|wash/i).first()).toBeVisible();
  });

  test("intents dry quote on box office @smoke", async ({ page }) => {
    await seedPreviewSeat(page);
    await page.goto("/box-office");
    await hideDevChrome(page);
    await expect(page.getByLabel(/Intents dry ticket pay|Payment vs seat title/i)).toBeVisible();
    await page.getByRole("button", { name: /Run dry quote/i }).click({ force: true });
    await expect(page.locator("pre.mono")).toContainText(/"dry": true/);
    await expect(page.getByText(/no funds move/i).first()).toBeVisible();
  });

  test("verify matrix includes new policy claims @smoke", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/verify", { waitUntil: "domcontentloaded" });
    await hideDevChrome(page);
    await expect(page.getByText(/sale_mid_payout_rebinds_pending/)).toBeVisible();
    await expect(
      page.getByText(/list_bumps_sign_epoch|assertCleanToBuy|lease_blocks_list/i).first(),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Receipt wall/i })).toBeVisible();
  });

  test("title certificate tip + wash surfaces @smoke", async ({ page }) => {
    await seedPreviewSeat(page);
    await page.goto("/title/3");
    await hideDevChrome(page);
    await expect(page.getByText(/NEP-171 · CleanDeed/i)).toBeVisible();
    await expect(page.getByText(/bc1/i).first()).toBeVisible();
    await expect(page.getByLabel(/Wash risk/i)).toBeVisible();
    await expect(page.getByLabel(/Title clarity score/i)).toBeVisible();
  });

  test("mobile mid-payout path @smoke", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await seedPreviewSeat(page);
    await expect(page.getByRole("button", { name: /List @ 100/i })).toBeVisible();
    await castAs(page, /^seller\.near$/);
    await page.getByRole("button", { name: /List @ 100/i }).click({ force: true });
    await castAs(page, /^buyer\.near$/);
    const unlock = page.getByRole("button", {
      name: /Unlock with diligence|Run preview diligence|Run diligence/i,
    });
    if (await unlock.count()) {
      await unlock.first().click({ force: true });
    }
    await page.getByRole("button", { name: /Buy mid-payout/i }).click({ force: true });
    await expect(page.getByText(/buyer\.near/).first()).toBeVisible({ timeout: 15_000 });
  });

  test("console preview mid-payout CTA @smoke", async ({ page }) => {
    await enterPreview(page);
    await expect(page.getByRole("button", { name: /^Preview mid-payout$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Seed preview venue/i })).toBeVisible();
  });
});
