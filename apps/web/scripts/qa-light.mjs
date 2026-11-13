import { chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/qa");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto("http://127.0.0.1:3456/");
await p.evaluate(() => { document.documentElement.dataset.theme = "light"; localStorage.setItem("ct-theme", "light"); });
await p.reload({ waitUntil: "domcontentloaded" });
await p.waitForTimeout(800);
await p.screenshot({ path: path.join(dir, "home-light.png"), fullPage: false });
await p.goto("http://127.0.0.1:3456/console");
await p.waitForTimeout(800);
await p.screenshot({ path: path.join(dir, "console-light.png"), fullPage: false });
// dock click
await p.getByRole("link", { name: "Home" }).click();
await p.waitForURL("http://127.0.0.1:3456/");
console.log("dock click ok");
await b.close();
