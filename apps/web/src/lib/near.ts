/** Read-only NEAR testnet helpers (no wallet / no private keys in the browser). */

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ?? "cleartitle562464.testnet";
export const NETWORK = process.env.NEXT_PUBLIC_NEAR_NETWORK ?? "testnet";
export const RPC =
  process.env.NEXT_PUBLIC_NEAR_RPC ??
  (NETWORK === "mainnet"
    ? "https://free.rpc.fastnear.com"
    : "https://test.rpc.fastnear.com");
export const EXPLORER =
  NETWORK === "mainnet"
    ? "https://explorer.near.org"
    : "https://explorer.testnet.near.org";

function toBase64(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64");
  }
  return btoa(str);
}

export async function viewMethod<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "cleartitle",
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
}
