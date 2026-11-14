/** Typed RPC views bound to NEXT_PUBLIC_CONTRACT_ID via QuitClaimClient. */

import { getQuitClaimClient, clubIdFromEnv } from "@/lib/client";
import type {
  ChainClubView as ChainClub,
  ChainDiligenceView as ChainDiligence,
  ChainSeatView as ChainSeat,
} from "@/sdk";

export type { ChainClub, ChainDiligence, ChainSeat };

export function seatBuyNonce(seat: ChainSeat): number {
  return getQuitClaimClient().buyNonce(seat);
}

export function viewClub(clubId?: string) {
  return getQuitClaimClient().getClub(clubId ?? clubIdFromEnv());
}

export function viewSeat(tokenId: string, clubId?: string) {
  return getQuitClaimClient().getSeat(tokenId, clubId ?? clubIdFromEnv());
}

export function viewDiligence(tokenId: string, clubId?: string) {
  return getQuitClaimClient().diligence(tokenId, clubId ?? clubIdFromEnv());
}

export function viewSeats(clubId?: string) {
  return getQuitClaimClient().listSeats(clubId ?? clubIdFromEnv());
}

export function viewClubIds() {
  return getQuitClaimClient().listClubs();
}
