"use client";

import Link from "next/link";
import { ONCHAIN, txUrl } from "@/lib/evidence";
import { useApp } from "@/lib/store";

const DEFAULT_N = 8;

function relTime(at: number): string {
  const s = Math.max(0, Math.floor((Date.now() - at) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function TicketRiver({ limit = DEFAULT_N, compact = false }: { limit?: number; compact?: boolean }) {
  const tickets = useApp((s) => s.world.tickets);
  const club = useApp((s) => s.world.club);
  const rows = tickets.slice(-limit).reverse();

  if (!club) {
    return (
      <div className="ticket-river empty">
        <p className="meta">Load live night from Club to stream ticket splits here.</p>
        <Link className="pin-link" href="/console">
          Club console →
        </Link>
      </div>
    );
  }

  return (
    <section className={`ticket-river ${compact ? "compact" : ""}`} aria-label="Ticket river">
      <div className="ticket-river-head">
        <div className="ticket-river-title">
          <span className="badge scenario">Scenario engine</span>
          <h3>{club.name} · ticket river</h3>
        </div>
        <div className="ticket-river-proof">
          <span className="meta">On-chain buy_ticket anchor</span>
          <a className="mono" href={txUrl(ONCHAIN.buyTicket)} target="_blank" rel="noreferrer">
            {ONCHAIN.buyTicket.slice(0, 12)}…
          </a>
          {!compact && (
            <Link className="live-rail-link" href="/night">
              Full river →
            </Link>
          )}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="meta">No tickets yet. Box office streams cuts live.</p>
      ) : (
        <ol className="ticket-river-list">
          {rows.map((ev) => (
            <li key={ev.txHash}>
              <span className="ticket-river-time">{relTime(ev.at)}</span>
              <span className="ticket-river-buyer">{ev.buyer}</span>
              <span className="ticket-river-split">
                {ev.price} USDC · treasury +{ev.treasuryCut}
                {ev.seatCuts.length > 0 ? ` · ${ev.seatCuts.length} seats` : ""}
              </span>
              <a
                className="ticket-river-tx"
                href={txUrl(ONCHAIN.buyTicket)}
                target="_blank"
                rel="noreferrer"
                title="Same buy_ticket method — live testnet receipt"
              >
                buy_ticket ↗
              </a>
              <span className="ticket-river-film mono" title="Scenario tx id">
                {ev.txHash}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
