/** Typed RPC views for the live QuitClaim contract. */

import { viewMethod } from "@/lib/near";

export type ChainSeat = {
  token_id: string;
  owner_id: string;
  vault_account_id?: string;
  encumbrance?: string;
  listing_ask?: string | null;
  listing_nonce?: number;
  sync_nonce?: number;
  access_key_count?: number;
  key_epoch?: number;
  pending?: { id: string; amount: string | number; status: string }[];
};

export type ChainDiligence = {
  verdict: string;
  checks: { id: string; pass: boolean; detail: string; label?: string }[];
};

export type ChainClub = {
  name?: string;
  club_id?: string;
  organizer?: string;
  ticket_price?: string | number;
  tickets_sold?: number;
  treasury_balance?: string | number;
  paused?: boolean;
};

export async function viewSeat(tokenId: string): Promise<ChainSeat> {
  return viewMethod<ChainSeat>("get_seat", { token_id: tokenId });
}

export async function viewDiligence(tokenId: string): Promise<ChainDiligence> {
  return viewMethod<ChainDiligence>("diligence", { token_id: tokenId });
}

export async function viewClub(): Promise<ChainClub> {
  return viewMethod<ChainClub>("get_club");
}

/** Prefer listing_nonce / sync_nonce for buy_seat; fall back safely. */
export function seatBuyNonce(seat: ChainSeat): number {
  if (typeof seat.listing_nonce === "number") return seat.listing_nonce;
  if (typeof seat.sync_nonce === "number") return seat.sync_nonce;
  return 0;
}
