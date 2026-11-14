/**
 * App-bound QuitClaim client from Next public env.
 * Every Live RPC / encode path should go through this, not demo defaults.
 */

import { QuitClaimClient, clientFromEnv } from "@/sdk";

let cached: QuitClaimClient | null = null;

export function getQuitClaimClient(): QuitClaimClient {
  if (cached) return cached;
  cached = clientFromEnv({
    NEXT_PUBLIC_CONTRACT_ID: process.env.NEXT_PUBLIC_CONTRACT_ID,
    NEXT_PUBLIC_NEAR_NETWORK: process.env.NEXT_PUBLIC_NEAR_NETWORK,
    NEXT_PUBLIC_NEAR_RPC: process.env.NEXT_PUBLIC_NEAR_RPC,
    NEXT_PUBLIC_CLUB_ID: process.env.NEXT_PUBLIC_CLUB_ID,
  });
  return cached;
}

export function clubIdFromEnv(): string | undefined {
  return process.env.NEXT_PUBLIC_CLUB_ID || undefined;
}
