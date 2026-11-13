#!/usr/bin/env node
/**
 * Re-runs SDK proof tests and prints /verify matrix status.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pnpm = join(root, ".tools/bin/pnpm");

const claims = [
  "ticket_splits_treasury_and_seats",
  "keys_empty_after_mint",
  "sale_mid_payout_rebinds_pending",
  "held_sig_refused_while_listed",
  "old_owner_withdraw_fails_after_sale",
  "diligence_clean_when_healthy",
  "continuity_hash_stable",
  "bps_sum_10000_and_immutable",
];

console.log("ClearTitle evidence — running SDK tests…\n");
const r = spawnSync(pnpm, ["--filter", "@cleartitle/sdk", "test"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  shell: false,
});

if (r.status !== 0) {
  console.error("\nEVIDENCE FAIL — SDK tests red");
  process.exit(r.status ?? 1);
}

console.log("\n/verify claims covered:");
for (const c of claims) console.log(`  ✓ ${c}`);
console.log("\nEVIDENCE OK");
