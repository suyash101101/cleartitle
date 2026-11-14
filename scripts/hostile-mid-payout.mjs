#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, "scripts/.tmp-hostile.mjs");
writeFileSync(
  tmp,
  `
import {
  seedDemoNight, listSeat, buySeat, labOldOwnerWithdraw, requestRawSign,
} from "../packages/sdk/src/index.ts";

const world = seedDemoNight();
const seller = world.seats["3"].owner;
const nonce = listSeat(world, seller, "3", 100);
let heldFail = false;
try { requestRawSign(world, seller, "3"); } catch { heldFail = true; }
if (!heldFail) { console.error("HOSTILE FAIL — held sig allowed"); process.exit(1); }
const { rebounded } = buySeat(world, "priya.near", "3", 100, nonce);
const lab = labOldOwnerWithdraw(world, seller, "3");
const seat = world.seats["3"];
if (seat.owner !== "priya.near" || rebounded <= 0 || !lab.reason.includes("not current owner")) {
  console.error("HOSTILE FAIL", { owner: seat.owner, rebounded, lab });
  process.exit(1);
}
console.log("HOSTILE OK", { owner: seat.owner, rebounded, continuity: seat.continuityHash, oldWithdraw: lab.reason });
`,
);

const tsx = join(root, "node_modules/.bin/tsx");
const r = spawnSync(tsx, [tmp], { cwd: root, stdio: "inherit", env: process.env });
process.exit(r.status ?? 1);
