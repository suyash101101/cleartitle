"use client";

import { OnchainActions } from "@/components/OnchainActions";
import { SessionBar } from "@/components/SessionBar";
import { SettlementPulse } from "@/components/SettlementPulse";
import { IntentEscrowStrip } from "@/components/IntentEscrowStrip";
import { WedgeBadge } from "@/components/WedgeBadge";
import { PageHeader } from "@/components/ui/page-header";
import { useApp } from "@/lib/store";

export default function BoxOfficePage() {
  const world = useApp((s) => s.world);
  const lastSplit = useApp((s) => s.lastSplit);
  const doBuyTicket = useApp((s) => s.doBuyTicket);
  const club = world.club;

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Box Office"
        lede="Buy a ticket. Splits match live buy_ticket rules on testnet."
      />
      <WedgeBadge />
      <SettlementPulse />
      <SessionBar />
      <p className="meta" style={{ margin: "0 0 1.15rem" }}>
        <span className="badge rpc">Live path</span> splits stream on{" "}
        <a href="/night">ticket river</a>
      </p>
      <OnchainActions />
      {!club ? (
        <p className="meta">Create a club first in Console.</p>
      ) : (
        <div className="grid-2" style={{ marginBottom: "1.35rem" }}>
          <div className="panel">
            <h3>{club.name}</h3>
            <p className="font-display my-2 text-5xl tracking-tight">
              {club.ticketPrice} <span className="text-base font-semibold text-mute">USDC</span>
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
      <IntentEscrowStrip />
      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
