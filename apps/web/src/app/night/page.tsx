"use client";

import Link from "next/link";
import { SessionBar } from "@/components/SessionBar";
import { CutTicker } from "@/components/CutTicker";
import { TicketRiver } from "@/components/TicketRiver";
import { PageHeader } from "@/components/ui/page-header";
import { useApp } from "@/lib/store";

export default function NightPage() {
  const doBuyTicket = useApp((s) => s.doBuyTicket);
  const club = useApp((s) => s.world.club);
  const ticketsSold = club?.ticketsSold ?? 0;

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Nearnight Live"
        lede="Every ticket sale splits treasury and seat vaults in real time. Same buy_ticket rules as live testnet."
      />
      <div style={{ marginBottom: "1.25rem" }}>
        <CutTicker />
      </div>
      <SessionBar />
      {club && (
        <div className="cta-row" style={{ marginBottom: "1.25rem" }}>
          <button type="button" onClick={doBuyTicket} disabled={club.paused}>
            Sell one more ticket
          </button>
          <span className="meta">
            <span className="badge scenario">Scenario</span>
            {ticketsSold} sold · treasury {club.treasuryBalance}
          </span>
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
      )}
      <TicketRiver limit={24} />
      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
