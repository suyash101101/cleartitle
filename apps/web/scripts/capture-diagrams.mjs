#!/usr/bin/env node
/**
 * Capture real FossFLOW + Excalidraw screenshots via Playwright (no generative fills).
 */
import { chromium } from "@playwright/test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const diagrams = join(root, "docs/diagrams");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

async function dismissChrome() {
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(150);
  }
  // Hide tip cards / top session chrome via CSS for cleaner README crops
  await page.addStyleTag({
    content: `
      [class*="Tip"], [class*="tip"], [class*="Toast"], [class*="Banner"],
      [role="dialog"], .MuiSnackbar-root {
        display: none !important;
      }
    `,
  }).catch(() => {});
}

async function openMenuFile(filePath) {
  await page.getByRole("button", { name: /Main menu/i }).click();
  await page.waitForTimeout(250);
  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 15000 }),
    page.getByRole("menuitem", { name: /^Open$/i }).click(),
  ]);
  await chooser.setFiles(filePath);
  await page.waitForTimeout(3000);
  await dismissChrome();
  const fit = page.getByRole("button", { name: /Fit to screen/i });
  if (await fit.count()) {
    await fit.click();
    await page.waitForTimeout(1000);
  }
}

async function captureFoss(name, jsonFile) {
  console.log(`FossFLOW ${name}…`);
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1800);
  await dismissChrome();
  await openMenuFile(join(diagrams, jsonFile));
  await dismissChrome();
  // Prefer canvas-only screenshot of main isometric area if possible
  const canvas = page.locator("canvas").first();
  if (await canvas.count()) {
    await canvas.screenshot({ path: join(diagrams, `${name}.png`) });
  } else {
    await page.screenshot({ path: join(diagrams, `${name}.png`), fullPage: true });
  }
  console.log(`wrote ${name}.png`);
}

await captureFoss("architecture", "fossflow-architecture.json");
await captureFoss("userflow", "fossflow-userflow.json");

console.log("Excalidraw claims…");
await page.goto("http://127.0.0.1:8765/excalidraw-viewer.html", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(9000);
// Hide Excalidraw side UI for README crop
await page.addStyleTag({
  content: `
    .excalidraw .App-menu, .excalidraw .layer-ui__wrapper__top-right,
    .excalidraw .footer-center, .excalidraw .Island {
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `,
}).catch(() => {});
await page.waitForTimeout(400);
await page.screenshot({ path: join(diagrams, "quitclaim-claims.png"), fullPage: true });
console.log("wrote quitclaim-claims.png", existsSync(join(diagrams, "quitclaim-claims.png")));

await browser.close();
console.log("DONE");
