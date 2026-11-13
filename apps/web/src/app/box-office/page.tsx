"use client";

import { ActorBar } from "@/components/ActorBar";
import { OnchainActions } from "@/components/OnchainActions";
import { WalletBar } from "@/components/WalletBar";
import { useApp } from "@/lib/store";

export default function BoxOfficePage() {
  const world = useApp((s) => s.world);
  const lastSplit = useApp((s) => s.lastSplit);
  const doBuyTicket = useApp((s) => s.doBuyTicket);
  const club = world.club;

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <h2>Box Office</h2>
      <p className="lede">Buy a ticket. Watch the split hit treasury and every seat vault.</p>
      <WalletBar />
      <ActorBar />
      <OnchainActions />
      {!club ? (
        <p className="meta">Create a club first in Console.</p>
      ) : (
        <div className="grid-2">
          <div className="panel">
            <h3>{club.name}</h3>
            <p style={{ fontSize: "2.5rem", fontFamily: "var(--font-display)", margin: "0.5rem 0" }}>
              {club.ticketPrice} <span style={{ fontSize: "1rem", color: "var(--mute)" }}>USDC</span>
            </p>
            <button type="button" onClick={doBuyTicket} disabled={club.paused}>
              Buy ticket
            </button>
            <p className="meta" style={{ marginTop: "1rem" }}>
              Sold tonight · {club.ticketsSold}
            </p>
          </div>
          <div className="panel">
            <h3>Live split</h3>
            {lastSplit ? (
              <div className="split-viz" key={lastSplit.txHash}>
                <div className="split-row">
                  <span>Treasury</span>
                  <div className="split-bar">
                    <i style={{ width: `${(lastSplit.treasuryCut / lastSplit.price) * 100}%` }} />
                  </div>
                  <span className="mono">+{lastSplit.treasuryCut}</span>
                </div>
                {lastSplit.seatCuts.map((c) => (
                  <div className="split-row" key={c.tokenId}>
                    <span>Seat #{c.tokenId}</span>
                    <div className="split-bar">
                      <i style={{ width: `${(c.amount / lastSplit.price) * 100}%` }} />
                    </div>
                    <span className="mono">+{c.amount}</span>
                  </div>
                ))}
                <p className="meta mono" style={{ marginTop: "0.75rem" }}>
                  {lastSplit.txHash}
                </p>
              </div>
            ) : (
              <p className="meta">Buy a ticket to see the river of cuts.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
