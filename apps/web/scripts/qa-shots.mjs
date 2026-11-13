import { chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/qa");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto("http://127.0.0.1:3456/console", { waitUntil: "domcontentloaded" });
await p.getByRole("button", { name: /Load live night/i }).click({ noWaitAfter: true }).catch(() => {});
await p.waitForURL(/\/seat\/3/, { timeout: 15000 }).catch(() => {});
for (const [urlPath, name] of [["/", "home"], ["/title/3", "title3"], ["/seat/1", "seat1"], ["/inventory", "inventory"]]) {
  await p.goto("http://127.0.0.1:3456" + urlPath, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(dir, name + ".png"), fullPage: false });
  console.log("shot", name);
}
await b.close();
