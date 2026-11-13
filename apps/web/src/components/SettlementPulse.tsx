"use client";

import { useEffect, useState } from "react";

const BEATS = [
  { label: "ticket_cut", detail: "Door fee splits to five seats + treasury" },
  { label: "pending open", detail: "Cut sits on seat vault · claimable by owner" },
  { label: "list FREEZE", detail: "Encumbrance · held-sig epoch lock" },
  { label: "buy_seat", detail: "Pending REBOUND_TO_BUYER · tips continuous" },
  { label: "old withdraw", detail: "EXPECTED FAIL · not current owner" },
];

/** Live-feeling settlement pulse — TicketChain stops at mint; we show the money path. */
export function SettlementPulse() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % BEATS.length), 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <aside className="settlement-pulse" aria-label="Settlement pulse">
      <p className="chapter-kicker">Settlement pulse</p>
      <div className="settlement-pulse-track" aria-hidden>
        {BEATS.map((b, idx) => (
          <span key={b.label} className={idx === i ? "on" : undefined} />
        ))}
      </div>
      <p className="settlement-pulse-label">
        <strong>{BEATS[i].label}</strong>
        <span className="meta">{BEATS[i].detail}</span>
      </p>
    </aside>
  );
}
