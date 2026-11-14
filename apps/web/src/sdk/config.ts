/** Network + venue configuration for QuitClaim deployments. */

export type NearNetwork = "testnet" | "mainnet" | "local";

export type QuitClaimConfig = {
  /** Deployed QuitClaim contract account. Required for live calls. */
  contractId: string;
  network?: NearNetwork;
  rpcUrl?: string;
  /** Active venue on a multi-club contract. */
  clubId?: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

export const NETWORK_RPC: Record<NearNetwork, string> = {
  testnet: "https://test.rpc.fastnear.com",
  mainnet: "https://free.rpc.fastnear.com",
  local: "http://127.0.0.1:3030",
};

export const NETWORK_EXPLORER: Record<NearNetwork, string> = {
  testnet: "https://explorer.testnet.near.org",
  mainnet: "https://explorer.near.org",
  local: "http://127.0.0.1:3030",
};

/**
 * Optional published specimen account (hackathon deploy).
 * Never used unless you pass it or set it in env yourself.
 */
export const SPECIMEN_TESTNET_CONTRACT = "cleartitle562464.testnet";

/** @deprecated Use SPECIMEN_TESTNET_CONTRACT */
export const DEMO_TESTNET_CONTRACT = SPECIMEN_TESTNET_CONTRACT;

export function resolveRpc(cfg: Pick<QuitClaimConfig, "network" | "rpcUrl">): string {
  if (cfg.rpcUrl) return cfg.rpcUrl;
  return NETWORK_RPC[cfg.network ?? "testnet"];
}

export function resolveExplorer(network: NearNetwork = "testnet"): string {
  return NETWORK_EXPLORER[network];
}

/** Venue blueprint for createVenue (local) and encodeCreateClub (chain). */
export type VenueSpec = {
  clubId: string;
  name: string;
  organizer: string;
  /** Integer ticket price in the venue's on-chain denomination. */
  ticketPrice: number;
  seatBps: number[];
  treasuryBps: number;
  royaltyBps?: number;
  seatKinds?: { id: string; label: string; blurb: string }[];
};

export function assertVenueSpec(spec: VenueSpec): void {
  if (!/^[a-z0-9][a-z0-9_-]{1,31}$/.test(spec.clubId)) {
    throw new Error("clubId must be 2–32 chars: lowercase alphanumeric, _ or -");
  }
  if (!spec.name.trim()) throw new Error("name required");
  if (!spec.organizer.trim()) throw new Error("organizer required");
  if (!(spec.ticketPrice > 0)) throw new Error("ticketPrice must be positive");
  if (!spec.seatBps.length) throw new Error("seatBps required");
  const sum = spec.seatBps.reduce((a, b) => a + b, 0) + spec.treasuryBps;
  if (sum !== 10_000) throw new Error(`bps must sum to 10000, got ${sum}`);
  if (spec.seatKinds && spec.seatKinds.length !== spec.seatBps.length) {
    throw new Error("seatKinds length must match seatBps");
  }
}
