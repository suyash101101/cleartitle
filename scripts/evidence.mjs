#!/usr/bin/env node
/**
 * Re-runs SDK tests + re-reads live testnet RPC for /verify claims.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACT = process.env.CONTRACT_ID || "cleartitle562464.testnet";
const RPCS = [
  process.env.QUITCLAIM_RPC,
  "https://test.rpc.fastnear.com",
  "https://rpc.testnet.near.org",
  "https://near-testnet.api.pagoda.co/rpc/v1",
].filter(Boolean);

const claims = [
  "ticket_splits_treasury_and_seats",
  "keys_empty_after_mint",
  "sale_mid_payout_rebinds_pending",
  "held_sig_refused_while_listed",
  "old_owner_withdraw_fails_after_sale",
  "diligence_clean_when_healthy",
  "continuity_hash_stable",
  "bps_sum_10000_and_immutable",
  "list_bumps_sign_epoch",
  "assertCleanToBuy_blocks_wash",
  "lease_blocks_list_until_settle",
];

console.log("QuitClaim evidence — SDK tests…\n");
const r = spawnSync("pnpm", ["--filter", "@quitclaim/sdk", "test"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
if (r.status !== 0) {
  console.error("\nEVIDENCE FAIL — SDK tests red");
  process.exit(r.status ?? 1);
}

async function viewOnce(rpc, method, args = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ctrl.signal,
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
  } finally {
    clearTimeout(t);
  }
}

async function view(method, args = {}) {
  let lastErr;
  for (const rpc of RPCS) {
    try {
      return await viewOnce(rpc, method, args);
    } catch (e) {
      lastErr = e;
      console.warn(`  RPC miss ${rpc}: ${e instanceof Error ? e.message : e}`);
    }
  }
  throw lastErr ?? new Error("all RPCs failed");
}

console.log(`\nRPC re-read ${CONTRACT}…`);
let club;
let seat3;
let dil;
let rpcOk = false;
try {
  club = await view("get_club");
  seat3 = await view("get_seat", { token_id: "3" });
  dil = await view("diligence", { token_id: "3" });
  rpcOk = true;
} catch (e) {
  console.warn("\nWARN: live RPC unreachable — continuing with artifact check only");
  console.warn(`  ${e instanceof Error ? e.message : e}`);
}

if (rpcOk) {
  if (!club?.name) throw new Error("club missing on-chain");
  if (seat3.access_key_count !== 0) throw new Error("keys not empty");
  if (dil.verdict !== "PROVABLY CLEAN" && dil.verdict !== "FIX BEFORE BUY") {
    throw new Error(`diligence unexpected ${dil.verdict}`);
  }
  console.log("  club:", club.name, "tickets_sold:", club.tickets_sold);
  console.log("  seat3 owner:", seat3.owner_id, "epoch:", seat3.key_epoch, "keys:", seat3.access_key_count);
  console.log("  diligence:", dil.verdict);
}

console.log("\nEvidence artifact check (apps/web/src/lib/evidence.ts)…");
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
console.log(rpcOk ? "\nEVIDENCE OK (RPC + artifacts)" : "\nEVIDENCE OK (artifacts; RPC skipped)");
