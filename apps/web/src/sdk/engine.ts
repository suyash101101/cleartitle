import { assertVenueSpec, type VenueSpec } from "./config";
import { continuityHash, deriveBtcAddress, deriveSolAddress } from "./derive";
import {
  type ClubConfig,
  type DiligenceReport,
  type LabResult,
  type Seat,
  type SeatKindMeta,
  type TicketEvent,
  type WorldState,
} from "./types";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function txHash(n: number): string {
  return `0xct${n.toString(16).padStart(8, "0")}`;
}

function resolveClub(world: WorldState, clubId?: string): ClubConfig {
  if (clubId) {
    const club = world.clubs[clubId];
    assert(club, `club not found: ${clubId}`);
    return club;
  }
  assert(world.club, "no club");
  return world.club;
}

function seatsForClub(world: WorldState, clubId: string): Seat[] {
  const seen = new Set<string>();
  const out: Seat[] = [];
  for (const s of Object.values(world.seats)) {
    if (s.clubId !== clubId) continue;
    const id = `${s.clubId}:${s.tokenId}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(s);
  }
  return out;
}

/** Resolve a seat by token id, optionally scoped to a club. */
export function getSeat(world: WorldState, tokenId: string, clubId?: string): Seat | undefined {
  if (clubId) return world.seats[`${clubId}:${tokenId}`] ?? world.seats[tokenId];
  return world.seats[tokenId] ?? (world.club ? world.seats[`${world.club.clubId}:${tokenId}`] : undefined);
}

/**
 * Rebuild numeric aliases for the active club from canonical `clubId:tokenId` keys.
 * Call after structured clones (e.g. JSON round-trips in UI stores).
 */
export function hydrateWorld(world: WorldState): WorldState {
  if (!world.clubs) world.clubs = {};
  if (world.club && !world.clubs[world.club.clubId]) {
    world.clubs[world.club.clubId] = world.club;
  }
  for (const club of Object.values(world.clubs)) {
    if (!world.club) world.club = club;
  }
  // Backfill lease fields for worlds persisted before seat-cut lease shipped.
  for (const seat of Object.values(world.seats)) {
    if (seat.lessee === undefined) seat.lessee = null;
    if (seat.leaseExpiresMs === undefined) seat.leaseExpiresMs = 0;
    if (seat.leaseAsk === undefined) seat.leaseAsk = null;
    if (seat.leaseNonce === undefined) seat.leaseNonce = 0;
  }
  const active = world.club?.clubId;
  if (!active) return world;
  for (const seat of seatsForClub(world, active)) {
    world.seats[`${seat.clubId}:${seat.tokenId}`] = seat;
    world.seats[seat.tokenId] = seat;
  }
  return world;
}

export function listSeats(world: WorldState, clubId?: string): Seat[] {
  const id = clubId ?? world.club?.clubId;
  if (!id) return [];
  return seatsForClub(world, id).sort((a, b) => Number(a.tokenId) - Number(b.tokenId));
}

/** Deep-clone a world and re-link active-club seat aliases. */
export function cloneWorld(world: WorldState): WorldState {
  return hydrateWorld(JSON.parse(JSON.stringify(world)) as WorldState);
}

export function createWorld(
  actors: string[] = [],
  network: WorldState["network"] = "testnet",
): WorldState {
  return {
    network,
    clubs: {},
    club: null,
    seats: {},
    tickets: [],
    actors,
    nextPayoutId: 1,
    nextTx: 1,
  };
}

/**
 * Create a venue + mint founding seats in one call (local engine).
 * Use QuitClaimClient.encodeCreateVenue + encodeMintSeats for on-chain.
 */
export function createVenue(
  world: WorldState,
  spec: VenueSpec,
  opts?: { setActive?: boolean },
): { club: ClubConfig; seats: Seat[] } {
  assertVenueSpec(spec);
  const club = createClub(world, {
    clubId: spec.clubId,
    name: spec.name,
    organizer: spec.organizer,
    ticketPrice: spec.ticketPrice,
    seatBps: spec.seatBps,
    treasuryBps: spec.treasuryBps,
    royaltyBps: spec.royaltyBps,
    seatKinds: spec.seatKinds,
    setActive: opts?.setActive,
  });
  const seats = mintSeats(world, spec.organizer, spec.clubId);
  return { club, seats };
}

export function selectClub(world: WorldState, clubId: string): ClubConfig {
  const club = world.clubs[clubId];
  assert(club, `club not found: ${clubId}`);
  world.club = club;
  return club;
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
    seatKinds?: SeatKindMeta[];
    /** When true (default), also set world.club to this venue. */
    setActive?: boolean;
  },
): ClubConfig {
  const clubId =
    opts.clubId ??
    (opts.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "venue");
  assertVenueSpec({
    clubId,
    name: opts.name,
    organizer: opts.organizer,
    ticketPrice: opts.ticketPrice,
    seatBps: opts.seatBps,
    treasuryBps: opts.treasuryBps,
    royaltyBps: opts.royaltyBps,
    seatKinds: opts.seatKinds,
  });
  assert(!world.clubs[clubId], `club already exists: ${clubId}`);

  const club: ClubConfig = {
    clubId,
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
    seatKinds: opts.seatKinds ? [...opts.seatKinds] : undefined,
  };
  world.clubs[clubId] = club;
  if (opts.setActive !== false) world.club = club;
  return club;
}

export function mintSeats(world: WorldState, owner: string, clubId?: string): Seat[] {
  const club = resolveClub(world, clubId);
  assert(owner === club.organizer, "only organizer mints");
  assert(seatsForClub(world, club.clubId).length === 0, "seats already minted");

  const kinds = club.seatKinds;
  const seats: Seat[] = [];
  for (let i = 0; i < club.maxSeats; i++) {
    const tokenId = String(i + 1);
    const seatKey = `${club.clubId}:${tokenId}`;
    const vaultAccountId = `seat-${tokenId}.${club.clubId}.near`;
    const kind = kinds?.[i]?.id ?? `seat-${tokenId}`;
    const seat: Seat = {
      tokenId,
      clubId: club.clubId,
      vaultAccountId,
      owner,
      kind,
      encumbrance: "FREE",
      balance: 0,
      pending: [],
      seatBps: club.seatBps[i]!,
      ticketsAccrued: 0,
      keyEpoch: 1,
      listingAsk: null,
      listingNonce: 0,
      continuityHash: continuityHash(vaultAccountId),
      btcAddress: deriveBtcAddress(vaultAccountId),
      solAddress: deriveSolAddress(vaultAccountId),
      accessKeyCount: 0,
      openRawSigs: 0,
      washFlagged: false,
      lessee: null,
      leaseExpiresMs: 0,
      leaseAsk: null,
      leaseNonce: 0,
      holderHistory: [{ owner, from: Date.now(), to: null }],
      ledger: [{ at: Date.now(), kind: "mint", amount: 0, note: "founding seat minted · 0 access keys" }],
    };
    world.seats[seatKey] = seat;
    // Alias numeric token ids for the active club so demo call sites keep seats["3"].
    if (world.club?.clubId === club.clubId) {
      world.seats[tokenId] = seat;
    }
    seats.push(seat);
  }
  return seats;
}

export function setPaused(world: WorldState, organizer: string, paused: boolean, clubId?: string): void {
  const club = resolveClub(world, clubId);
  assert(organizer === club.organizer, "only organizer");
  club.paused = paused;
}

export function buyTicket(world: WorldState, buyer: string, payment: number, clubId?: string): TicketEvent {
  const club = resolveClub(world, clubId);
  assert(!club.paused, "club paused");
  const clubSeats = seatsForClub(world, club.clubId);
  assert(clubSeats.length === club.maxSeats, "seats not minted");
  assert(payment === club.ticketPrice, `price mismatch: need ${club.ticketPrice}`);

  const treasuryCut = Math.floor((payment * club.treasuryBps) / 10000);
  const seatCuts: { tokenId: string; amount: number }[] = [];
  let allocated = treasuryCut;

  for (const seat of clubSeats) {
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

  const dust = payment - allocated;
  club.treasuryBalance += treasuryCut + dust;
  club.ticketsSold += 1;

  const event: TicketEvent = {
    at: Date.now(),
    clubId: club.clubId,
    buyer,
    price: payment,
    treasuryCut: treasuryCut + dust,
    seatCuts,
    txHash: txHash(world.nextTx++),
  };
  world.tickets.push(event);
  return event;
}

function leaseBlocksTitle(seat: Seat): boolean {
  return seat.leaseExpiresMs > Date.now() && (seat.lessee != null || seat.leaseAsk != null);
}

function isActiveLessee(seat: Seat, actor: string): boolean {
  return seat.lessee === actor && seat.leaseExpiresMs > Date.now();
}

export function claimPayout(world: WorldState, actor: string, tokenId: string, amount?: number): string {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  assert(actor === seat.owner || isActiveLessee(seat, actor), "only owner or active lessee");
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
    sourceTicket: world.clubs[seat.clubId]?.ticketsSold ?? 0,
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
  assert(!leaseBlocksTitle(seat), "active lease blocks listing");

  // Foreign-chain seal: bump sign epoch so pre-list held sigs are stale.
  seat.keyEpoch += 1;
  seat.encumbrance = "LISTED";
  seat.listingAsk = ask;
  seat.listingNonce += 1;
  seat.ledger.push({
    at: Date.now(),
    kind: "list",
    amount: ask,
    note: `nonce ${seat.listingNonce} · sign-epoch ${seat.keyEpoch}`,
  });
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
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  const club = world.clubs[seat.clubId];
  assert(club, "club not found");
  assert(seat.encumbrance === "LISTED", "seat not listed");
  assert(seat.listingAsk !== null, "no ask");
  assert(payment === seat.listingAsk, `ask mismatch: need ${seat.listingAsk}`);
  assert(syncNonce === seat.listingNonce, "stale listing nonce — refund path");
  assert(buyer !== seat.owner, "cannot buy own seat");
  assert(seat.accessKeyCount === 0, "buy refused: vault keys present");
  assert(seat.openRawSigs === 0, "buy refused: open raw signatures");
  assert(!seat.washFlagged, "buy refused: wash flagged — FIX BEFORE BUY");
  assert(!leaseBlocksTitle(seat), "buy refused: active lease");

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
  seat.lessee = null;
  seat.leaseExpiresMs = 0;
  seat.leaseAsk = null;
  seat.ledger.push({
    at: Date.now(),
    kind: "sale",
    amount: payment,
    note: `sold by ${seller} → ${buyer}; rebound ${rebounded}; epoch ${seat.keyEpoch}`,
  });

  return { txHash: txHash(world.nextTx++), rebounded };
}

/** Offer a time-boxed seat-cut lease. Title stays with owner. */
export function offerLease(
  world: WorldState,
  actor: string,
  tokenId: string,
  ask: number,
  durationMs: number,
): number {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  assert(actor === seat.owner, "only owner");
  assert(seat.encumbrance === "FREE", "encumbered");
  assert(ask > 0, "ask must be positive");
  assert(durationMs >= 60_000, "duration min 60s");
  assert(!leaseBlocksTitle(seat), "lease already active");
  seat.leaseNonce += 1;
  seat.lessee = null;
  seat.leaseAsk = ask;
  seat.leaseExpiresMs = Date.now() + durationMs;
  seat.ledger.push({
    at: Date.now(),
    kind: "lease_offer",
    amount: ask,
    note: `nonce ${seat.leaseNonce} · ${durationMs}ms`,
  });
  return seat.leaseNonce;
}

export function takeLease(
  world: WorldState,
  renter: string,
  tokenId: string,
  payment: number,
  syncNonce: number,
): void {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  assert(seat.encumbrance === "FREE", "encumbered");
  assert(seat.leaseAsk !== null, "no lease offer");
  assert(seat.lessee === null, "lease already taken");
  assert(syncNonce === seat.leaseNonce, "stale lease nonce");
  assert(Date.now() < seat.leaseExpiresMs, "lease offer expired");
  assert(payment === seat.leaseAsk, "lease ask mismatch");
  assert(renter !== seat.owner, "owner cannot lease own seat");
  seat.lessee = renter;
  seat.ledger.push({
    at: Date.now(),
    kind: "lease_taken",
    amount: payment,
    note: `renter ${renter} until ${seat.leaseExpiresMs}`,
  });
}

export function settleLease(world: WorldState, actor: string, tokenId: string): void {
  const seat = world.seats[tokenId];
  assert(seat, "seat not found");
  assert(seat.leaseAsk !== null || seat.lessee !== null, "no lease");
  const expired = Date.now() >= seat.leaseExpiresMs;
  assert(expired || actor === seat.owner, "lease still active — only owner can cancel");
  seat.lessee = null;
  seat.leaseExpiresMs = 0;
  seat.leaseAsk = null;
  seat.ledger.push({ at: Date.now(), kind: "lease_settle", amount: 0, note: expired ? "expired" : "cancelled" });
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
  const expectedBtc = deriveBtcAddress(seat.vaultAccountId);
  const expectedSol = deriveSolAddress(seat.vaultAccountId);
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
      id: "btc_path",
      label: "BTC path address matches derivation",
      pass: seat.btcAddress === expectedBtc,
      detail: seat.btcAddress,
    },
    {
      id: "sol_path",
      label: "SOL path address matches derivation",
      pass: seat.solAddress === expectedSol,
      detail: seat.solAddress,
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
    {
      id: "lease",
      label: "No blocking seat-cut lease",
      pass: !leaseBlocksTitle(seat),
      detail: seat.lessee
        ? `renter ${seat.lessee} until ${seat.leaseExpiresMs}`
        : seat.leaseExpiresMs > Date.now()
          ? `open offer until ${seat.leaseExpiresMs}`
          : "none",
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

/**
 * Local preview world with a mid-payout seat ready to list/buy.
 * Not a product default — Live apps should start empty and load from chain.
 */
export function seedPreviewWorld(
  opts: {
    clubId?: string;
    name?: string;
    organizer?: string;
    seller?: string;
    buyer?: string;
    fan?: string;
    ticketPrice?: number;
    seatCount?: number;
    storySeat?: string;
  } = {},
): WorldState {
  const clubId = opts.clubId ?? "venue";
  const organizer = opts.organizer ?? "organizer.near";
  const seller = opts.seller ?? "seller.near";
  const fan = opts.fan ?? "fan.near";
  const ticketPrice = opts.ticketPrice ?? 10;
  const seatCount = opts.seatCount ?? 5;
  const storySeat = opts.storySeat ?? "3";
  const perSeat = Math.floor(5000 / seatCount);
  const seatBps = Array.from({ length: seatCount }, () => perSeat);
  const treasuryBps = 10000 - seatBps.reduce((a, b) => a + b, 0);
  const seatKinds = seatBps.map((_, i) => ({
    id: `seat-${i + 1}`,
    label: `Seat ${i + 1}`,
    blurb: "Venue-defined earning seat",
  }));

  const world = createWorld([organizer, seller, opts.buyer ?? "buyer.near", fan], "demo");
  createVenue(world, {
    clubId,
    name: opts.name ?? "Preview venue",
    organizer,
    ticketPrice,
    seatBps,
    treasuryBps,
    royaltyBps: 500,
    seatKinds,
  });
  const seat = world.seats[storySeat];
  if (seat) {
    seat.owner = seller;
    seat.holderHistory[0]!.to = Date.now();
    seat.holderHistory.push({ owner: seller, from: Date.now(), to: null });
    buyTicket(world, fan, ticketPrice);
    buyTicket(world, fan, ticketPrice);
    const claim = Math.min(0.5, seat.balance);
    if (claim > 0) claimPayout(world, seller, storySeat, claim);
  }
  return world;
}

/** @deprecated Use seedPreviewWorld */
export const seedDemoNight = seedPreviewWorld;

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
    claim: "Buy encodes only when diligence is CLEAN",
    method: "assertCleanToBuy / encodeBuySeatIfClean",
    test: "assertCleanToBuy_blocks_wash",
  },
  {
    claim: "List bumps sign epoch (foreign-chain seal)",
    method: "list_seat",
    test: "list_bumps_sign_epoch",
  },
  {
    claim: "Chain-sig continuity hash unchanged across sale",
    method: "continuity_hash",
    test: "continuity_hash_stable",
  },
  {
    claim: "Seat-cut lease blocks list until settle",
    method: "offer_lease / take_lease / settle_lease",
    test: "lease_blocks_list_until_settle",
  },
  {
    claim: "BPS immutable after mint; sum always 10000",
    method: "create_club",
    test: "bps_sum_10000_and_immutable",
  },
  {
    claim: "Multiple venues coexist without redeploy",
    method: "create_club",
    test: "multi_venue_clubs",
  },
] as const;
