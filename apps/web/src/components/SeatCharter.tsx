"use client";

import type { Seat } from "@/sdk";

/** Theme-aware quiet-title deed — ink on fog, never stuck black in light mode. */
export function SeatCharter({ seat }: { seat: Seat }) {
  const pending = seat.pending.filter(
    (p) => p.status === "PENDING" || p.status === "REBOUND_TO_BUYER",
  ).length;

  return (
    <article className="seat-charter" aria-label={`Seat ${seat.tokenId} charter`}>
      <div className="seat-charter-frame">
        <p className="seat-charter-kicker">NEP-171 · Quiet Title Deed</p>
        <h2 className="seat-charter-title">Seat #{seat.tokenId}</h2>
        <p className="seat-charter-vault mono">{seat.vaultAccountId}</p>
        <p className="seat-charter-facts">
          {seat.accessKeyCount} keys · {seat.kind} · epoch {seat.keyEpoch}
          {seat.washFlagged ? " · wash" : ""}
        </p>
        <p className="seat-charter-line">Owner · {seat.owner}</p>
        <p className="seat-charter-line">
          Tickets · {seat.ticketsAccrued} · Balance · {seat.balance} · {seat.encumbrance} · pending{" "}
          {pending}
        </p>
        <p className="seat-charter-hash mono">continuity · {seat.continuityHash}</p>
      </div>
    </article>
  );
}
