"use client";

import { useState } from "react";
import Link from "next/link";
import { quoteTicketIntentDry } from "@/sdk";
import { useApp } from "@/lib/store";

/** dry:true Intents ticket quote — labeled honestly, never moves funds. */
export function IntentEscrowStrip() {
  const world = useApp((s) => s.world);
  const club = world.club;
  const [quote, setQuote] = useState<ReturnType<typeof quoteTicketIntentDry> | null>(null);

  function runDry() {
    if (!club) return;
    setQuote(
      quoteTicketIntentDry({
        clubId: club.clubId,
        ticketPriceYocto: String(club.ticketPrice),
        contractId: "cleartitle562464.testnet",
      }),
    );
  }

  return (
    <aside className="warranty-strip" aria-label="Intents dry ticket pay">
      <p className="chapter-kicker">Payment vs seat title</p>
      <div className="warranty-strip-grid">
        <div>
          <p className="meta">Shipped · dry:true</p>
          <strong>Intents ticket quote</strong>
          <p className="meta">
            Preview a 1Click-shaped request. <em>dry:true</em> — no funds move. Seat title still
            settles only on NEAR after diligence.
          </p>
          <div className="cta-row" style={{ marginTop: "0.65rem" }}>
            <button type="button" className="ghost" onClick={runDry} disabled={!club}>
              Run dry quote
            </button>
          </div>
          {quote && (
            <pre
              className="mono"
              style={{
                marginTop: "0.75rem",
                fontSize: "0.72rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {JSON.stringify(quote, null, 2)}
            </pre>
          )}
        </div>
        <div className="ours">
          <p className="meta">Shipped · CleanDeed</p>
          <strong>NEAR-native clear title</strong>
          <p className="meta">
            One chain for vault, refuse, and rebound. Pending cuts rebind on buy_seat. Testnet
            ticket is yocto stand-in.
          </p>
        </div>
      </div>
      <Link className="pin-link" href="/scale">
        See scale roadmap →
      </Link>
    </aside>
  );
}
