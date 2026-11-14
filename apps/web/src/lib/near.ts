/** Read-only NEAR helpers (no wallet / no private keys in the browser). */

import { NETWORK_EXPLORER, NETWORK_RPC, SPECIMEN_TESTNET_CONTRACT } from "@/sdk";

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID?.trim() || SPECIMEN_TESTNET_CONTRACT;
export const NETWORK = (process.env.NEXT_PUBLIC_NEAR_NETWORK ?? "testnet") as
  | "testnet"
  | "mainnet"
  | "local";
export const RPC =
  process.env.NEXT_PUBLIC_NEAR_RPC ??
  NETWORK_RPC[NETWORK === "mainnet" ? "mainnet" : NETWORK === "local" ? "local" : "testnet"];
export const EXPLORER =
  NETWORK_EXPLORER[NETWORK === "mainnet" ? "mainnet" : NETWORK === "local" ? "local" : "testnet"];

function toBase64(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64");
  }
  return btoa(str);
}

export async function viewMethod<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "quitclaim",
        method: "query",
        params: {
          request_type: "call_function",
          finality: "optimistic",
          account_id: CONTRACT_ID,
          method_name: method,
          args_base64: toBase64(JSON.stringify(args)),
        },
      }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error.message ?? JSON.stringify(json.error));
    const raw = json.result?.result as number[] | undefined;
    if (!raw) throw new Error("empty view result");
    const decoded = new TextDecoder().decode(Uint8Array.from(raw));
    return JSON.parse(decoded) as T;
  } finally {
    clearTimeout(timer);
  }
}
