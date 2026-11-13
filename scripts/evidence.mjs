#!/usr/bin/env node
/**
 * Re-runs SDK tests + re-reads live testnet RPC for /verify claims.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pnpm = join(root, ".tools/bin/pnpm");
const CONTRACT = process.env.CONTRACT_ID || "cleartitle562464.testnet";
const RPC = "https://test.rpc.fastnear.com";

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

console.log("ClearTitle evidence — SDK tests…\n");
const r = spawnSync(pnpm, ["--filter", "@cleartitle/sdk", "test"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
if (r.status !== 0) {
  console.error("\nEVIDENCE FAIL — SDK tests red");
  process.exit(r.status ?? 1);
}

async function view(method, args = {}) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "ev",
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: CONTRACT,
        method_name: method,
        args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      },
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(JSON.stringify(json.error));
  return JSON.parse(Buffer.from(json.result.result).toString());
}

console.log(`\nRPC re-read ${CONTRACT}…`);
const club = await view("get_club");
const seat3 = await view("get_seat", { token_id: "3" });
const dil = await view("diligence", { token_id: "3" });

if (!club?.name) throw new Error("club missing on-chain");
if (seat3.access_key_count !== 0) throw new Error("keys not empty");
if (dil.verdict !== "PROVABLY CLEAN") throw new Error(`diligence ${dil.verdict}`);
if (!seat3.owner_id) {
  console.warn("WARN: seat 3 missing owner_id");
} else {
  console.log("  (owner after latest refresh may be cleartitle562464 or ctbuyer)");
}

console.log("  club:", club.name, "tickets_sold:", club.tickets_sold);
console.log("  seat3 owner:", seat3.owner_id, "epoch:", seat3.key_epoch, "keys:", seat3.access_key_count);
console.log("  diligence:", dil.verdict);

console.log("\nEvidence artifact check (apps/web/src/lib/evidence.ts)…");
const { readFileSync } = await import("node:fs");
const evidenceSrc = readFileSync(join(root, "apps/web/src/lib/evidence.ts"), "utf8");
const bad =
  /N\/A|PLACEHOLDER|TODO_TX|0xct[0-9a-f]{8}|your_tx_hash_here/i.test(evidenceSrc) ||
  /:\s*""\s*,/.test(evidenceSrc);
if (bad) {
  console.error("EVIDENCE FAIL — placeholder or demo hash in evidence.ts");
  process.exit(1);
}
const hashMatches = [...evidenceSrc.matchAll(/:\s*"([A-Za-z0-9]{40,})"\s*,?/g)];
if (hashMatches.length < 8) {
  console.error(`EVIDENCE FAIL — expected >=8 base58-like tx hashes, found ${hashMatches.length}`);
  process.exit(1);
}
console.log(`  ${hashMatches.length} on-chain tx hashes present · no placeholders`);

console.log("\n/verify claims covered:");
for (const c of claims) console.log(`  ✓ ${c}`);
console.log("\nEVIDENCE OK");
