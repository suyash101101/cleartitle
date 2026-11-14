#!/usr/bin/env node
/**
 * No-wallet heist — mid-payout title flip + expected refuses.
 * Prints evidence JSON and writes scripts/heist-last.json.
 * Usage: pnpm heist
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts");
const tmp = join(outDir, ".tmp-heist.mjs");
const evidencePath = join(outDir, "heist-last.json");

writeFileSync(
  tmp,
  `
import { writeFileSync } from "node:fs";
import {
  assertCleanToBuy,
  buySeat,
  claimPayout,
  continuityHash,
  deriveBtcAddress,
  deriveSolAddress,
  labHeldSig,
  labListedWithdraw,
  labOldOwnerWithdraw,
  listSeat,
  offerLease,
  requestRawSign,
  runDiligence,
  seedDemoNight,
  settleLease,
  takeLease,
} from "../packages/sdk/src/index.ts";

const world = seedDemoNight();
const seat = world.seats["3"];
if (!seat) { console.error("HEIST FAIL — no seat 3"); process.exit(1); }

const before = {
  owner: seat.owner,
  continuity: seat.continuityHash,
  btc: seat.btcAddress,
  sol: seat.solAddress,
  keyEpoch: seat.keyEpoch,
  pending: seat.pending.filter((p) => p.status === "PENDING").length,
};

// 1) Held-sig refuse while listed (foreign-chain seal + encumbrance)
const seller = seat.owner;
const nonce = listSeat(world, seller, "3", 100);
const epochAfterList = seat.keyEpoch;
if (epochAfterList <= before.keyEpoch) {
  console.error("HEIST FAIL — sign-epoch did not bump on list");
  process.exit(1);
}
const held = labHeldSig(world, seller, "3");
if (!/refused|freeze/i.test(held.reason)) {
  console.error("HEIST FAIL — held sig", held);
  process.exit(1);
}

// 2) Listed withdraw refuse
const listed = labListedWithdraw(world, seller, "3");
if (!/encumbered/i.test(listed.reason)) {
  console.error("HEIST FAIL — listed withdraw", listed);
  process.exit(1);
}

// 3) Policy gate CLEAN then mid-payout buy
assertCleanToBuy(world, "3");
const buyer = "priya.near";
const { rebounded, txHash } = buySeat(world, buyer, "3", 100, nonce);
if (seat.owner !== buyer || rebounded <= 0) {
  console.error("HEIST FAIL — buy", { owner: seat.owner, rebounded });
  process.exit(1);
}

// 4) Old owner withdraw refuse (seller recall)
const old = labOldOwnerWithdraw(world, seller, "3");
if (!/not current owner/i.test(old.reason)) {
  console.error("HEIST FAIL — old owner", old);
  process.exit(1);
}

// 5) Tip address continuity across sale
const after = {
  owner: seat.owner,
  continuity: seat.continuityHash,
  btc: seat.btcAddress,
  sol: seat.solAddress,
  keyEpoch: seat.keyEpoch,
};
if (after.btc !== before.btc || after.sol !== before.sol || after.continuity !== before.continuity) {
  console.error("HEIST FAIL — tip continuity broken", { before, after });
  process.exit(1);
}
const expectedBtc = deriveBtcAddress(seat.vaultAccountId);
const expectedSol = deriveSolAddress(seat.vaultAccountId);
if (after.btc !== expectedBtc || after.sol !== expectedSol) {
  console.error("HEIST FAIL — derive mismatch");
  process.exit(1);
}

// 6) Lease reverse-heist (preview engine): renter claims, expiry settles title clear
offerLease(world, buyer, "3", 5, 120_000);
takeLease(world, "renter.near", "3", 5, seat.leaseNonce);
const leaseBlocked = (() => {
  try { listSeat(world, buyer, "3", 50); return false; } catch { return true; }
})();
if (!leaseBlocked) {
  console.error("HEIST FAIL — list allowed under active lease");
  process.exit(1);
}
settleLease(world, buyer, "3");
const d = runDiligence(world, "3");
if (d.verdict !== "PROVABLY CLEAN") {
  console.error("HEIST FAIL — diligence after settle", d);
  process.exit(1);
}

const evidence = {
  ok: true,
  at: new Date().toISOString(),
  walletRequired: false,
  story: "mid-payout heist · seller recall refuse · tip continuity · lease reverse",
  before,
  after,
  rebounded,
  txHash,
  refuses: {
    heldSig: held.reason,
    listedWithdraw: listed.reason,
    oldOwnerWithdraw: old.reason,
  },
  continuity: {
    hash: after.continuity,
    expectedHash: continuityHash(seat.vaultAccountId),
    btc: after.btc,
    sol: after.sol,
  },
  signEpoch: { beforeList: before.keyEpoch, afterList: epochAfterList, afterSale: after.keyEpoch },
  diligence: d.verdict,
};

writeFileSync(${JSON.stringify(evidencePath)}, JSON.stringify(evidence, null, 2));
console.log("HEIST OK");
console.log(JSON.stringify(evidence, null, 2));
`,
);

mkdirSync(outDir, { recursive: true });
const tsx = join(root, "node_modules/.bin/tsx");
const r = spawnSync(tsx, [tmp], { cwd: root, stdio: "inherit", env: process.env });
if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);

// P1: re-check filmed explorer hashes on live RPC (jaypopat pattern).
const live = spawnSync(process.execPath, [join(outDir, "heist-live.mjs")], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(live.status ?? 1);
