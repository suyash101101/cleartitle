"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OnchainActions } from "@/components/OnchainActions";
import { SessionBar } from "@/components/SessionBar";
import { IntentEscrowStrip } from "@/components/IntentEscrowStrip";
import { PageHeader } from "@/components/ui/page-header";
import { viewClub, type ChainClub } from "@/lib/chainViews";
import { useApp } from "@/lib/store";

export default function BoxOfficePage() {
  const world = useApp((s) => s.world);
  const productMode = useApp((s) => s.productMode);
  const lastSplit = useApp((s) => s.lastSplit);
  const doBuyTicket = useApp((s) => s.doBuyTicket);
  const club = world.club;
  const [liveClub, setLiveClub] = useState<ChainClub | null>(null);

  useEffect(() => {
    if (productMode !== "live") return;
    let cancelled = false;
    void viewClub()
      .then((c) => {
        if (!cancelled) setLiveClub(c);
      })
      .catch(() => {
        if (!cancelled) setLiveClub(null);
      });
    return () => {
      cancelled = true;
    };
  }, [productMode]);

  const isLive = productMode === "live";

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Box Office"
        lede={
          isLive
            ? "Buy a ticket with a signed wallet call. Splits hit founding seat vaults on testnet."
            : "Preview buy uses the local scenario engine. Switch to Live for signed buy_ticket."
        }
      />
      <SessionBar />
      <p className="meta" style={{ margin: "0 0 1.15rem" }}>
        <span className={`badge ${isLive ? "rpc" : "scenario"}`}>{isLive ? "Live path" : "Preview"}</span>{" "}
        splits stream on <Link href="/night">ticket river</Link>
        {" · "}
        <Link href="/console">Club console</Link>
      </p>

      {isLive && (
        <>
          {liveClub && (
            <div className="panel" style={{ marginBottom: "1.25rem" }}>
              <h3>{liveClub.name ?? "CleanDeed venue"}</h3>
              <p className="meta">
                tickets sold · {liveClub.tickets_sold ?? 0} · treasury ·{" "}
                {String(liveClub.treasury_balance ?? "—")} · ticket ·{" "}
                {String(liveClub.ticket_price ?? "10")} yocto (testnet stand-in)
              </p>
            </div>
          )}
          <OnchainActions />
        </>
      )}

      {!isLive &&
        (!club ? (
          <p className="meta">Create a club first in Console (Preview).</p>
        ) : (
          <div className="grid-2" style={{ marginTop: "1.75rem", marginBottom: "1.75rem", gap: "1.75rem" }}>
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
              <h3>Scenario split</h3>
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
        ))}
      <IntentEscrowStrip />
      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
