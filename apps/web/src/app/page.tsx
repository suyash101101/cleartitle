"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HomeActions } from "@/components/HomeActions";
import { TestnetPanel } from "@/components/TestnetPanel";

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-label="ClearTitle">
        <div className="hero-inner">
          <p className="mb-3 text-sm font-semibold text-mute">Nearnight Live on NEAR</p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Clear<em>Title</em>
          </motion.h1>
          <p>Sell the seat. Keep nothing. Ticket money follows clear title.</p>
          <HomeActions />
          <div className="cta-row" style={{ marginTop: "0.75rem" }}>
            <Link className="btn ghost" href="/box-office">
              Box Office
            </Link>
            <Link className="btn ghost" href="/lab">
              Transfer Lab
            </Link>
          </div>
        </div>

        <motion.div
          className="ticket-visual"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          <div className="ticket-card">
            <p className="text-xs font-semibold tracking-wide text-white/55">Founding seat</p>
            <p className="mt-2 font-display text-4xl tracking-tight">Seat #3</p>
            <p className="mt-2 text-sm text-white/65">0 access keys · epoch freezes on list</p>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-white/45">Tickets accrued</p>
                <p className="font-display text-3xl">12</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/45">Verdict</p>
                <p className="font-display text-lg text-emerald-300">PROVABLY CLEAN</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <TestnetPanel />

      <section className="section">
        <h2>One product. One proof.</h2>
        <p className="lede">
          Club seats are NEP-171 deeds over keyless vaults. Every ticket splits on-chain. Sale moves
          ownership, pending payouts, and chain-sig control — mid-payout, under attack.
        </p>
        <div className="grid-2">
          <div className="panel">
            <h3>Club Night</h3>
            <p className="meta">
              Create Nearnight · mint five seats · sell tickets · watch cuts land in seat vaults and
              the treasury.
            </p>
            <p style={{ marginTop: "1rem" }}>
              <Link href="/console">Open Club Console</Link>
            </p>
          </div>
          <div className="panel">
            <h3>Clear Title</h3>
            <p className="meta">
              Diligence Packet · Transfer Lab · Sign epoch freeze · mid-payout buy · /verify for every
              claim.
            </p>
            <p style={{ marginTop: "1rem" }}>
              <Link href="/seat/3">Inspect Seat #3</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
