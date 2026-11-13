"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { HomeActions } from "@/components/HomeActions";
import { TestnetPanel } from "@/components/TestnetPanel";
import {
  DiligenceStampCard,
  FailSlipCard,
  OwnershipFlipCard,
  SeatDeedCard,
} from "@/components/assets/StoryAssets";

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const BEATS = [
  {
    id: "mishap",
    kicker: "01 · Why this exists",
    title: "Resale still lets the seller keep the door.",
    body: "Ticketek share-links can be recalled by the original holder. SecureMyPass-style clones double-sell the same barcode. NFT seats often keep keys or pending cuts after transfer. ClearTitle closes those holes on NEAR.",
    href: "/lab",
    cta: "Open Transfer Lab",
    asset: <FailSlipCard title="Seller recall" reason="old holder still controls access" />,
  },
  {
    id: "vault",
    kicker: "02 · NEP-171 seat",
    title: "The seat is the wallet. Zero access keys.",
    body: "Each founding seat is a NEP-171 deed over a keyless sub-account that earns ticket cuts. BTC and SOL tip addresses stay continuous across sales. Control flips. Continuity does not.",
    href: "/seat/3",
    cta: "Inspect Seat #3",
    asset: <SeatDeedCard />,
    reverse: true,
  },
  {
    id: "sale",
    kicker: "03 · Mid-payout clear title",
    title: "Buy while money is still in flight.",
    body: "Ada lists mid-payout. Priya buys. Pending ticket money rebounds to the buyer. Diligence stamps PROVABLY CLEAN. Old owner withdraw and held-sig raw sign fail with live explorer receipts.",
    href: "/seat/3",
    cta: "Run mid-payout",
    asset: <OwnershipFlipCard />,
  },
];

export function StoryJourney() {
  return (
    <div className="story near-theme">
      <section className="near-hero" aria-label="ClearTitle">
        <div className="near-hero-bg" aria-hidden />
        <div className="near-hero-grid">
          <div className="near-hero-inner">
            <p className="chapter-kicker">NEAR · NFTs that do something</p>
            <h1>
              Clear<em>Title</em>
            </h1>
            <p className="story-lede">
              Title insurance for ticket-earning seat NFTs. Sell the seat. Keep nothing. Pending cuts follow the buyer.
            </p>
            <HomeActions />
            <p className="hero-hint">Live testnet contract · local film engine · explorer-backed Lab</p>
          </div>
          <div className="hero-stage single">
            <div className="hero-stage-glow" aria-hidden />
            <SeatDeedCard owner="ada.near" epoch={1} />
          </div>
        </div>
      </section>

      <section className="live-strip" aria-label="Live testnet">
        <TestnetPanel />
      </section>

      {BEATS.map((c) => (
        <section key={c.id} id={c.id} className={`chapter-row ${c.reverse ? "reverse" : ""}`}>
          <Reveal className="chapter-copy" delay={0.04}>
            <p className="chapter-kicker">{c.kicker}</p>
            <h2>{c.title}</h2>
            <p>{c.body}</p>
            <Link className="pin-link" href={c.href}>
              {c.cta}
            </Link>
          </Reveal>
          <Reveal className="chapter-asset" delay={0.08}>
            {c.asset}
          </Reveal>
        </section>
      ))}

      <section className="finale">
        <Reveal>
          <h2>Prove it clean.</h2>
          <p className="story-lede">
            Diligence packet, claim matrix, and Member Room gating. Same story on testnet RPC and in the film path.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/verify">
              /verify proofs
            </Link>
            <Link className="btn ghost" href="/box-office">
              Buy a ticket
            </Link>
            <Link className="btn ghost" href="/member/3">
              Member Room
            </Link>
          </div>
        </Reveal>
        <Reveal className="chapter-asset" delay={0.08}>
          <DiligenceStampCard />
        </Reveal>
      </section>
    </div>
  );
}
