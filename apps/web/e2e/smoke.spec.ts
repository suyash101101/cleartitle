import { test, expect } from "@playwright/test";

async function hideDevChrome(page: import("@playwright/test").Page) {
  await page.addStyleTag({
    content: `
      nextjs-portal, [data-next-badge-root], [data-nextjs-toast] {
        display: none !important;
        pointer-events: none !important;
      }
      .dock-wrap, .dock { pointer-events: none !important; }
    `,
  });
}

/** Live is product default; Preview unlocks scenario cast + Film ready. */
async function enterPreview(page: import("@playwright/test").Page) {
  await page.goto("/console");
  await hideDevChrome(page);
  const preview = page.getByRole("button", { name: /^Preview$/i });
  if (await preview.count()) {
    await preview.click({ force: true });
  }
}

test("home brand @smoke", async ({ page }) => {
  await page.goto("/");
  await hideDevChrome(page);
  await expect(page.locator("h1")).toContainText(/QuitClaim/i);
  await expect(page.getByText(/Own the seat\. Own every future cut/i)).toBeVisible();
  await expect(page.getByLabel(/Graphic ticket roll/i)).toBeVisible();
  await expect(page.getByLabel(/Pull paper to mint seat NFT/i)).toBeVisible();
  await expect(page.getByRole("navigation", { name: /Primary/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Home$/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch to (light|dark)/i })).toHaveCount(0);
  await expect(page.getByLabel(/^Network$/i)).toHaveCount(0);
  await expect(page.getByText(/^LIVE$/i)).toHaveCount(0);
  await expect(page.getByText(/63 NFT-track rivals/i)).toHaveCount(0);
  await expect(page.getByText(/Against the field/i)).toHaveCount(0);
});

test("console live mode default @smoke", async ({ page }) => {
  await page.goto("/console");
  await hideDevChrome(page);
  await expect(page.getByRole("group", { name: /Product mode/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Live$/i })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: /Open seat #3 \(live\)/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Film ready/i })).toHaveCount(0);
});

test("demo night mid-payout journey @smoke", async ({ page }) => {
  await enterPreview(page);
  await page.getByRole("button", { name: /Load live night/i }).click({ noWaitAfter: true });
  await page.waitForURL(/\/seat\/3/);
  await hideDevChrome(page);
  await expect(page.getByText(/0 keys/i).first()).toBeVisible();
  await expect(page.getByLabel(/Ownership transfer tape/i)).toBeVisible();
  await expect(page.getByLabel(/Cross-chain tip continuity/i)).toBeVisible();
  await page.getByRole("group", { name: /Scenario cast/i }).getByRole("button", { name: /^ada\.near$/ }).click({ force: true });
  await page.getByRole("button", { name: /List @ 100/i }).click({ force: true });
  await page.getByRole("button", { name: /Run preview diligence|Run diligence/i }).click({ force: true });
  await expect(page.locator(".stamp")).toContainText(/PROVABLY CLEAN|FIX BEFORE BUY/);
  await page.getByRole("group", { name: /Scenario cast/i }).getByRole("button", { name: /^priya\.near$/ }).click({ force: true });
  const buyBtn = page.getByRole("button", { name: /Buy mid-payout|Buy locked/i });
  await expect(buyBtn).toBeVisible();
  if (await page.getByRole("button", { name: /Buy locked/i }).count()) {
    await page.getByRole("button", { name: /Unlock with diligence|Run preview diligence|Run diligence/i }).first().click({ force: true });
    await expect(page.locator(".stamp")).toContainText(/PROVABLY CLEAN/i);
  }
  await page.getByRole("button", { name: /^Buy mid-payout$/i }).click({ force: true });
  await expect(page.getByText(/priya\.near/).first()).toBeVisible();
  await expect(page.getByLabel(/Pending cuts follow holder/i)).toBeVisible();
  await expect(page.getByLabel(/Cross-chain tip continuity/i)).toBeVisible();
  await expect(page.getByLabel(/Continuity across sales/i)).toBeVisible();
  await expect(page.getByLabel(/Epoch bump freeze/i)).toBeVisible();
});

test("transfer lab expected fail @smoke", async ({ page }) => {
  await enterPreview(page);
  await page.getByRole("button", { name: /Load live night/i }).click({ noWaitAfter: true });
  await page.waitForURL(/\/seat\/3/);
  await page.goto("/lab");
  await hideDevChrome(page);
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
  await expect(page.getByText(/priya\.near/).first()).toBeVisible();
});

test("member room locked @smoke", async ({ page }) => {
  await enterPreview(page);
  await page.getByRole("button", { name: /Load live night/i }).click({ noWaitAfter: true });
  await page.waitForURL(/\/seat\/3/);
  await page.goto("/member/3");
  await hideDevChrome(page);
  await page.getByRole("group", { name: /Scenario cast/i }).getByRole("button", { name: /^fan\.near$/ }).click({ force: true });
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
  await expect(page.getByText(/Receipt wall/i)).toBeVisible();
  await expect(page.getByText(/ClearTitle vs the NFT ticket field/i)).toHaveCount(0);
  await expect(page.getByText(/Seatlab|TicketMaker|SolTix|Matcha/i)).toHaveCount(0);
});

test("console cast no overlap @smoke", async ({ page }) => {
  await enterPreview(page);
  const cast = page.getByRole("group", { name: /Scenario cast/i });
  const seed = page.getByRole("button", { name: /Seed Nearnight/i });
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
  await enterPreview(page);
  await page.getByRole("button", { name: /Load live night/i }).click({ noWaitAfter: true });
  await page.waitForURL(/\/seat\/3/);
  await page.goto("/title/3");
  await hideDevChrome(page);
  await expect(page.getByText(/NEP-171 · Quitclaim Deed/i)).toBeVisible();
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
  await expect(page.getByText(/ticket river|Nearnight/i).first()).toBeVisible();
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
  await expect(brands).toContainText(/QuitClaim/i);
  await expect(page.getByRole("link", { name: /^QuitClaim$/i })).toHaveCount(0);
  await expect(page.getByLabel(/Graphic ticket roll/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Buy while money is still in flight/i })).toBeVisible();
  await expect(page.getByText(/Built so sellers quit every claim/i)).toBeVisible();
  await expect(page.getByText(/01 · Real mishaps/i)).toBeVisible();
  await expect(page.getByText(/A quitclaim is when the seller abandons every claim/i)).toBeVisible();
  await expect(page.getByLabel(/Product story/i)).toBeVisible();
});

test("film ready leaves List clickable @smoke", async ({ page }) => {
  await enterPreview(page);
  await page.getByRole("button", { name: /Film ready/i }).click({ force: true });
  await page.waitForURL(/\/seat\/3/);
  await hideDevChrome(page);
  await expect(page.locator(".judge-stamp-panel")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Film ready/i).first()).toBeVisible();
  await page.getByRole("group", { name: /Scenario cast/i }).getByRole("button", { name: /^ada\.near$/ }).click({ force: true });
  await expect(page.getByRole("button", { name: /List @ 100/i })).toBeVisible();
  await expect(page.getByText(/FREE/i).first()).toBeVisible();
});

test("mobile home brand @smoke", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await hideDevChrome(page);
  await expect(page.locator("h1")).toContainText(/QuitClaim/i);
  await expect(page.getByRole("navigation", { name: /Primary/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Home$/i })).toBeVisible();
  await page.getByRole("link", { name: /^Club$/i }).click();
  await page.waitForURL(/\/console/);
});

test("box office buy ticket @smoke", async ({ page }) => {
  await page.goto("/box-office");
  await hideDevChrome(page);
  await expect(page.getByLabel(/QuitClaim wedge/i)).toBeVisible();
  await expect(page.getByLabel(/Door NFT versus earning seat/i)).toHaveCount(0);
  await page.getByRole("button", { name: /^Buy ticket$/i }).click({ force: true });
  await expect(page.getByText(/Treasury|Seat #|0xct/i).first()).toBeVisible();
});
