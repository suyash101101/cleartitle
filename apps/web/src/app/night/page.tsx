"use client";

import Link from "next/link";
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
        lede="Every ticket sale splits treasury and seat vaults in real time. Scenario engine mirrors the same buy_ticket rules as testnet."
      />
      {club && (
        <div className="cta-row" style={{ marginBottom: "1.25rem" }}>
          <button type="button" onClick={doBuyTicket} disabled={club.paused}>
            Sell one more ticket
          </button>
          <span className="badge rpc">Testnet RPC</span>
          <span className="meta">
            {ticketsSold} sold · treasury {club.treasuryBalance}
          </span>
          <Link className="btn ghost" href="/box-office">
            Box office
          </Link>
        </div>
      )}
      <TicketRiver limit={24} />
    </section>
  );
}
