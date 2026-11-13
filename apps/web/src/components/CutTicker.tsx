"use client";

import { useEffect, useState } from "react";

const CUTS = [
  { seat: "#1 floor", amt: "1.0", who: "organizer.near" },
  { seat: "#2 lounge", amt: "1.0", who: "organizer.near" },
  { seat: "#3 suite", amt: "1.0", who: "ada.near" },
  { seat: "#4 VIP", amt: "1.0", who: "organizer.near" },
  { seat: "#5 press", amt: "1.0", who: "organizer.near" },
  { seat: "treasury", amt: "5.0", who: "nearnight" },
];

/** Animated cut tape — TicketChain shows mint; we show the money path. */
export function CutTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % CUTS.length), 1600);
    return () => window.clearInterval(id);
  }, []);

  const row = CUTS[i];
  return (
    <aside className="cut-ticker" aria-label="Ticket cut ticker">
      <p className="chapter-kicker">Live cut tape</p>
      <p className="cut-ticker-row">
        <span className="cut-ticker-seat">{row.seat}</span>
        <strong>{row.amt} USDC</strong>
        <span className="meta mono">{row.who}</span>
      </p>
      <p className="meta">Door fee → five seats + treasury. Pending follows the holder on buy_seat.</p>
    </aside>
  );
}
