"use client";

import type { Seat } from "@/sdk/types";

/** Per-seat earnings history — track requirement Seats DAO does not cover (vote ≠ cuts). */
export function EarningsLedger({ seat }: { seat: Seat }) {
  const rows = seat.ledger.slice().reverse().slice(0, 8);
  const earned = seat.ledger
    .filter((l) => l.kind.includes("cut") || l.kind.includes("ticket") || l.amount > 0)
    .reduce((sum, l) => sum + Math.max(0, l.amount), 0);
  const pending = seat.pending.reduce((sum, p) => sum + p.amount, 0);

  return (
    <aside className="earnings-ledger" aria-label="Seat earnings history">
      <p className="chapter-kicker">Earnings · Seat #{seat.tokenId}</p>
      <div className="earnings-ledger-stats">
        <div>
          <span className="meta">Accrued cuts</span>
          <strong>{earned}</strong>
        </div>
        <div>
          <span className="meta">Pending</span>
          <strong>{pending}</strong>
        </div>
        <div>
          <span className="meta">Tickets</span>
          <strong>{seat.ticketsAccrued}</strong>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="meta">No ledger rows yet. Buy a ticket on the river to stream cuts.</p>
      ) : (
        <ul className="earnings-ledger-list">
          {rows.map((r, i) => (
            <li key={`${r.at}-${r.kind}-${i}`}>
              <span className="earnings-kind">{r.kind}</span>
              <span className="mono">{r.amount}</span>
              <span className="meta">{r.note}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="meta">
        Seats (#34) tracks votes. We track what the vault earned, paid, and who held it through mid-payout.
      </p>
    </aside>
  );
}
