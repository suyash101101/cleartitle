#!/usr/bin/env node
/** Thin wrapper — real capture lives next to Playwright in apps/web. */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "apps", "web");
const r = spawnSync("node", ["scripts/capture-fossflow-e2e.mjs"], {
  cwd: web,
  stdio: "inherit",
});
process.exit(r.status ?? 1);
