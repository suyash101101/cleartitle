/** QuitClaim domain types: title insurance for ticket-earning seat NFTs. */

export type Encumbrance = "FREE" | "LISTED" | "SETTLING";
export type PayoutStatus = "NONE" | "PENDING" | "SETTLED" | "REBOUND_TO_BUYER";
export type DiligenceVerdict = "PROVABLY CLEAN" | "FIX BEFORE BUY";

/** Free-form seat category id (venue-defined). */
export type SeatKind = string;

export type SeatKindMeta = { id: SeatKind; label: string; blurb: string };

/**
 * Example seat catalog used by the optional Nearnight story preset.
 * Real venues pass their own `seatKinds` into `createVenue` / `createClub`.
 */
export const NEARNIGHT_SEAT_KINDS: SeatKindMeta[] = [
  { id: "floor", label: "Floor", blurb: "General admission earning cut" },
  { id: "lounge", label: "Lounge", blurb: "Hospitality rail with tip continuity" },
  { id: "suite", label: "Suite", blurb: "Founding suite deed · mid-payout story" },
  { id: "vip", label: "VIP", blurb: "Priority gate · same clear-title rules" },
  { id: "press", label: "Press", blurb: "Media booth vault · 0 access keys" },
];

/** @deprecated Use NEARNIGHT_SEAT_KINDS or your own seatKinds array. */
export const SEAT_KINDS = NEARNIGHT_SEAT_KINDS;

export interface ClubConfig {
  clubId: string;
  name: string;
  organizer: string;
  ticketPrice: number;
  /** Basis points per seat, length = maxSeats */
  seatBps: number[];
  treasuryBps: number;
  royaltyBps: number;
  maxSeats: number;
  paused: boolean;
  treasuryBalance: number;
  ticketsSold: number;
  /** Optional category metadata mirrored onto minted seats. */
  seatKinds?: SeatKindMeta[];
}

export interface PendingPayout {
  id: string;
  tokenId: string;
  amount: number;
  status: PayoutStatus;
  createdAt: number;
  sourceTicket: number;
}

export interface Seat {
  tokenId: string;
  clubId: string;
  vaultAccountId: string;
  owner: string;
  kind: SeatKind;
  encumbrance: Encumbrance;
  balance: number;
  pending: PendingPayout[];
  seatBps: number;
  ticketsAccrued: number;
  keyEpoch: number;
  listingAsk: number | null;
  listingNonce: number;
  /** Deterministic derived tip paths: continuity across sales */
  continuityHash: string;
  btcAddress: string;
  solAddress: string;
  accessKeyCount: number;
  openRawSigs: number;
  washFlagged: boolean;
  holderHistory: { owner: string; from: number; to: number | null }[];
  ledger: { at: number; kind: string; amount: number; note: string }[];
}

export interface TicketEvent {
  at: number;
  clubId: string;
  buyer: string;
  price: number;
  treasuryCut: number;
  seatCuts: { tokenId: string; amount: number }[];
  txHash: string;
}

export interface LabResult {
  attack: string;
  success: false;
  reason: string;
  explorerHint: string;
}

export interface DiligenceReport {
  tokenId: string;
  verdict: DiligenceVerdict;
  checks: { id: string; label: string; pass: boolean; detail: string }[];
}

export interface WorldState {
  network: "demo" | "testnet" | "mainnet" | "local";
  /** All venues keyed by clubId. */
  clubs: Record<string, ClubConfig>;
  /**
   * Active venue for helpers that omit clubId.
   * Multi-venue worlds keep every club in `clubs`; call `selectClub` to switch.
   */
  club: ClubConfig | null;
  seats: Record<string, Seat>;
  tickets: TicketEvent[];
  actors: string[];
  nextPayoutId: number;
  nextTx: number;
}
