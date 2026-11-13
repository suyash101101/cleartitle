/** ClearTitle domain types: title insurance for ticket-earning seat NFTs. */

export type Encumbrance = "FREE" | "LISTED" | "SETTLING";
export type PayoutStatus = "NONE" | "PENDING" | "SETTLED" | "REBOUND_TO_BUYER";
export type DiligenceVerdict = "PROVABLY CLEAN" | "FIX BEFORE BUY";
export type SeatKind = "floor" | "lounge" | "suite" | "vip" | "press";

export const SEAT_KINDS: { id: SeatKind; label: string; blurb: string }[] = [
  { id: "floor", label: "Floor", blurb: "General admission earning cut" },
  { id: "lounge", label: "Lounge", blurb: "Hospitality rail with tip continuity" },
  { id: "suite", label: "Suite", blurb: "Founding suite deed · mid-payout story" },
  { id: "vip", label: "VIP", blurb: "Priority gate · same clear-title rules" },
  { id: "press", label: "Press", blurb: "Media booth vault · 0 access keys" },
];

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
  network: "demo" | "testnet" | "mainnet";
  club: ClubConfig | null;
  seats: Record<string, Seat>;
  tickets: TicketEvent[];
  actors: string[];
  nextPayoutId: number;
  nextTx: number;
}
