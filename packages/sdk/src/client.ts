/**
 * Bound QuitClaim client for real integrations.
 * Construct once with your contract account; all views/encodings inherit it.
 */

import {
  assertVenueSpec,
  resolveExplorer,
  resolveRpc,
  type QuitClaimConfig,
  type NearNetwork,
  type VenueSpec,
} from "./config";
import {
  encodeBuySeat,
  encodeBuyTicket,
  encodeClaimPayout,
  encodeCreateClub,
  encodeDelistSeat,
  encodeListSeat,
  encodeMintSeats,
  encodeOfferLease,
  encodeSetPaused,
  encodeSettleLease,
  encodeTakeLease,
  seatBuyNonce,
  toNearViewConfig,
  viewClub,
  viewClubIds,
  viewDiligence,
  viewLease,
  viewSeat,
  viewSeats,
  type ChainClubView,
  type ChainDiligenceView,
  type ChainLeaseView,
  type ChainSeatView,
  type FunctionCallEncoding,
  type NearViewConfig,
} from "./near";
import { assertCleanChainToBuy } from "./policy";
import { quoteTicketIntentDry, type IntentTicketDryQuote } from "./intents";

export class QuitClaimClient {
  readonly contractId: string;
  readonly network: NearNetwork;
  readonly rpcUrl: string;
  readonly clubId?: string;
  readonly explorerBase: string;

  constructor(cfg: QuitClaimConfig) {
    if (!cfg.contractId?.trim()) {
      throw new Error("QuitClaimClient requires contractId");
    }
    this.contractId = cfg.contractId.trim();
    this.network = cfg.network ?? "testnet";
    this.rpcUrl = resolveRpc(cfg);
    this.clubId = cfg.clubId;
    this.explorerBase = resolveExplorer(this.network);
  }

  /** Return a client scoped to a venue on the same contract. */
  withClub(clubId: string): QuitClaimClient {
    return new QuitClaimClient({
      contractId: this.contractId,
      network: this.network,
      rpcUrl: this.rpcUrl,
      clubId,
    });
  }

  private cfg(clubId?: string): NearViewConfig {
    return toNearViewConfig({
      contractId: this.contractId,
      network: this.network,
      rpcUrl: this.rpcUrl,
      clubId: clubId ?? this.clubId,
    });
  }

  accountUrl(accountId = this.contractId): string {
    return `${this.explorerBase}/accounts/${accountId}`;
  }

  txUrl(hash: string): string {
    return `${this.explorerBase}/transactions/${hash}`;
  }

  getClub(clubId?: string): Promise<ChainClubView | null> {
    return viewClub(this.cfg(clubId));
  }

  listClubs(): Promise<string[]> {
    return viewClubIds(this.cfg());
  }

  getSeat(tokenId: string, clubId?: string): Promise<ChainSeatView> {
    return viewSeat(tokenId, this.cfg(clubId));
  }

  listSeats(clubId?: string): Promise<ChainSeatView[]> {
    return viewSeats(this.cfg(clubId));
  }

  diligence(tokenId: string, clubId?: string): Promise<ChainDiligenceView> {
    return viewDiligence(tokenId, this.cfg(clubId));
  }

  buyNonce(seat: ChainSeatView): number {
    return seatBuyNonce(seat);
  }

  /**
   * Resolve ticket deposit from on-chain club config.
   * Throws if the venue is missing.
   */
  async ticketDeposit(clubId?: string): Promise<string> {
    const club = await this.getClub(clubId);
    if (!club?.ticket_price && club?.ticket_price !== 0) {
      throw new Error(`club not found on ${this.contractId}`);
    }
    return String(club.ticket_price);
  }

  /** Encode create_club from a VenueSpec (organizer wallet must sign). */
  encodeCreateVenue(spec: VenueSpec): FunctionCallEncoding {
    assertVenueSpec(spec);
    return encodeCreateClub({
      clubId: spec.clubId,
      name: spec.name,
      ticketPriceYocto: spec.ticketPrice,
      seatBps: spec.seatBps,
      treasuryBps: spec.treasuryBps,
      royaltyBps: spec.royaltyBps ?? 500,
      seatKinds: spec.seatKinds?.map((k) => k.id),
    });
  }

  encodeMintSeats(clubId?: string): FunctionCallEncoding {
    return encodeMintSeats(clubId ?? this.clubId);
  }

  encodeSetPaused(paused: boolean, clubId?: string): FunctionCallEncoding {
    return encodeSetPaused(paused, clubId ?? this.clubId);
  }

  async encodeBuyTicket(clubId?: string): Promise<FunctionCallEncoding> {
    const deposit = await this.ticketDeposit(clubId);
    return encodeBuyTicket(deposit, clubId ?? this.clubId);
  }

  encodeListSeat(tokenId: string, ask: string | number | bigint, clubId?: string): FunctionCallEncoding {
    return encodeListSeat(tokenId, ask, clubId ?? this.clubId);
  }

  encodeDelistSeat(tokenId: string, clubId?: string): FunctionCallEncoding {
    return encodeDelistSeat(tokenId, clubId ?? this.clubId);
  }

  encodeBuySeat(
    tokenId: string,
    syncNonce: number,
    ask: string | number | bigint,
    clubId?: string,
  ): FunctionCallEncoding {
    return encodeBuySeat(tokenId, syncNonce, ask, clubId ?? this.clubId);
  }

  /**
   * Policy gate: view diligence + seat, refuse encode unless PROVABLY CLEAN.
   * This is the product buy gate for third-party venues.
   */
  async encodeBuySeatIfClean(
    tokenId: string,
    syncNonce: number,
    ask: string | number | bigint,
    clubId?: string,
  ): Promise<FunctionCallEncoding> {
    const id = clubId ?? this.clubId;
    const [seat, diligence] = await Promise.all([
      this.getSeat(tokenId, id),
      this.diligence(tokenId, id),
    ]);
    assertCleanChainToBuy(seat, diligence);
    return encodeBuySeat(tokenId, syncNonce, ask, id);
  }

  encodeClaimPayout(
    tokenId: string,
    amount: string | number | bigint,
    clubId?: string,
  ): FunctionCallEncoding {
    return encodeClaimPayout(tokenId, amount, clubId ?? this.clubId);
  }

  encodeOfferLease(
    tokenId: string,
    ask: string | number | bigint,
    durationMs: number,
    clubId?: string,
  ): FunctionCallEncoding {
    return encodeOfferLease(tokenId, ask, durationMs, clubId ?? this.clubId);
  }

  encodeTakeLease(
    tokenId: string,
    syncNonce: number,
    ask: string | number | bigint,
    clubId?: string,
  ): FunctionCallEncoding {
    return encodeTakeLease(tokenId, syncNonce, ask, clubId ?? this.clubId);
  }

  encodeSettleLease(tokenId: string, clubId?: string): FunctionCallEncoding {
    return encodeSettleLease(tokenId, clubId ?? this.clubId);
  }

  getLease(tokenId: string, clubId?: string): Promise<ChainLeaseView | null> {
    return viewLease(tokenId, this.cfg(clubId));
  }

  /** dry:true Intents ticket quote — no funds move. */
  async quoteTicketIntentDry(clubId?: string): Promise<IntentTicketDryQuote> {
    const id = clubId ?? this.clubId;
    if (!id) throw new Error("clubId required for intent quote");
    const price = await this.ticketDeposit(id);
    return quoteTicketIntentDry({
      clubId: id,
      ticketPriceYocto: price,
      contractId: this.contractId,
    });
  }
}

/** Build a client from env-style vars (Node / Next public config). */
export function clientFromEnv(
  env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {},
): QuitClaimClient {
  const contractId =
    env.QUITCLAIM_CONTRACT_ID ??
    env.NEXT_PUBLIC_CONTRACT_ID ??
    env.CLEARTITLE_CONTRACT_ID ??
    env.CONTRACT_ID;
  if (!contractId) {
    throw new Error(
      "Set QUITCLAIM_CONTRACT_ID or NEXT_PUBLIC_CONTRACT_ID to your deployed contract",
    );
  }
  const network = (env.QUITCLAIM_NETWORK ??
    env.NEXT_PUBLIC_NEAR_NETWORK ??
    env.CLEARTITLE_NETWORK ??
    "testnet") as NearNetwork;
  const clubId = env.QUITCLAIM_CLUB_ID ?? env.NEXT_PUBLIC_CLUB_ID ?? env.CLEARTITLE_CLUB_ID;
  const rpcUrl = env.QUITCLAIM_RPC ?? env.NEXT_PUBLIC_NEAR_RPC ?? env.CLEARTITLE_RPC;
  return new QuitClaimClient({ contractId, network, clubId, rpcUrl });
}
