"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionBar } from "@/components/SessionBar";
import { CutTicker } from "@/components/CutTicker";
import { TicketRiver } from "@/components/TicketRiver";
import { PageHeader } from "@/components/ui/page-header";
import { viewClub, type ChainClub } from "@/lib/chainViews";
import { useApp } from "@/lib/store";

export default function NightPage() {
  const doBuyTicket = useApp((s) => s.doBuyTicket);
  const productMode = useApp((s) => s.productMode);
  const club = useApp((s) => s.world.club);
  const ticketsSold = club?.ticketsSold ?? 0;
  const [liveClub, setLiveClub] = useState<ChainClub | null>(null);
  const isLive = productMode === "live";

  useEffect(() => {
    if (!isLive) return;
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
  }, [isLive]);

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="QuitClaim ticket river"
        lede="Every ticket sale splits treasury and seat vaults. Live mode reads chain tickets_sold; Preview uses the scenario river."
      />
      <div style={{ marginBottom: "1.25rem" }}>
        <CutTicker />
      </div>
      <SessionBar />
      <div className="cta-row" style={{ marginBottom: "1.25rem" }}>
        {isLive ? (
          <span className="meta">
            <span className="badge rpc">Live</span>{" "}
            {liveClub
              ? `${liveClub.tickets_sold ?? 0} sold · treasury ${String(liveClub.treasury_balance ?? "—")}`
              : "Reading club…"}
          </span>
        ) : (
          club && (
            <>
              <button type="button" onClick={doBuyTicket} disabled={club.paused}>
                Sell one more ticket
              </button>
              <span className="meta">
                <span className="badge scenario">Preview</span>
                {ticketsSold} sold · treasury {club.treasuryBalance}
              </span>
            </>
          )
        )}
        <Link className="btn ghost" href="/box-office">
          Box office
        </Link>
        <Link className="btn ghost" href="/title/3">
          Seat #3 certificate
        </Link>
        <Link className="btn ghost" href="/lab">
          Transfer Lab
        </Link>
      </div>
      <TicketRiver limit={24} />
      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
