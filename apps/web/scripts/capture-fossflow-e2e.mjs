#!/usr/bin/env node
/**
 * Load CleanDeed E2E into FossFLOW, then use real "Export as image" PNG
 * (dom-to-image), not a viewport screenshot.
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, existsSync, readFileSync, writeFileSync, statSync } from "node:fs";

/** Trim near-white margins left by FossFLOW's export camera. */
function trimWhitespace(pngPath, pad = 48) {
  const py = `
from PIL import Image
im = Image.open(${JSON.stringify(pngPath)}).convert("RGBA")
px = im.load()
w, h = im.size
def bg(a):
    r, g, b, alpha = a
    return alpha < 8 or (r > 242 and g > 242 and b > 242)
minx, miny, maxx, maxy = w, h, 0, 0
found = False
for y in range(h):
    for x in range(w):
        if not bg(px[x, y]):
            found = True
            if x < minx: minx = x
            if y < miny: miny = y
            if x > maxx: maxx = x
            if y > maxy: maxy = y
if not found:
    raise SystemExit("no content to trim")
minx = max(0, minx - ${pad})
miny = max(0, miny - ${pad})
maxx = min(w - 1, maxx + ${pad})
maxy = min(h - 1, maxy + ${pad})
im.crop((minx, miny, maxx + 1, maxy + 1)).save(${JSON.stringify(pngPath)})
print(f"trimmed {w}x{h} -> {maxx - minx + 1}x{maxy - miny + 1}")
`;
  const out = execFileSync("python3", ["-c", py], { encoding: "utf8" });
  process.stdout.write(out);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const diagrams = join(root, "docs/diagrams");
const jsonPath = join(diagrams, "fossflow-e2e.json");

if (!existsSync(jsonPath)) {
  throw new Error(`missing ${jsonPath} — run generate-fossflow-e2e.mjs first`);
}

const model = JSON.parse(readFileSync(jsonPath, "utf8"));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
});

page.on("dialog", async (d) => {
  await d.accept().catch(() => {});
});

console.log("seed localStorage + open FossFLOW…");
await page.goto("http://127.0.0.1:3000/", {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await page.evaluate((data) => {
  localStorage.setItem("fossflow-last-opened-data", JSON.stringify(data));
}, model);
await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);

if (
  !(await page.getByText("CLEAN gate").count()) &&
  !(await page.getByText("CleanDeed").count())
) {
  throw new Error("E2E model did not load into FossFLOW");
}

for (let i = 0; i < 6; i++) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(60);
}

console.log("Export as image…");
await page.getByRole("button", { name: /Main menu/i }).click();
await page.waitForTimeout(250);
await page.getByRole("menuitem", { name: /Export as image/i }).click();

// Wait for FossFLOW's real PNG preview (dom-to-image export)
const preview = page.getByRole("dialog").locator('img[alt="preview"]');
await preview.waitFor({ state: "visible", timeout: 120000 });
await page.waitForTimeout(800);

const dataUrl = await preview.getAttribute("src");
if (!dataUrl?.startsWith("data:image/png;base64,")) {
  throw new Error("Export preview did not produce a PNG data URL");
}

const outE2e = join(diagrams, "e2e-flow.png");
writeFileSync(outE2e, Buffer.from(dataUrl.split(",")[1], "base64"));
trimWhitespace(outE2e, 40);
copyFileSync(outE2e, join(diagrams, "userflow.png"));
copyFileSync(outE2e, join(diagrams, "architecture.png"));

console.log(
  "wrote FossFLOW PNG export",
  outE2e,
  statSync(outE2e).size,
  `(${model.items.length} nodes, ${model.views[0].connectors.length} edges)`,
);

await page.getByRole("button", { name: /^Cancel$/i }).click().catch(() => {});
await browser.close();
console.log("DONE");
