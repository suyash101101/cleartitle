#!/usr/bin/env node
/**
 * Capture real FossFLOW + Excalidraw screenshots via Playwright (no generative fills).
 */
import { chromium } from "@playwright/test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const diagrams = join(root, "docs/diagrams");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

async function dismissTips() {
  await page.keyboard.press("Escape").catch(() => {});
  const closes = page.locator("button").filter({ hasText: /^×$|^Close$/i });
  const n = await closes.count();
  for (let i = 0; i < Math.min(n, 4); i++) {
    try {
      await closes.nth(i).click({ timeout: 500 });
    } catch {
      /* ignore */
    }
  }
}

async function openMenuFile(filePath) {
  await page.getByRole("button", { name: /Main menu/i }).click();
  await page.waitForTimeout(250);
  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser", { timeout: 15000 }),
    page.getByRole("menuitem", { name: /^Open$/i }).click(),
  ]);
  await chooser.setFiles(filePath);
  await page.waitForTimeout(2800);
  await page.keyboard.press("Escape").catch(() => {});
  const fit = page.getByRole("button", { name: /Fit to screen/i });
  if (await fit.count()) await fit.click();
  await page.waitForTimeout(900);
}

console.log("FossFLOW architecture…");
await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2000);
await dismissTips();
await openMenuFile(join(diagrams, "fossflow-architecture.json"));
await page.screenshot({ path: join(diagrams, "architecture.png"), fullPage: true });
console.log("wrote architecture.png");

console.log("FossFLOW userflow…");
await page.getByRole("button", { name: /Main menu/i }).click();
await page.waitForTimeout(200);
try {
  await page.getByRole("menuitem", { name: /Clear the canvas/i }).click();
  await page.waitForTimeout(500);
} catch {
  /* ignore */
}
await openMenuFile(join(diagrams, "fossflow-userflow.json"));
await page.screenshot({ path: join(diagrams, "userflow.png"), fullPage: true });
console.log("wrote userflow.png");

console.log("Excalidraw claims…");
await page.goto("http://127.0.0.1:8765/excalidraw-viewer.html", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(8000);
await page.screenshot({ path: join(diagrams, "quitclaim-claims.png"), fullPage: true });
console.log("wrote quitclaim-claims.png", existsSync(join(diagrams, "quitclaim-claims.png")));

await browser.close();
console.log("DONE");
