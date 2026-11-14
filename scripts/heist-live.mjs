#!/usr/bin/env node
/**
 * P1 — jaypopat-style no-wallet re-check of filmed refuse / mid-buy hashes.
 * Reads apps/web/src/lib/evidence.ts ONCHAIN hashes and verifies via RPC.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const evidenceSrc = readFileSync(join(root, "apps/web/src/lib/evidence.ts"), "utf8");
const CONTRACT = process.env.CONTRACT_ID || "cleartitle562464.testnet";
const RPCS = [
  process.env.NEAR_RPC,
  "https://test.rpc.fastnear.com",
  "https://rpc.testnet.near.org",
].filter(Boolean);

function grab(key) {
  const m = evidenceSrc.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  return m?.[1] ?? null;
}

const checks = [
  {
    key: "heldSigRefuse",
    expectFail: true,
    needle: /epoch freeze|encumbered/i,
  },
  {
    key: "listedWithdrawRefuse",
    expectFail: true,
    needle: /encumbered/i,
  },
  {
    key: "oldOwnerWithdrawRefuse",
    expectFail: true,
    needle: /not current owner/i,
  },
  {
    key: "buySeatMidPayout",
    expectFail: false,
    needle: null,
  },
  {
    key: "listSeat",
    expectFail: false,
    needle: null,
  },
];

async function rpc(body) {
  let last;
  for (const url of RPCS) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({ jsonrpc: "2.0", id: "heist-live", ...body }),
      });
      clearTimeout(t);
      const json = await res.json();
      if (json.error) throw new Error(JSON.stringify(json.error));
      return json.result;
    } catch (e) {
      last = e;
    }
  }
  throw last ?? new Error("all RPCs failed");
}

async function loadTx(hash, senderGuesses) {
  for (const sender of senderGuesses) {
    try {
      return await rpc({
        method: "tx",
        params: { tx_hash: hash, sender_account_id: sender, wait_until: "NONE" },
      });
    } catch {
      /* try next */
    }
  }
  throw new Error(`UNKNOWN_TRANSACTION ${hash}`);
}

function statusBlob(result) {
  const parts = [JSON.stringify(result?.status ?? {})];
  for (const o of result?.receipts_outcome || []) {
    parts.push(JSON.stringify(o?.outcome?.status ?? {}));
  }
  return parts.join("\n");
}

const senders = [CONTRACT, "ctbuyer563070.testnet"];
const report = { ok: true, at: new Date().toISOString(), contract: CONTRACT, checks: [] };

for (const c of checks) {
  const hash = grab(c.key);
  if (!hash) {
    report.ok = false;
    report.checks.push({ key: c.key, ok: false, error: "missing hash in evidence.ts" });
    continue;
  }
  try {
    const result = await loadTx(hash, senders);
    const blob = statusBlob(result);
    const failed = /Failure|ExecutionError|panick/i.test(blob);
    const success = /SuccessValue/i.test(blob) && !failed;
    let ok = c.expectFail ? failed : success;
    if (c.expectFail && c.needle && !c.needle.test(blob)) ok = false;
    if (!ok) report.ok = false;
    report.checks.push({
      key: c.key,
      hash,
      ok,
      expectFail: c.expectFail,
      failed,
      explorer: `https://testnet.nearblocks.io/txns/${hash}`,
      snippet: blob.slice(0, 220),
    });
    console.log(ok ? "PASS" : "FAIL", c.key, hash.slice(0, 12) + "…");
  } catch (e) {
    report.ok = false;
    report.checks.push({ key: c.key, hash, ok: false, error: String(e) });
    console.error("FAIL", c.key, e);
  }
}

// Live views: two venues + diligence
try {
  async function view(method, args = {}) {
    const result = await rpc({
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: CONTRACT,
        method_name: method,
        args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      },
    });
    return JSON.parse(Buffer.from(result.result).toString());
  }
  const clubs = await view("list_clubs", {});
  const dil = await view("diligence", { token_id: "3", club_id: "nearnight" });
  report.views = { clubs, diligence: dil.verdict };
  if (!Array.isArray(clubs) || clubs.length < 2) {
    report.ok = false;
    console.error("FAIL list_clubs expected ≥2", clubs);
  } else {
    console.log("PASS list_clubs", clubs);
  }
  console.log("PASS diligence", dil.verdict);
} catch (e) {
  report.ok = false;
  report.views = { error: String(e) };
  console.error("FAIL views", e);
}

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
console.log("HEIST LIVE OK");
