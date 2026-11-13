"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HomeActions } from "@/components/HomeActions";
import { TestnetPanel } from "@/components/TestnetPanel";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Marquee } from "@/components/magicui/marquee";
import { Particles } from "@/components/magicui/particles";
import { NumberTicker } from "@/components/magicui/number-ticker";

const claims = [
  "sale_mid_payout_rebinds_pending",
  "held_sig_refused_while_listed",
  "old_owner_withdraw_fails",
  "keys_empty_after_mint",
  "continuity_hash_stable",
  "diligence_provably_clean",
];

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-label="ClearTitle">
        <Particles className="opacity-70" quantity={36} color="#1B6EF3" />
        <div className="hero-inner">
          <BlurFade delay={0.02}>
            <p className="mb-4 text-sm font-semibold text-mute">Nearnight Live on NEAR</p>
          </BlurFade>
          <BlurFade delay={0.08}>
            <h1>
              Clear<em>Title</em>
            </h1>
          </BlurFade>
          <BlurFade delay={0.16}>
            <p>Sell the seat. Keep nothing. Ticket money follows clear title.</p>
          </BlurFade>
          <BlurFade delay={0.22}>
            <HomeActions />
          </BlurFade>
          <BlurFade delay={0.28}>
            <div className="cta-row" style={{ marginTop: "0.75rem" }}>
              <Link className="btn ghost" href="/box-office">
                Box Office
              </Link>
              <Link className="btn ghost" href="/lab">
                Transfer Lab
              </Link>
            </div>
          </BlurFade>
        </div>

        <motion.div
          className="ticket-visual"
          initial={{ opacity: 0, y: 28, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ticket-card">
            <BorderBeam size={80} duration={9} colorFrom="#1B6EF3" colorTo="#0C8C6E" />
            <p className="font-display text-xs font-semibold tracking-[0.18em] text-white/55">
              FOUNDING SEAT
            </p>
            <p className="mt-3 font-display text-4xl font-bold tracking-tight">Seat #3</p>
            <p className="mt-2 text-sm text-white/65">0 access keys · epoch frozen on list</p>
            <div className="mt-8 flex items-end justify-between gap-4 pr-10">
              <div>
                <p className="text-xs text-white/45">Tickets accrued</p>
                <p className="font-display text-3xl font-bold">
                  <NumberTicker value={12} />
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/45">Verdict</p>
                <p className="font-display text-lg font-semibold text-[#5EEAD4]">PROVABLY CLEAN</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="relative -mx-4 mb-2 overflow-hidden border-y border-line bg-white/50 py-2">
        <Marquee pauseOnHover className="[--duration:32s]">
          {claims.map((c) => (
            <span key={c} className="mx-4 font-mono text-xs text-mute">
              {c}
            </span>
          ))}
        </Marquee>
      </div>

      <TestnetPanel />

      <section className="section">
        <BlurFade inView>
          <h2>One product. One proof.</h2>
          <p className="lede">
            Club seats are NEP-171 deeds over keyless vaults. Every ticket splits on-chain. Sale moves
            ownership, pending payouts, and chain-sig control — mid-payout, under attack.
          </p>
        </BlurFade>
        <div className="grid-2">
          <BlurFade inView delay={0.08}>
            <div className="panel">
              <BorderBeam duration={10} size={50} colorFrom="#1B6EF3" colorTo="#94A3B8" />
              <h3>Club Night</h3>
              <p className="meta">
                Create Nearnight · mint five seats · sell tickets · watch cuts land in seat vaults and
                the treasury.
              </p>
              <p style={{ marginTop: "1rem" }}>
                <Link href="/console">Open Club Console</Link>
              </p>
            </div>
          </BlurFade>
          <BlurFade inView delay={0.14}>
            <div className="panel">
              <BorderBeam duration={11} delay={1} size={50} colorFrom="#0C8C6E" colorTo="#1B6EF3" />
              <h3>Clear Title</h3>
              <p className="meta">
                Diligence Packet · Transfer Lab · Sign epoch freeze · mid-payout buy · /verify for every
                claim.
              </p>
              <p style={{ marginTop: "1rem" }}>
                <Link href="/seat/3">Inspect Seat #3</Link>
              </p>
            </div>
          </BlurFade>
        </div>
      </section>
    </>
  );
}
