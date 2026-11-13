import {
  SEAT_KINDS,
  type ClubConfig,
  type DiligenceReport,
  type LabResult,
  type Seat,
  type TicketEvent,
  type WorldState,
} from "./types";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function txHash(n: number): string {
  return `0xct${n.toString(16).padStart(8, "0")}`;
}

function continuityHash(vaultAccountId: string): string {
  // Stable across sales — derivation fixed to vault account id
  let h = 0;
  const s = `${vaultAccountId}|bitcoin|solana`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `cont_${h.toString(16)}`;
}

function deriveBtc(vaultAccountId: string): string {
  const h = continuityHash(vaultAccountId).slice(5);
  return `bc1q${h.padEnd(38, "0").slice(0, 38)}`;
}

function deriveSol(vaultAccountId: string): string {
  const h = continuityHash(vaultAccountId).slice(5);
  return `${h}SoL${"1".repeat(32)}`.slice(0, 44);
}

export function createWorld(actors: string[] = ["organizer.near", "ada.near", "priya.near", "fan.near"]): WorldState {
  return {
    network: "demo",
    club: null,
    seats: {},
    tickets: [],
    actors,
    nextPayoutId: 1,
    nextTx: 1,
  };
}

export function createClub(
  world: WorldState,
  opts: {
    clubId?: string;
    name: string;
    organizer: string;
    ticketPrice: number;
    seatBps: number[];
    treasuryBps: number;
    royaltyBps?: number;
  },
): ClubConfig {
  assert(!world.club, "club already exists");
  const sum = opts.seatBps.reduce((a, b) => a + b, 0) + opts.treasuryBps;
  assert(sum === 10000, `bps must sum to 10000, got ${sum}`);
  assert(opts.seatBps.length > 0, "need at least one seat bps");
  assert(opts.ticketPrice > 0, "ticket price must be positive");

  const club: ClubConfig = {
    clubId: opts.clubId ?? "nearnight",
    name: opts.name,
    organizer: opts.organizer,
    ticketPrice: opts.ticketPrice,
    seatBps: [...opts.seatBps],
    treasuryBps: opts.treasuryBps,
    royaltyBps: opts.royaltyBps ?? 500,
    maxSeats: opts.seatBps.length,
    paused: false,
    treasuryBalance: 0,
    ticketsSold: 0,
  };
  world.club = club;
  return club;
}

export function mintSeats(world: WorldState, owner: string): Seat[] {
  const club = world.club;
  assert(club, "no club");
  assert(Object.keys(world.seats).length === 0, "seats already minted");
  assert(owner === club.organizer, "only organizer mints");

  const seats: Seat[] = [];
  for (let i = 0; i < club.maxSeats; i++) {
    const tokenId = String(i + 1);
    const vaultAccountId = `seat-${tokenId}.${club.clubId}.near`;
    const seat: Seat = {
      tokenId,
      vaultAccountId,
      owner,
      kind: SEAT_KINDS[i]?.id ?? "floor",
      encumbrance: "FREE",
      balance: 0,
      pending: [],
      seatBps: club.seatBps[i]!,
      ticketsAccrued: 0,
      keyEpoch: 1,
      listingAsk: null,
      listingNonce: 0,
      continuityHash: continuityHash(vaultAccountId),
      btcAddress: deriveBtc(vaultAccountId),
      solAddress: deriveSol(vaultAccountId),
      accessKeyCount: 0,
      openRawSigs: 0,
      washFlagged: false,
      holderHistory: [{ owner, from: Date.now(), to: null }],
      ledger: [{ at: Date.now(), kind: "mint", amount: 0, note: "founding seat minted · 0 access keys" }],
    };
    world.seats[tokenId] = seat;
    seats.push(seat);
  }
  return seats;
}

export function setPaused(world: WorldState, organizer: string, paused: boolean): void {
  const club = world.club;
  assert(club, "no club");
  assert(organizer === club.organizer, "only organizer");
  club.paused = paused;
}

export function buyTicket(world: WorldState, buyer: string, payment: number): TicketEvent {
  const club = world.club;
  assert(club, "no club");
  assert(!club.paused, "club paused");
  assert(Object.keys(world.seats).length === club.maxSeats, "seats not minted");
  assert(payment === club.ticketPrice, `price mismatch: need ${club.ticketPrice}`);

  const treasuryCut = Math.floor((payment * club.treasuryBps) / 10000);
  const seatCuts: { tokenId: string; amount: number }[] = [];
  let allocated = treasuryCut;

  for (const seat of Object.values(world.seats)) {
    const amount = Math.floor((payment * seat.seatBps) / 10000);
    seat.balance += amount;
    seat.ticketsAccrued += 1;
    seat.ledger.push({
      at: Date.now(),
      kind: "ticket_cut",
      amount,
      note: `ticket #${club.ticketsSold + 1} cut`,
    });
    seatCuts.push({ tokenId: seat.tokenId, amount });
    allocated += amount;
  }

  // Dust to treasury so split is exact
  const dust = payment - allocated;
  club.treasuryBalance += treasuryCut + dust;
  club.ticketsSold += 1;

  const event: TicketEvent = {
    at: Date.now(),
    buyer,
    price: payment,
    treasuryCut: treasuryCut + dust,
    seatCuts,
    txHash: txHash(world.nextTx++),
  };
  world.tickets.push(event);
  return event;
}

export function claimPayout(world: WorldState, actor: string, tokenId: string, amount?: number): string {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  assert(actor === seat.owner, "only owner can claim");
  assert(seat.encumbrance === "FREE", `encumbered: ${seat.encumbrance}`);
  const claimAmount = amount ?? seat.balance;
  assert(claimAmount > 0, "nothing to claim");
  assert(claimAmount <= seat.balance, "insufficient vault balance");

  seat.balance -= claimAmount;
  const id = `payout-${world.nextPayoutId++}`;
  seat.pending.push({
    id,
    tokenId,
    amount: claimAmount,
    status: "PENDING",
    createdAt: Date.now(),
    sourceTicket: world.club?.ticketsSold ?? 0,
  });
  seat.ledger.push({ at: Date.now(), kind: "claim_pending", amount: claimAmount, note: id });
  return id;
}

export function settlePayout(world: WorldState, tokenId: string, payoutId: string): void {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  const p = seat.pending.find((x) => x.id === payoutId);
  assert(p, "payout not found");
  assert(p.status === "PENDING" || p.status === "REBOUND_TO_BUYER", "not pending");
  p.status = "SETTLED";
  seat.ledger.push({ at: Date.now(), kind: "settled", amount: p.amount, note: payoutId });
}

export function listSeat(world: WorldState, actor: string, tokenId: string, ask: number): number {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  assert(actor === seat.owner, "only owner can list");
  assert(seat.encumbrance === "FREE", "already encumbered");
  assert(ask > 0, "ask must be positive");
  assert(seat.openRawSigs === 0, "open raw signatures block listing");

  seat.encumbrance = "LISTED";
  seat.listingAsk = ask;
  seat.listingNonce += 1;
  seat.ledger.push({ at: Date.now(), kind: "list", amount: ask, note: `nonce ${seat.listingNonce}` });
  return seat.listingNonce;
}

export function delistSeat(world: WorldState, actor: string, tokenId: string): void {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  assert(actor === seat.owner, "only owner");
  assert(seat.encumbrance === "LISTED", "not listed");
  seat.encumbrance = "FREE";
  seat.listingAsk = null;
  seat.ledger.push({ at: Date.now(), kind: "delist", amount: 0, note: "delisted" });
}

export function buySeat(
  world: WorldState,
  buyer: string,
  tokenId: string,
  payment: number,
  syncNonce: number,
): { txHash: string; rebounded: number } {
  const club = world.club;
  assert(club, "no club");
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  assert(seat.encumbrance === "LISTED", "seat not listed");
  assert(seat.listingAsk !== null, "no ask");
  assert(payment === seat.listingAsk, `ask mismatch: need ${seat.listingAsk}`);
  assert(syncNonce === seat.listingNonce, "stale listing nonce — refund path");
  assert(buyer !== seat.owner, "cannot buy own seat");

  seat.encumbrance = "SETTLING";
  const seller = seat.owner;
  const royalty = Math.floor((payment * club.royaltyBps) / 10000);
  club.treasuryBalance += royalty;

  let rebounded = 0;
  for (const p of seat.pending) {
    if (p.status === "PENDING") {
      p.status = "REBOUND_TO_BUYER";
      rebounded += p.amount;
    }
  }

  const hist = seat.holderHistory[seat.holderHistory.length - 1];
  if (hist && hist.to === null) hist.to = Date.now();
  seat.holderHistory.push({ owner: buyer, from: Date.now(), to: null });

  seat.owner = buyer;
  seat.keyEpoch += 1;
  seat.openRawSigs = 0;
  seat.accessKeyCount = 0;
  seat.encumbrance = "FREE";
  seat.listingAsk = null;
  // continuity addresses unchanged — intentional
  seat.ledger.push({
    at: Date.now(),
    kind: "sale",
    amount: payment,
    note: `sold by ${seller} → ${buyer}; rebound ${rebounded}; epoch ${seat.keyEpoch}`,
  });

  return { txHash: txHash(world.nextTx++), rebounded };
}

/** Attempt raw foreign-chain sign — fails when listed / settling (held-sig defense). */
export function requestRawSign(world: WorldState, actor: string, tokenId: string): never | void {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  assert(actor === seat.owner, "only owner");
  if (seat.encumbrance === "LISTED" || seat.encumbrance === "SETTLING") {
    throw new Error("epoch freeze: raw sign refused while seat encumbered");
  }
  seat.openRawSigs += 1;
}

export function withdrawVault(world: WorldState, actor: string, tokenId: string, amount: number): void {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  if (actor !== seat.owner) throw new Error("withdraw refused: not current owner");
  if (seat.encumbrance !== "FREE") throw new Error(`withdraw refused: encumbered ${seat.encumbrance}`);
  assert(amount <= seat.balance, "insufficient balance");
  seat.balance -= amount;
  seat.ledger.push({ at: Date.now(), kind: "withdraw", amount, note: "owner withdraw" });
}

export function flagWash(world: WorldState, tokenId: string): void {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  seat.washFlagged = true;
}

export function runDiligence(world: WorldState, tokenId: string): DiligenceReport {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  const expectedCont = continuityHash(seat.vaultAccountId);
  const checks = [
    {
      id: "keys",
      label: "Vault access keys = 0",
      pass: seat.accessKeyCount === 0,
      detail: `${seat.accessKeyCount} keys on ${seat.vaultAccountId}`,
    },
    {
      id: "epoch",
      label: "Key epoch recorded",
      pass: seat.keyEpoch >= 1,
      detail: `epoch ${seat.keyEpoch}`,
    },
    {
      id: "continuity",
      label: "Chain-sig continuity hash stable",
      pass: seat.continuityHash === expectedCont,
      detail: seat.continuityHash,
    },
    {
      id: "raw_sigs",
      label: "No open raw signatures",
      pass: seat.openRawSigs === 0,
      detail: `${seat.openRawSigs} open`,
    },
    {
      id: "pending",
      label: "Pending payouts bound to token_id",
      pass: seat.pending.every((p) => p.tokenId === tokenId),
      detail: `${seat.pending.filter((p) => p.status === "PENDING" || p.status === "REBOUND_TO_BUYER").length} open`,
    },
    {
      id: "wash",
      label: "No wash-trade flag",
      pass: !seat.washFlagged,
      detail: seat.washFlagged ? "FLAGGED" : "clean",
    },
    {
      id: "nonce",
      label: "Listing sync_nonce coherent",
      pass: seat.encumbrance !== "LISTED" || seat.listingNonce > 0,
      detail: `nonce ${seat.listingNonce} · ${seat.encumbrance}`,
    },
  ];
  const verdict = checks.every((c) => c.pass) ? "PROVABLY CLEAN" : "FIX BEFORE BUY";
  return { tokenId, verdict, checks };
}

export function labOldOwnerWithdraw(
  world: WorldState,
  oldOwner: string,
  tokenId: string,
): LabResult {
  try {
    withdrawVault(world, oldOwner, tokenId, 1);
    return {
      attack: "old_owner_withdraw",
      success: false,
      reason: "UNEXPECTED: withdraw succeeded",
      explorerHint: "lab://unexpected-success",
    };
  } catch (e) {
    return {
      attack: "old_owner_withdraw",
      success: false,
      reason: e instanceof Error ? e.message : String(e),
      explorerHint: `lab://fail/${txHash(world.nextTx)}`,
    };
  }
}

export function labListedWithdraw(world: WorldState, owner: string, tokenId: string): LabResult {
  try {
    withdrawVault(world, owner, tokenId, 1);
    return {
      attack: "listed_withdraw",
      success: false,
      reason: "UNEXPECTED: withdraw succeeded",
      explorerHint: "lab://unexpected-success",
    };
  } catch (e) {
    return {
      attack: "listed_withdraw",
      success: false,
      reason: e instanceof Error ? e.message : String(e),
      explorerHint: `lab://fail/${txHash(world.nextTx)}`,
    };
  }
}

export function labHeldSig(world: WorldState, owner: string, tokenId: string): LabResult {
  try {
    requestRawSign(world, owner, tokenId);
    return {
      attack: "held_sig",
      success: false,
      reason: "UNEXPECTED: raw sign allowed",
      explorerHint: "lab://unexpected-success",
    };
  } catch (e) {
    return {
      attack: "held_sig",
      success: false,
      reason: e instanceof Error ? e.message : String(e),
      explorerHint: `lab://fail/${txHash(world.nextTx)}`,
    };
  }
}

export function labWashPath(world: WorldState, tokenId: string): LabResult {
  flagWash(world, tokenId);
  const d = runDiligence(world, tokenId);
  return {
    attack: "wash_flag",
    success: false,
    reason: d.verdict === "FIX BEFORE BUY" ? "wash flagged · diligence FIX" : "wash not reflected",
    explorerHint: `lab://wash/${tokenId}`,
  };
}

/** Seed Nearnight Live demo world ready for mid-payout sale. */
export function seedDemoNight(): WorldState {
  const world = createWorld();
  createClub(world, {
    name: "Nearnight Live",
    organizer: "organizer.near",
    ticketPrice: 10,
    seatBps: [1000, 1000, 1000, 1000, 1000],
    treasuryBps: 5000,
    royaltyBps: 500,
  });
  mintSeats(world, "organizer.near");
  // Transfer seat 3 to Ada for the story
  const seat3 = world.seats["3"]!;
  seat3.owner = "ada.near";
  seat3.holderHistory[0]!.to = Date.now();
  seat3.holderHistory.push({ owner: "ada.near", from: Date.now(), to: null });
  buyTicket(world, "fan.near", 10);
  buyTicket(world, "fan.near", 10);
  claimPayout(world, "ada.near", "3", 0.5);
  return world;
}

export const VERIFY_CLAIMS = [
  {
    claim: "Ticket revenue splits to treasury + seat vaults by BPS",
    method: "buy_ticket",
    test: "ticket_splits_treasury_and_seats",
  },
  {
    claim: "Seat vaults mint with 0 access keys",
    method: "mint_seats",
    test: "keys_empty_after_mint",
  },
  {
    claim: "Mid-payout sale rebinds pending cuts to buyer",
    method: "buy_seat",
    test: "sale_mid_payout_rebinds_pending",
  },
  {
    claim: "Listed seats refuse raw chain-sig drains",
    method: "request_raw_sign",
    test: "held_sig_refused_while_listed",
  },
  {
    claim: "Old owner cannot withdraw after sale",
    method: "withdraw",
    test: "old_owner_withdraw_fails_after_sale",
  },
  {
    claim: "Diligence reports PROVABLY CLEAN when checks pass",
    method: "run_diligence",
    test: "diligence_clean_when_healthy",
  },
  {
    claim: "Chain-sig continuity hash unchanged across sale",
    method: "continuity_hash",
    test: "continuity_hash_stable",
  },
  {
    claim: "BPS immutable after mint; sum always 10000",
    method: "create_club",
    test: "bps_sum_10000_and_immutable",
  },
] as const;
