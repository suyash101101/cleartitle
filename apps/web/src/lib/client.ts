/**
 * App-bound QuitClaim client from Next public env.
 * Falls back to SPECIMEN_TESTNET_CONTRACT only so SSR can prerender.
 */

import { QuitClaimClient, SPECIMEN_TESTNET_CONTRACT } from "@/sdk";

let cached: QuitClaimClient | null = null;

export function getQuitClaimClient(): QuitClaimClient {
  if (cached) return cached;
  const contractId =
    process.env.NEXT_PUBLIC_CONTRACT_ID?.trim() ||
    process.env.QUITCLAIM_CONTRACT_ID?.trim() ||
    SPECIMEN_TESTNET_CONTRACT;
  const network = (process.env.NEXT_PUBLIC_NEAR_NETWORK ??
    process.env.QUITCLAIM_NETWORK ??
    "testnet") as "testnet" | "mainnet" | "local";
  cached = new QuitClaimClient({
    contractId,
    network,
    clubId: process.env.NEXT_PUBLIC_CLUB_ID || process.env.QUITCLAIM_CLUB_ID,
    rpcUrl: process.env.NEXT_PUBLIC_NEAR_RPC || process.env.QUITCLAIM_RPC,
  });
  return cached;
}

export function clubIdFromEnv(): string | undefined {
  return process.env.NEXT_PUBLIC_CLUB_ID || process.env.QUITCLAIM_CLUB_ID || undefined;
}
