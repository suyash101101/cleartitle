#!/usr/bin/env node
/**
 * Re-run live testnet refuses + mid-payout buy; update evidence.ts hashes.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "apps/web/package.json"));
const { Account, JsonRpcProvider, KeyPair, KeyPairSigner } = require("near-api-js");

const CONTRACT = process.env.CONTRACT_ID || "cleartitle562464.testnet";
const RPC = process.env.NEAR_RPC || "https://test.rpc.fastnear.com";
const OWNER = process.env.OWNER_ID || "ctbuyer563070.testnet";
const BUYER = process.env.BUYER_ID || "cleartitle562464.testnet";
const ASK = "100";
const CRED_DIR = join(homedir(), ".near-credentials", "testnet");

const provider = new JsonRpcProvider({ url: RPC });

function loadAccount(accountId) {
  const raw = JSON.parse(readFileSync(join(CRED_DIR, `${accountId}.json`), "utf8"));
  const key = raw.private_key || raw.secret_key || raw.secretKey;
  const signer = new KeyPairSigner(KeyPair.fromString(key));
  return new Account(accountId, provider, signer);
}

function extractHash(errOrResult) {
  if (!errOrResult) return null;
  // Prefer real transaction hashes — never first 44-char match (often block_hash).
  const candidates = [
    errOrResult?.transactionResult?.transaction?.hash,
    errOrResult?.transaction?.hash,
    errOrResult?.transaction_outcome?.id,
  ].filter(Boolean);
  return candidates[0] ?? null;
}

async function call(account, method, args = {}, deposit = "0") {
  try {
    const result = await account.callFunction({
      contractId: CONTRACT,
      methodName: method,
      args,
      gas: "50000000000000",
      deposit,
    });
    // Successful callFunction returns parsed result, not outcome — re-fetch latest tx via raw
    return { ok: true, hash: extractHash(result), result };
  } catch (e) {
    const hash =
      extractHash(e) ||
      extractHash(e?.context) ||
      extractHash(e?.cause) ||
      extractHash(e?.transaction_outcome) ||
      extractHash(e?.receipts_outcome) ||
      extractHash(String(e));
    const panic =
      e?.kind?.ExecutionError ||
      e?.type ||
      e?.message ||
      String(e);
    return { ok: false, hash, panic: String(panic).slice(0, 240), raw: e };
  }
}

async function callRaw(account, method, args = {}, deposit = "0") {
  try {
    const outcome = await account.callFunctionRaw({
      contractId: CONTRACT,
      methodName: method,
      args,
      gas: "50000000000000",
      deposit,
    });
    return { ok: true, hash: extractHash(outcome), outcome };
  } catch (e) {
    const hash =
      extractHash(e) ||
      extractHash(e?.context) ||
      extractHash(e?.cause) ||
      extractHash(e?.transaction_outcome) ||
      extractHash(String(e));
    const panic =
      e?.kind?.ExecutionError ||
      e?.type ||
      e?.message ||
      String(e);
    return { ok: false, hash, panic: String(panic).slice(0, 240), raw: e };
  }
}

async function viewSeat() {
  const res = await provider.query({
    request_type: "call_function",
    finality: "final",
    account_id: CONTRACT,
    method_name: "get_seat",
    args_base64: Buffer.from(JSON.stringify({ token_id: "3" })).toString("base64"),
  });
  const bytes = Uint8Array.from(res.result);
  return JSON.parse(Buffer.from(bytes).toString());
}

const owner = loadAccount(OWNER);
const buyer = loadAccount(BUYER);

console.log(`Refresh on-chain evidence · ${CONTRACT}`);
const before = await viewSeat();
console.log("seat3 before:", {
  owner: before.owner_id,
  enc: before.encumbrance,
  nonce: before.listing_nonce,
  epoch: before.key_epoch,
});

if (before.owner_id !== OWNER) {
  console.error(`Expected owner ${OWNER}, got ${before.owner_id}`);
  process.exit(1);
}
const enc = String(before.encumbrance);
if (enc !== "Free" && enc !== "FREE") {
  console.error("Seat not FREE — abort", enc);
  process.exit(1);
}

const out = {};

console.log("\n1) list_seat @ 100…");
const listed = await callRaw(owner, "list_seat", { token_id: "3", ask: ASK });
out.listSeat = listed.hash;
console.log(listed.ok ? "  OK" : "  FAIL", listed.hash, listed.panic || "");
if (!listed.ok) {
  console.error(listed.raw);
  process.exit(1);
}

const afterList = await viewSeat();
const nonce = afterList.listing_nonce;
console.log("  nonce", nonce);

console.log("\n2) held-sig request_raw_sign while listed (expect fail)…");
const held = await callRaw(owner, "request_raw_sign", { token_id: "3" });
out.heldSigRefuse = held.hash;
console.log(held.ok ? "  UNEXPECTED OK" : "  EXPECTED FAIL", held.hash, held.panic || "");
if (held.ok || !held.hash) {
  console.error(held.raw);
  process.exit(1);
}

console.log("\n3) listed withdraw (expect fail)…");
const listedW = await callRaw(owner, "withdraw", { token_id: "3", amount: "1" });
out.listedWithdrawRefuse = listedW.hash;
console.log(listedW.ok ? "  UNEXPECTED OK" : "  EXPECTED FAIL", listedW.hash, listedW.panic || "");
if (listedW.ok || !listedW.hash) {
  console.error(listedW.raw);
  process.exit(1);
}

console.log("\n4) buy_seat as buyer…");
const bought = await callRaw(buyer, "buy_seat", { token_id: "3", sync_nonce: nonce }, ASK);
out.buySeatMidPayout = bought.hash;
console.log(bought.ok ? "  OK" : "  FAIL", bought.hash, bought.panic || "");
if (!bought.ok) {
  console.error(bought.raw);
  process.exit(1);
}

console.log("\n5) old owner withdraw after sale (expect fail)…");
const old = await callRaw(owner, "withdraw", { token_id: "3", amount: "1" });
out.oldOwnerWithdrawRefuse = old.hash;
console.log(old.ok ? "  UNEXPECTED OK" : "  EXPECTED FAIL", old.hash, old.panic || "");
if (old.ok || !old.hash) {
  console.error(old.raw);
  process.exit(1);
}

const after = await viewSeat();
console.log("\nseat3 after:", {
  owner: after.owner_id,
  enc: after.encumbrance,
  epoch: after.key_epoch,
  nonce: after.listing_nonce,
});

const evidencePath = join(root, "apps/web/src/lib/evidence.ts");
let src = readFileSync(evidencePath, "utf8");
const replacements = [
  ["listSeat", out.listSeat],
  ["heldSigRefuse", out.heldSigRefuse],
  ["buySeatMidPayout", out.buySeatMidPayout],
  ["oldOwnerWithdrawRefuse", out.oldOwnerWithdrawRefuse],
  ["listedWithdrawRefuse", out.listedWithdrawRefuse],
];
for (const [key, hash] of replacements) {
  if (!hash) throw new Error(`missing hash for ${key}`);
  const re = new RegExp(`(${key}:\\s*")[^"]+(")`);
  if (!re.test(src)) throw new Error(`key ${key} not found in evidence.ts`);
  src = src.replace(re, `$1${hash}$2`);
}
writeFileSync(evidencePath, src);

console.log("\nUpdated", evidencePath);
console.log(JSON.stringify(out, null, 2));
console.log("\nREFRESH OK");
