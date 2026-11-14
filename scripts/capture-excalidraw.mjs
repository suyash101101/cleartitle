#!/usr/bin/env node
/** Export architecture + Ada/Priya Excalidraw boards to PNG. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "docs", "diagrams");

const TEMPLATE = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/excalidraw.min.css"/>
<style>
html,body,#root{margin:0;width:100%;height:100%;background:#fff;overflow:hidden}
.layer-ui__wrapper,.App-menu,.App-toolbar,.FixedSideContainer,footer,.Island{display:none!important}
</style></head><body>
<div id="root"></div>
<script src="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/excalidraw.production.min.js"></script>
<script>
const scene = __SCENE__;
const apiRef = { current: null };
ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement("div", {style:{width:"100%",height:"100%"}},
    React.createElement(ExcalidrawLib.Excalidraw, {
      excalidrawAPI: (api) => { apiRef.current = api; },
      initialData: {
        elements: scene.elements,
        appState: Object.assign({}, scene.appState||{}, {
          viewBackgroundColor: "#ffffff",
          zenModeEnabled: true,
          viewModeEnabled: true,
        }),
        files: scene.files || {},
        scrollToContent: true,
      },
    })
  )
);
setTimeout(() => {
  try { apiRef.current && apiRef.current.scrollToContent(undefined, { fitToContent: true }); } catch (e) {}
  window.__READY__ = true;
}, 2800);
</script></body></html>`;

function writeExport(srcName, htmlName) {
  const scene = JSON.parse(fs.readFileSync(path.join(OUT, srcName), "utf8"));
  fs.writeFileSync(
    path.join(OUT, htmlName),
    TEMPLATE.replace("__SCENE__", JSON.stringify(scene)),
  );
}

writeExport("quitclaim-architecture.excalidraw", "_export-architecture.html");
writeExport("ada-priya-architecture.excalidraw", "_export-ada-priya.html");

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".excalidraw": "application/json",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://127.0.0.1");
  const rel = decodeURIComponent(u.pathname).replace(/^\//, "") || "_export-architecture.html";
  const file = path.join(OUT, rel);
  if (!file.startsWith(OUT) || !fs.existsSync(file)) {
    res.writeHead(404);
    res.end("nf");
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
});

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture(pagePath, outName, w, h, port, srvPort) {
  const chrome = spawn(
    "google-chrome-stable",
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--hide-scrollbars",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      `--remote-debugging-port=${port}`,
      `--window-size=${w},${h}`,
      `http://127.0.0.1:${srvPort}/${pagePath}`,
    ],
    { stdio: "ignore" },
  );
  await sleep(2500);
  try {
    const pages = await getJSON(`http://127.0.0.1:${port}/json/list`);
    const page = pages.find((p) => p.type === "page" && p.webSocketDebuggerUrl) || pages[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });
    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg);
    };
    const call = (method, params = {}) => {
      const my = ++id;
      return new Promise((resolve) => {
        pending.set(my, resolve);
        ws.send(JSON.stringify({ id: my, method, params }));
      });
    };
    await call("Runtime.enable");
    await call("Page.enable");
    let ready = false;
    for (let i = 0; i < 100; i++) {
      await sleep(400);
      const r = await call("Runtime.evaluate", {
        expression: "window.__READY__===true",
        returnByValue: true,
      });
      if (r.result?.result?.value === true) {
        ready = true;
        break;
      }
    }
    await sleep(1500);
    const shot = await call("Page.captureScreenshot", { format: "png", fromSurface: true });
    fs.writeFileSync(path.join(OUT, outName), Buffer.from(shot.result.data, "base64"));
    console.log("wrote", outName, "ready=", ready);
    ws.close();
  } finally {
    chrome.kill();
  }
}

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const srvPort = server.address().port;
await capture("_export-architecture.html", "quitclaim-architecture.png", 1500, 1200, 9341, srvPort);
await capture("_export-ada-priya.html", "ada-priya-architecture.png", 1400, 1200, 9342, srvPort);
server.close();
for (const f of ["_export-architecture.html", "_export-ada-priya.html"]) {
  try {
    fs.unlinkSync(path.join(OUT, f));
  } catch {
    /* ignore */
  }
}
console.log("DONE");
