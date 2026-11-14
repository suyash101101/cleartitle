import { test, expect } from "@playwright/test";
import { castAs, enterPreview, hideDevChrome, seedPreviewSeat } from "./helpers";

test("home brand @smoke", async ({ page }) => {
  await page.goto("/");
  await hideDevChrome(page);
  await expect(page.locator("h1")).toContainText(/CleanDeed/i);
  await expect(page.getByText(/Title insurance for earning seats/i)).toBeVisible();
  await expect(page.getByLabel(/Graphic ticket roll/i)).toBeVisible();
  await expect(page.getByRole("navigation", { name: /Primary/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Home$/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch to (light|dark)/i })).toHaveCount(0);
  await expect(page.getByLabel(/^Network$/i)).toHaveCount(0);
  await expect(page.getByText(/63 NFT-track rivals/i)).toHaveCount(0);
  await expect(page.getByText(/Against the field/i)).toHaveCount(0);
});

test("console live mode default @smoke", async ({ page }) => {
  await page.goto("/console");
  await hideDevChrome(page);
  await expect(page.getByRole("group", { name: /Product mode/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Live$/i })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel(/Five minute organizer path/i)).toBeVisible();
  await expect(page.getByText(/Live venue|Reading RPC|No venue yet/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Preview mid-payout|Film ready/i })).toHaveCount(0);
});

test("demo night mid-payout journey @smoke", async ({ page }) => {
  test.setTimeout(90_000);
  await seedPreviewSeat(page);
  await expect(page.getByLabel(/Ownership transfer tape/i)).toBeVisible();
  await expect(page.getByLabel(/Cross-chain tip continuity/i)).toBeVisible();
  await castAs(page, /^seller\.near$/);
  await page.getByRole("button", { name: /List @ 100/i }).click({ force: true });
  await page.getByRole("button", { name: /Run preview diligence|Run diligence|Unlock with diligence/i }).first().click({ force: true });
  await expect(page.getByText(/PROVABLY CLEAN|FIX BEFORE BUY/i).first()).toBeVisible();
  await castAs(page, /^buyer\.near$/);
  const buyBtn = page.getByRole("button", { name: /Buy mid-payout|Buy locked/i });
  await expect(buyBtn).toBeVisible();
  if (await page.getByRole("button", { name: /Buy locked/i }).count()) {
    await page
      .getByRole("button", { name: /Unlock with diligence|Run preview diligence|Run diligence/i })
      .first()
      .click({ force: true });
    await expect(page.getByText(/PROVABLY CLEAN/i).first()).toBeVisible();
  }
  await page.getByRole("button", { name: /^Buy mid-payout$/i }).click({ force: true });
  await expect(page.getByText(/buyer\.near/).first()).toBeVisible();
  await expect(page.getByLabel(/Pending cuts follow holder/i)).toBeVisible();
  await expect(page.getByLabel(/Cross-chain tip continuity/i)).toBeVisible();
  await expect(page.getByLabel(/Continuity across sales/i)).toBeVisible();
  await expect(page.getByLabel(/Epoch bump freeze/i)).toBeVisible();
});

test("transfer lab expected fail @smoke", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/lab");
  await hideDevChrome(page);
  await page.getByRole("button", { name: /Run mid-payout scenario/i }).click({ force: true });
  await expect(page.getByText(/Mid-payout OK|rebound/i).first()).toBeVisible();
  await page.getByRole("button", { name: /Seller recall withdraw|Old owner withdraw/i }).click({ force: true });
  await expect(page.getByText(/EXPECTED FAIL|not current owner|Lab/i).first()).toBeVisible();
});

test("lab mid-payout scenario @smoke", async ({ page }) => {
  await page.goto("/lab");
  await hideDevChrome(page);
  await expect(page.getByLabel(/Attack timeline/i)).toBeVisible();
  await expect(page.getByLabel(/Double-sell refusal/i)).toBeVisible();
  await expect(page.getByLabel(/Zero access keys proof/i)).toBeVisible();
  await expect(page.getByLabel(/Off-chain royalty bypass versus clear title/i)).toBeVisible();
  await page.getByRole("button", { name: /Run mid-payout scenario/i }).click({ force: true });
  await expect(page.getByText(/Mid-payout OK|rebound/i).first()).toBeVisible();
  await expect(page.getByText(/buyer\.near/).first()).toBeVisible();
});

test("member room locked @smoke", async ({ page }) => {
  await seedPreviewSeat(page);
  await page.goto("/member/3");
  await hideDevChrome(page);
  await castAs(page, /^fan\.near$/);
  await expect(page.getByText(/LOCKED/i)).toBeVisible();
});

test("verify matrix @smoke", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/verify", { waitUntil: "domcontentloaded" });
  await hideDevChrome(page);
  await expect(page.getByText(/sale_mid_payout_rebinds_pending/)).toBeVisible();
  await expect(page.getByLabel(/Judge proof packet/i)).toBeVisible();
  await expect(page.getByLabel(/Buyer title warranty/i)).toBeVisible();
  await expect(page.getByLabel(/Claim window/i)).toBeVisible();
  await expect(page.getByText(/Transfer threat model/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Receipt wall/i })).toBeVisible();
  await expect(page.getByText(/CleanDeed vs the NFT ticket field/i)).toHaveCount(0);
  await expect(page.getByText(/Seatlab|TicketMaker|SolTix|Matcha/i)).toHaveCount(0);
});

test("console cast no overlap @smoke", async ({ page }) => {
  await enterPreview(page);
  const cast = page.getByRole("group", { name: /Scenario cast/i });
  const seed = page.getByRole("button", { name: /^Preview mid-payout$/i });
  await expect(cast).toBeVisible();
  await expect(seed).toBeVisible();
  const castBox = await cast.boundingBox();
  const seedBox = await seed.boundingBox();
  expect(castBox && seedBox).toBeTruthy();
  if (castBox && seedBox) {
    expect(castBox.y + castBox.height).toBeLessThanOrEqual(seedBox.y + 2);
  }
  await expect(page.getByLabel(/Ninety second judge path/i)).toBeVisible();
  await expect(page.getByLabel(/Graphic ticket roll/i)).toBeVisible();
  await expect(page.getByLabel(/TEE check versus on-chain title/i)).toHaveCount(0);
});

test("title certificate @smoke", async ({ page }) => {
  await seedPreviewSeat(page);
  await page.goto("/title/3");
  await hideDevChrome(page);
  await expect(page.getByText(/NEP-171 · CleanDeed/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seat #3", exact: true })).toBeVisible();
  await expect(page.getByText(/Clear title chain/i)).toBeVisible();
  await expect(page.getByLabel(/Title clarity score/i)).toBeVisible();
  await expect(page.getByLabel(/Wash risk/i)).toBeVisible();
  await expect(page.getByLabel(/Seat earnings history/i)).toBeVisible();
  await expect(page.getByLabel(/Explainable title checks/i)).toBeVisible();
  await expect(page.getByLabel(/Zero access keys proof/i)).toBeVisible();
  await expect(page.getByLabel(/Epoch bump freeze/i)).toBeVisible();
  await expect(page.getByText(/TicketChain|SolTix|TicketMaker|Seatlab/i)).toHaveCount(0);
});

test("night river + inventory @smoke", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/night", { waitUntil: "domcontentloaded" });
  await hideDevChrome(page);
  await expect(page.getByText(/ticket river|CleanDeed|venue/i).first()).toBeVisible();
  await expect(page.getByLabel(/Settlement pulse/i)).toHaveCount(0);
  await expect(page.getByLabel(/Ticket cut ticker/i)).toBeVisible();
  await page.goto("/inventory", { waitUntil: "domcontentloaded" });
  await hideDevChrome(page);
  await expect(page.getByText(/Seat|NFT|inventory/i).first()).toBeVisible();
  await expect(page.getByLabel(/Graphic ticket roll/i)).toBeVisible();
  await expect(page.getByText(/rival|TicketMaker|Seatlab|Riyal/i)).toHaveCount(0);
});

test("home brand once @smoke", async ({ page }) => {
  await page.goto("/");
  await hideDevChrome(page);
  const brands = page.locator("h1");
  await expect(brands).toHaveCount(1);
  await expect(brands).toContainText(/CleanDeed/i);
  await expect(page.getByRole("link", { name: /^CleanDeed$/i })).toHaveCount(0);
  await expect(page.getByLabel(/Graphic ticket roll/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Buy while money is still in flight/i })).toBeVisible();
  await expect(page.getByText(/Built so sellers quit every claim/i)).toBeVisible();
  await expect(page.getByText(/01 · Real mishaps/i)).toBeVisible();
  await expect(
    page.getByText(/title policy any venue attaches|quitclaim is when the seller abandons/i).first(),
  ).toBeVisible();
  await expect(page.getByLabel(/Product story|CleanDeed/i).first()).toBeVisible();
});

test("film ready leaves List clickable @smoke", async ({ page }) => {
  await seedPreviewSeat(page);
  await expect(page.locator(".judge-stamp-panel")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Film ready|seller|pending/i).first()).toBeVisible();
  await castAs(page, /^seller\.near$/);
  await expect(page.getByRole("button", { name: /List @ 100/i })).toBeVisible();
  await expect(page.getByText(/FREE/i).first()).toBeVisible();
});

test("mobile home brand @smoke", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await hideDevChrome(page);
  await expect(page.locator("h1")).toContainText(/CleanDeed/i);
  await expect(page.getByRole("navigation", { name: /Primary/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Home$/i })).toBeVisible();
  await page.getByRole("link", { name: /^Club$/i }).click();
  await page.waitForURL(/\/console/);
});

test("box office buy ticket @smoke", async ({ page }) => {
  await seedPreviewSeat(page);
  await page.goto("/box-office");
  await hideDevChrome(page);
  await expect(page.getByLabel(/Intents dry ticket pay|Payment vs seat title/i)).toBeVisible();
  await expect(page.getByLabel(/Door NFT versus earning seat/i)).toHaveCount(0);
  await page.getByRole("button", { name: /^Buy ticket$/i }).click({ force: true });
  await expect(page.getByText(/Treasury|Seat #|0xct|ticket/i).first()).toBeVisible();
});

test("organizer five minute path @smoke", async ({ page }) => {
  await page.goto("/console");
  await hideDevChrome(page);
  await expect(page.getByLabel(/Five minute organizer path/i)).toBeVisible();
  await expect(page.getByText(/Live venue|Reading RPC|No venue yet|Bound via/i).first()).toBeVisible();
});

test("scale page @smoke", async ({ page }) => {
  await page.goto("/scale");
  await hideDevChrome(page);
  await expect(page.getByRole("heading", { name: /CleanDeed beyond the night/i })).toBeVisible();
  await expect(page.getByText(/Shipped vs roadmap/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Market need/i })).toBeVisible();
  await expect(page.getByText(/Where the NFT field sits/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Scale/i })).toBeVisible();
});

test("proof packet @smoke", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/proof", { waitUntil: "domcontentloaded" });
  await hideDevChrome(page);
  await expect(page.getByRole("heading", { name: /Proof packet/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download JSON/i })).toBeVisible();
  await expect(page.getByText(/Live RPC|PROVABLY CLEAN|Reading RPC/i).first()).toBeVisible({
    timeout: 30_000,
  });
});
