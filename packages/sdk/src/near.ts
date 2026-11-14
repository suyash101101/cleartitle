/**
 * Thin NEAR helpers shared by web, scripts, and integrators.
 * No wallet secrets. Views via JSON-RPC; call args are plain objects for wallets.
 *
 * Always pass `contractId` (or use `QuitClaimClient`). There is no silent
 * fallback to the demo deployment.
 */

import {
  SPECIMEN_TESTNET_CONTRACT,
  resolveRpc,
  type QuitClaimConfig,
  type NearNetwork,
} from "./config";

/** @deprecated Prefer QuitClaimClient / explicit contractId. */
export const DEFAULT_TESTNET_CONTRACT = SPECIMEN_TESTNET_CONTRACT;
/** @deprecated Prefer resolveRpc({ network }) or QuitClaimClient. */
export const DEFAULT_TESTNET_RPC = "https://test.rpc.fastnear.com";

export type NearViewConfig = {
  /** Required for live RPC. */
  contractId: string;
  rpcUrl?: string;
  network?: NearNetwork;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
  clubId?: string;
};

export type FunctionCallEncoding = {
  methodName: string;
  args: Record<string, unknown>;
  depositYocto: string;
};

export type ChainSeatView = {
  token_id: string;
  club_id?: string;
  owner_id: string;
  vault_account_id?: string;
  encumbrance?: string;
  listing_ask?: string | null;
  listing_nonce?: number;
  sync_nonce?: number;
  access_key_count?: number;
  key_epoch?: number;
  kind?: string;
  seat_bps?: number;
  wash_flagged?: boolean;
  continuity_hash?: string;
  pending?: { id: string; amount: string | number; status: string }[];
};

export type ChainDiligenceView = {
  verdict: string;
  checks: { id: string; pass: boolean; detail: string; label?: string }[];
};

export type ChainClubView = {
  name?: string;
  club_id?: string;
  organizer?: string;
  ticket_price?: string | number;
  tickets_sold?: number;
  treasury_balance?: string | number;
  paused?: boolean;
  seat_bps?: number[];
  treasury_bps?: number;
  royalty_bps?: number;
  max_seats?: number;
  seat_kinds?: string[];
};

function requireContractId(cfg?: Partial<NearViewConfig>): string {
  const id = cfg?.contractId?.trim();
  if (!id) {
    throw new Error(
      "contractId required — pass your deployed QuitClaim account (or new QuitClaimClient({ contractId }))",
    );
  }
  return id;
}

function toBase64(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64");
  }
  // eslint-disable-next-line no-undef
  return btoa(str);
}

export async function nearView<T>(
  method: string,
  args: Record<string, unknown> = {},
  cfg: NearViewConfig,
): Promise<T> {
  const contractId = requireContractId(cfg);
  const rpcUrl = cfg.rpcUrl ?? resolveRpc({ network: cfg.network, rpcUrl: cfg.rpcUrl });
  const fetchFn = cfg.fetchFn ?? globalThis.fetch;
  if (!fetchFn) throw new Error("fetch is unavailable");
  const timeoutMs = cfg.timeoutMs ?? 12_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchFn(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "quitclaim-sdk",
        method: "query",
        params: {
          request_type: "call_function",
          finality: "optimistic",
          account_id: contractId,
          method_name: method,
          args_base64: toBase64(JSON.stringify(args)),
        },
      }),
    });
    const json = (await res.json()) as {
      error?: { message?: string };
      result?: { result?: number[] };
    };
    if (json.error) throw new Error(json.error.message ?? JSON.stringify(json.error));
    const raw = json.result?.result;
    if (!raw) throw new Error("empty view result");
    const decoded =
      typeof Buffer !== "undefined"
        ? Buffer.from(raw).toString("utf8")
        : new TextDecoder().decode(Uint8Array.from(raw));
    return JSON.parse(decoded) as T;
  } finally {
    clearTimeout(timer);
  }
}

function withClub(
  args: Record<string, unknown>,
  clubId?: string,
): Record<string, unknown> {
  if (clubId) args.club_id = clubId;
  return args;
}

export function viewSeat(tokenId: string, cfg: NearViewConfig) {
  return nearView<ChainSeatView>(
    "get_seat",
    withClub({ token_id: tokenId }, cfg.clubId),
    cfg,
  );
}

export function viewDiligence(tokenId: string, cfg: NearViewConfig) {
  return nearView<ChainDiligenceView>(
    "diligence",
    withClub({ token_id: tokenId }, cfg.clubId),
    cfg,
  );
}

export function viewClub(cfg: NearViewConfig) {
  return nearView<ChainClubView | null>(
    "get_club",
    withClub({}, cfg.clubId),
    cfg,
  );
}

export function viewClubIds(cfg: NearViewConfig) {
  return nearView<string[]>("list_clubs", {}, cfg);
}

export function viewSeats(cfg: NearViewConfig) {
  return nearView<ChainSeatView[]>(
    "list_seats",
    withClub({}, cfg.clubId),
    cfg,
  );
}

export function seatBuyNonce(seat: ChainSeatView): number {
  if (typeof seat.listing_nonce === "number") return seat.listing_nonce;
  if (typeof seat.sync_nonce === "number") return seat.sync_nonce;
  return 0;
}

function asYocto(depositYocto: string | number | bigint): string {
  return typeof depositYocto === "string" ? depositYocto : depositYocto.toString();
}

export function encodeCreateClub(opts: {
  clubId: string;
  name: string;
  ticketPriceYocto: string | number | bigint;
  seatBps: number[];
  treasuryBps: number;
  royaltyBps: number;
  seatKinds?: string[];
}): FunctionCallEncoding {
  return {
    methodName: "create_club",
    args: {
      club_id: opts.clubId,
      name: opts.name,
      ticket_price: opts.ticketPriceYocto.toString(),
      seat_bps: opts.seatBps,
      treasury_bps: opts.treasuryBps,
      royalty_bps: opts.royaltyBps,
      seat_kinds: opts.seatKinds ?? null,
    },
    depositYocto: "0",
  };
}

export function encodeMintSeats(clubId?: string): FunctionCallEncoding {
  return {
    methodName: "mint_seats",
    args: clubId ? { club_id: clubId } : {},
    depositYocto: "0",
  };
}

export function encodeSetPaused(paused: boolean, clubId?: string): FunctionCallEncoding {
  return {
    methodName: "set_paused",
    args: withClub({ paused }, clubId),
    depositYocto: "0",
  };
}

export function encodeBuyTicket(
  depositYocto: string | number | bigint,
  clubId?: string,
): FunctionCallEncoding {
  return {
    methodName: "buy_ticket",
    args: withClub({}, clubId),
    depositYocto: asYocto(depositYocto),
  };
}

export function encodeListSeat(
  tokenId: string,
  ask: string | number | bigint,
  clubId?: string,
): FunctionCallEncoding {
  return {
    methodName: "list_seat",
    args: withClub({ token_id: tokenId, ask: ask.toString() }, clubId),
    depositYocto: "0",
  };
}

export function encodeDelistSeat(tokenId: string, clubId?: string): FunctionCallEncoding {
  return {
    methodName: "delist_seat",
    args: withClub({ token_id: tokenId }, clubId),
    depositYocto: "0",
  };
}

export function encodeBuySeat(
  tokenId: string,
  syncNonce: number,
  ask: string | number | bigint,
  clubId?: string,
): FunctionCallEncoding {
  return {
    methodName: "buy_seat",
    args: withClub({ token_id: tokenId, sync_nonce: syncNonce }, clubId),
    depositYocto: asYocto(ask),
  };
}

export function encodeClaimPayout(
  tokenId: string,
  amount: string | number | bigint,
  clubId?: string,
): FunctionCallEncoding {
  return {
    methodName: "claim_payout",
    args: withClub({ token_id: tokenId, amount: amount.toString() }, clubId),
    depositYocto: "0",
  };
}

export function toNearViewConfig(cfg: QuitClaimConfig): NearViewConfig {
  return {
    contractId: cfg.contractId,
    network: cfg.network,
    rpcUrl: cfg.rpcUrl,
    fetchFn: cfg.fetchFn,
    timeoutMs: cfg.timeoutMs,
    clubId: cfg.clubId,
  };
}
