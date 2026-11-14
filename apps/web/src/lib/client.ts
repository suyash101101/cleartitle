/**
 * App-bound QuitClaim client from Next public env.
 * Falls back to the published specimen contract so SSR/build can prerender.
 */

import { DEMO_TESTNET_CONTRACT, QuitClaimClient } from "@/sdk";

let cached: QuitClaimClient | null = null;

export function getQuitClaimClient(): QuitClaimClient {
  if (cached) return cached;
  const contractId =
    process.env.NEXT_PUBLIC_CONTRACT_ID?.trim() ||
    process.env.CLEARTITLE_CONTRACT_ID?.trim() ||
    DEMO_TESTNET_CONTRACT;
  const network = (process.env.NEXT_PUBLIC_NEAR_NETWORK ??
    process.env.CLEARTITLE_NETWORK ??
    "testnet") as "testnet" | "mainnet" | "local";
  cached = new QuitClaimClient({
    contractId,
    network,
    clubId: process.env.NEXT_PUBLIC_CLUB_ID || process.env.CLEARTITLE_CLUB_ID,
    rpcUrl: process.env.NEXT_PUBLIC_NEAR_RPC || process.env.CLEARTITLE_RPC,
  });
  return cached;
}

export function clubIdFromEnv(): string | undefined {
  return process.env.NEXT_PUBLIC_CLUB_ID || undefined;
}
