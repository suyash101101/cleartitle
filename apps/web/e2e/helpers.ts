import { expect, type Page } from "@playwright/test";

/** Hide Next.js / dock chrome that steals clicks in headed/dev. */
export async function hideDevChrome(page: Page) {
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

/** Live is product default; Preview unlocks scenario cast + mid-payout seed. */
export async function enterPreview(page: Page) {
  await page.goto("/console");
  await hideDevChrome(page);
  const preview = page.getByRole("button", { name: /^Preview$/i });
  if (await preview.count()) {
    await preview.click({ force: true });
  }
  await expect(page.getByRole("button", { name: /^Preview$/i })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
}

/** Seed Preview mid-payout desk (FREE seat #3 with pending cut). */
export async function seedPreviewSeat(page: Page) {
  await enterPreview(page);
  const film = page.getByRole("button", { name: /Preview mid-payout|Film ready/i });
  if (await film.count()) {
    await film.first().click({ force: true });
  } else {
    await page.getByRole("button", { name: /Load live night/i }).click({ force: true });
  }
  await page.waitForURL(/\/seat\/3/);
  await hideDevChrome(page);
  await expect(page.getByText(/0 keys/i).first()).toBeVisible();
}

export async function castAs(page: Page, actor: RegExp | string) {
  await page.getByRole("group", { name: /Scenario cast/i }).getByRole("button", { name: actor }).click({
    force: true,
  });
}
