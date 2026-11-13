#!/usr/bin/env node
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, "scripts/.tmp-demo.mjs");
mkdirSync(join(root, "scripts"), { recursive: true });
writeFileSync(
  tmp,
  `
import { seedDemoNight } from "../packages/sdk/src/index.ts";
const world = seedDemoNight();
const seat = world.seats["3"];
console.log(JSON.stringify({
  club: world.club?.name,
  ticketsSold: world.club?.ticketsSold,
  seat3: {
    owner: seat.owner,
    pending: seat.pending,
    balance: seat.balance,
    continuityHash: seat.continuityHash,
    keys: seat.accessKeyCount,
  },
}, null, 2));
`,
);

const tsx = join(root, "node_modules/.bin/tsx");
const r = spawnSync(tsx, [tmp], { cwd: root, stdio: "inherit", env: process.env });
process.exit(r.status ?? 1);
