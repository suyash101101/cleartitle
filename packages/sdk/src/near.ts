/**
 * Thin NEAR helpers shared by web, scripts, and integrators.
 * No wallet secrets. Views via JSON-RPC; call args are plain objects for wallets.
 */

export const DEFAULT_TESTNET_CONTRACT = "cleartitle562464.testnet";
export const DEFAULT_TESTNET_RPC = "https://test.rpc.fastnear.com";

export type NearViewConfig = {
  contractId?: string;
  rpcUrl?: string;
  /** Inject fetch for browsers / custom agents. Defaults to globalThis.fetch. */
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

export type ChainSeatView = {
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
};

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
  cfg: NearViewConfig = {},
): Promise<T> {
  const contractId = cfg.contractId ?? DEFAULT_TESTNET_CONTRACT;
  const rpcUrl = cfg.rpcUrl ?? DEFAULT_TESTNET_RPC;
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
        id: "cleartitle-sdk",
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

export function viewSeat(tokenId: string, cfg?: NearViewConfig) {
  return nearView<ChainSeatView>("get_seat", { token_id: tokenId }, cfg);
}

export function viewDiligence(tokenId: string, cfg?: NearViewConfig) {
  return nearView<ChainDiligenceView>("diligence", { token_id: tokenId }, cfg);
}

export function viewClub(cfg?: NearViewConfig) {
  return nearView<ChainClubView>("get_club", {}, cfg);
}

/** Prefer listing_nonce / sync_nonce for buy_seat. */
export function seatBuyNonce(seat: ChainSeatView): number {
  if (typeof seat.listing_nonce === "number") return seat.listing_nonce;
  if (typeof seat.sync_nonce === "number") return seat.sync_nonce;
  return 0;
}

/** FunctionCall arg helpers for near-connect / wallets. */
export function encodeBuyTicket(): { methodName: string; args: object; depositYocto: string } {
  return { methodName: "buy_ticket", args: {}, depositYocto: "10" };
}

export function encodeListSeat(
  tokenId: string,
  ask: string,
): { methodName: string; args: object; depositYocto: string } {
  return {
    methodName: "list_seat",
    args: { token_id: tokenId, ask },
    depositYocto: "0",
  };
}

export function encodeBuySeat(
  tokenId: string,
  syncNonce: number,
  ask: string,
): { methodName: string; args: object; depositYocto: string } {
  return {
    methodName: "buy_seat",
    args: { token_id: tokenId, sync_nonce: syncNonce },
    depositYocto: ask,
  };
}
