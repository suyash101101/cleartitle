/**
 * Title-policy helpers: diligence CLEAN is the only buy gate.
 * Use before encoding buy_seat (SDK) or before wallet submit (UI).
 */

import type { DiligenceReport, DiligenceVerdict, Seat, WorldState } from "./types";
import { runDiligence } from "./engine";
import type { ChainDiligenceView, ChainSeatView, FunctionCallEncoding } from "./near";
import { encodeBuySeat } from "./near";

export type PolicyVerdict = DiligenceVerdict;

export function isCleanVerdict(verdict: string): boolean {
  return verdict === "PROVABLY CLEAN";
}

/** Local-engine gate: throw unless diligence is CLEAN and title fields allow buy. */
export function assertCleanToBuy(world: WorldState, tokenId: string): DiligenceReport {
  const seat = world.seats[tokenId];
  if (!seat) throw new Error(`seat not found: ${tokenId}`);
  if (seat.encumbrance !== "LISTED") throw new Error("buy refused: seat not listed");
  if (seat.accessKeyCount !== 0) throw new Error("buy refused: vault keys present");
  if (seat.openRawSigs !== 0) throw new Error("buy refused: open raw signatures");
  if (seat.washFlagged) throw new Error("buy refused: wash flagged — FIX BEFORE BUY");
  if (seat.leaseExpiresMs > Date.now() && (seat.lessee != null || seat.leaseAsk != null)) {
    throw new Error("buy refused: active lease");
  }
  const report = runDiligence(world, tokenId);
  if (!isCleanVerdict(report.verdict)) {
    const failed = report.checks.filter((c) => !c.pass).map((c) => c.id);
    throw new Error(`buy refused: FIX BEFORE BUY [${failed.join(", ")}]`);
  }
  return report;
}

/** Chain-view gate: pass diligence RPC + seat snapshot before encoding buy. */
export function assertCleanChainToBuy(
  seat: ChainSeatView,
  diligence: ChainDiligenceView,
): void {
  if (!isCleanVerdict(diligence.verdict)) {
    const failed = (diligence.checks ?? []).filter((c) => !c.pass).map((c) => c.id);
    throw new Error(`buy refused: FIX BEFORE BUY [${failed.join(", ") || "checks"}]`);
  }
  if ((seat.access_key_count ?? 0) !== 0) {
    throw new Error("buy refused: vault keys present");
  }
  if (seat.wash_flagged) {
    throw new Error("buy refused: wash flagged — FIX BEFORE BUY");
  }
  const enc = (seat.encumbrance ?? "").toLowerCase();
  if (enc && enc !== "listed") {
    throw new Error("buy refused: seat not listed");
  }
}

/** Encode buy_seat only after local CLEAN gate. */
export function encodeBuySeatIfClean(
  world: WorldState,
  tokenId: string,
  syncNonce: number,
  ask: string | number | bigint,
  clubId?: string,
): FunctionCallEncoding {
  assertCleanToBuy(world, tokenId);
  return encodeBuySeat(tokenId, syncNonce, ask, clubId);
}

/** Seat snapshot helpers for UI badges. */
export function titlePolicySummary(seat: Seat, report?: DiligenceReport | null): {
  verdict: PolicyVerdict;
  buyUnlocked: boolean;
  blockers: string[];
} {
  const blockers: string[] = [];
  if (seat.accessKeyCount !== 0) blockers.push("keys");
  if (seat.openRawSigs !== 0) blockers.push("raw_sigs");
  if (seat.washFlagged) blockers.push("wash");
  if (seat.leaseExpiresMs > Date.now()) blockers.push("lease");
  if (report) {
    for (const c of report.checks) if (!c.pass) blockers.push(c.id);
  }
  const unique = [...new Set(blockers)];
  const verdict: PolicyVerdict = unique.length === 0 ? "PROVABLY CLEAN" : "FIX BEFORE BUY";
  return {
    verdict,
    buyUnlocked: verdict === "PROVABLY CLEAN" && seat.encumbrance === "LISTED",
    blockers: unique,
  };
}
