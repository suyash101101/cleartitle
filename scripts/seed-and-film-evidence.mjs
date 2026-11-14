#!/usr/bin/env node
/**
 * After WASM deploy + migrate_reset: seed two venues and film unique Lab txs.
 * Writes apps/web/src/lib/evidence.ts
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "apps/web/package.json"));
const { Account, JsonRpcProvider, KeyPair, KeyPairSigner } = require("near-api-js");

const CONTRACT = process.env.CONTRACT_ID || "cleartitle562464.testnet";
const RPC = process.env.NEAR_RPC || "https://rpc.testnet.near.org";
const SELLER = process.env.OWNER_ID || "ctbuyer563070.testnet";
const ORGANIZER = process.env.ORGANIZER_ID || CONTRACT;
const CRED_DIR = join(homedir(), ".near-credentials", "testnet");
const ASK = "100";
const TICKET = "10";

const provider = new JsonRpcProvider({ url: RPC });

function loadAccount(accountId) {
  const path = join(CRED_DIR, `${accountId}.json`);
  if (!existsSync(path)) throw new Error(`missing credentials ${path}`);
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const key = raw.private_key || raw.secret_key || raw.secretKey;
  return new Account(accountId, provider, new KeyPairSigner(KeyPair.fromString(key)));
}

function extractHash(errOrResult) {
  if (!errOrResult) return null;
  const candidates = [
    errOrResult?.transaction_outcome?.id,
    errOrResult?.transactionResult?.transaction_outcome?.id,
    errOrResult?.transactionResult?.transaction?.hash,
    errOrResult?.transaction?.hash,
    errOrResult?.hash,
  ].filter(Boolean);
  if (candidates[0]) return candidates[0];
  const s = typeof errOrResult === "string" ? errOrResult : JSON.stringify(errOrResult);
  const m = s.match(/\b([A-Za-z0-9]{43,44})\b/);
  return m?.[1] ?? null;
}

async function callRaw(account, method, args = {}, deposit = "0") {
  try {
    const outcome = await account.callFunctionRaw({
      contractId: CONTRACT,
      methodName: method,
      args,
      gas: "100000000000000",
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
    const panic = e?.kind?.ExecutionError || e?.type || e?.message || String(e);
    return { ok: false, hash, panic: String(panic).slice(0, 280), raw: e };
  }
}

async function view(method, args = {}) {
  const res = await provider.query({
    request_type: "call_function",
    finality: "final",
    account_id: CONTRACT,
    method_name: method,
    args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
  });
  if (res.error) throw new Error(String(res.error));
  return JSON.parse(Buffer.from(Uint8Array.from(res.result)).toString());
}

function must(label, r, { expectOk } = {}) {
  const want = expectOk !== false;
  console.log(
    `  ${label}:`,
    want ? (r.ok ? "OK" : "FAIL") : r.ok ? "UNEXPECTED OK" : "EXPECTED FAIL",
    r.hash || "",
    r.panic || "",
  );
  if (want && !r.ok) {
    console.error(r.raw || r.panic);
    process.exit(1);
  }
  if (!want && r.ok) {
    console.error("expected failure", r);
    process.exit(1);
  }
  if (!r.hash) {
    console.error("missing tx hash", label);
    process.exit(1);
  }
  return r.hash;
}

const organizer = loadAccount(ORGANIZER);
const seller = loadAccount(SELLER);
const out = {};

console.log("Seed venue A: nearnight…");
out.createClub = must(
  "create_club nearnight",
  await callRaw(organizer, "create_club", {
    club_id: "nearnight",
    name: "Nearnight Live",
    ticket_price: TICKET,
    seat_bps: [1000, 1000, 1000, 1000, 1000],
    treasury_bps: 5000,
    royalty_bps: 500,
    seat_kinds: ["A", "A", "B", "B", "C"],
  }),
);
out.mintSeats = must(
  "mint_seats nearnight",
  await callRaw(organizer, "mint_seats", { club_id: "nearnight" }),
);

console.log("Seed venue B: dayfest…");
must(
  "create_club dayfest",
  await callRaw(organizer, "create_club", {
    club_id: "dayfest",
    name: "Dayfest",
    ticket_price: "25",
    seat_bps: [2500, 2500, 5000],
    treasury_bps: 0,
    royalty_bps: 250,
    seat_kinds: [],
  }),
);
must("mint_seats dayfest", await callRaw(organizer, "mint_seats", { club_id: "dayfest" }));

const clubs = await view("list_clubs", {});
console.log("list_clubs →", clubs);
if (!Array.isArray(clubs) || clubs.length < 2) {
  console.error("expected ≥2 clubs");
  process.exit(1);
}

console.log("Ticket + claim…");
out.buyTicket = must(
  "buy_ticket",
  await callRaw(seller, "buy_ticket", { club_id: "nearnight" }, TICKET),
);
out.claimPayout = must(
  "claim_payout",
  await callRaw(organizer, "claim_payout", {
    token_id: "3",
    amount: "1",
    club_id: "nearnight",
  }),
);

console.log("Move seat #3 to seller…");
{
  must(
    "list @1",
    await callRaw(organizer, "list_seat", { token_id: "3", ask: "1", club_id: "nearnight" }),
  );
  const seat = await view("get_seat", { token_id: "3", club_id: "nearnight" });
  must(
    "seller buy @1",
    await callRaw(
      seller,
      "buy_seat",
      { token_id: "3", sync_nonce: seat.listing_nonce, club_id: "nearnight" },
      "1",
    ),
  );
}

console.log("Film Lab…");
{
  const before = await view("get_seat", { token_id: "3", club_id: "nearnight" });
  if (before.owner_id !== SELLER) {
    console.error("expected seller owner", before);
    process.exit(1);
  }
  out.listSeat = must(
    "list @100",
    await callRaw(seller, "list_seat", { token_id: "3", ask: ASK, club_id: "nearnight" }),
  );
  const listed = await view("get_seat", { token_id: "3", club_id: "nearnight" });
  const nonce = listed.listing_nonce;

  out.heldSigRefuse = must(
    "held-sig",
    await callRaw(seller, "request_raw_sign", { token_id: "3", club_id: "nearnight" }),
    { expectOk: false },
  );
  out.listedWithdrawRefuse = must(
    "listed withdraw",
    await callRaw(seller, "withdraw", { token_id: "3", amount: "1", club_id: "nearnight" }),
    { expectOk: false },
  );
  out.buySeatMidPayout = must(
    "mid buy",
    await callRaw(
      organizer,
      "buy_seat",
      { token_id: "3", sync_nonce: nonce, club_id: "nearnight" },
      ASK,
    ),
  );
  out.oldOwnerWithdrawRefuse = must(
    "old owner",
    await callRaw(seller, "withdraw", { token_id: "3", amount: "1", club_id: "nearnight" }),
    { expectOk: false },
  );
}

const dil = await view("diligence", { token_id: "3", club_id: "nearnight" });
const seat = await view("get_seat", { token_id: "3", club_id: "nearnight" });
console.log("post", { clubs, dil: dil.verdict, owner: seat.owner_id, enc: seat.encumbrance });

const evidencePath = join(root, "apps/web/src/lib/evidence.ts");
writeFileSync(
  evidencePath,
  `/** Live proof artifacts from the published CleanDeed specimen. */

import { CONTRACT_ID as BOUND_CONTRACT, EXPLORER as BOUND_EXPLORER } from "@/lib/near";

export const CONTRACT_ID = BOUND_CONTRACT;
export const EXPLORER = BOUND_EXPLORER.includes("explorer")
  ? "https://testnet.nearblocks.io"
  : "https://testnet.nearblocks.io";

export const ONCHAIN = {
  createClub: "${out.createClub}",
  mintSeats: "${out.mintSeats}",
  buyTicket: "${out.buyTicket}",
  claimPayout: "${out.claimPayout}",
  listSeat: "${out.listSeat}",
  heldSigRefuse: "${out.heldSigRefuse}",
  buySeatMidPayout: "${out.buySeatMidPayout}",
  oldOwnerWithdrawRefuse: "${out.oldOwnerWithdrawRefuse}",
  listedWithdrawRefuse: "${out.listedWithdrawRefuse}",
} as const;

export function txUrl(id: string) {
  return \`\${EXPLORER}/txns/\${id}\`;
}

/** Each Lab row maps to a unique filmed testnet hash. */
export const LAB_ATTACKS = [
  {
    id: "held",
    title: "Held-sig raw sign while listed",
    reason: "epoch freeze: raw sign refused while seat encumbered",
    tx: ONCHAIN.heldSigRefuse,
    success: false,
  },
  {
    id: "old",
    title: "Old owner withdraw after sale",
    reason: "withdraw refused: not current owner",
    tx: ONCHAIN.oldOwnerWithdrawRefuse,
    success: false,
  },
  {
    id: "listed",
    title: "Withdraw while listed",
    reason: "withdraw refused: encumbered",
    tx: ONCHAIN.listedWithdrawRefuse,
    success: false,
  },
  {
    id: "mid",
    title: "Mid-payout seat purchase",
    reason: "pending rebound + ownership flip (success path)",
    tx: ONCHAIN.buySeatMidPayout,
    success: true,
  },
  {
    id: "seal",
    title: "Sign-epoch bump on list",
    reason: "foreign-chain seal — key_epoch increments on list_seat",
    tx: ONCHAIN.listSeat,
    success: true,
  },
  {
    id: "ticket",
    title: "Ticket buy splits treasury + seats",
    reason: "buy_ticket credits venue economics",
    tx: ONCHAIN.buyTicket,
    success: true,
  },
] as const;
`,
);
writeFileSync(
  join(root, "scripts/evidence-last.json"),
  JSON.stringify({ at: new Date().toISOString(), clubs, dil, seat, out }, null, 2),
);
console.log("Updated", evidencePath);
console.log("SEED + FILM OK");
