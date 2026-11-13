"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { HomeActions } from "@/components/HomeActions";
import { TestnetPanel } from "@/components/TestnetPanel";
import { TicketRiver } from "@/components/TicketRiver";
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
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const BEATS = [
  {
    id: "mishap",
    kicker: "01 · Real mishaps",
    title: "Coldplay share-links got recalled after the money moved.",
    body: "Oct 2024: a Tixel buyer watched Ticketek recall accepted Coldplay tickets after the seller double-sold elsewhere. SecureMyPass clones and barcode flips do the same. ClearTitle makes recall and double-spend impossible on-chain.",
    href: "/lab",
    cta: "Run seller-recall attack",
    asset: <FailSlipCard title="Seller recall" reason="old holder still controls access" />,
  },
  {
    id: "vault",
    kicker: "02 · NEP-171 seat NFTs",
    title: "Floor, lounge, suite, VIP, press. Same clear title.",
    body: "Five founding deeds. Each is a NEP-171 NFT over a keyless vault that earns ticket cuts. BTC and SOL tip addresses stay continuous across sales. Control flips. Continuity does not.",
    href: "/inventory",
    cta: "Open live inventory",
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
  {
    id: "vs",
    kicker: "04 · Beyond escrow",
    title: "Escrow holds the money. We clear the title.",
    body: "Ticket escrows (Lummy-style) protect the door fee until show night. ClearTitle protects the earning seat itself: zero keys, held-sig freeze, mid-payout rebound, and a diligence stamp you can verify before you buy.",
    href: "/verify",
    cta: "See threat model",
    asset: <DiligenceStampCard />,
    reverse: true,
  },
];

const MISHAPS = [
  {
    when: "Oct 2024",
    where: "Ticketek · Coldplay",
    what: "Seller recalled accepted share-links after Tixel payout. Buyer refunded, night lost.",
  },
  {
    when: "2024–25",
    where: "FB / clones",
    what: "Barcode screenshots and SecureMyPass-style apps double-sold the same door.",
  },
  {
    when: "NFT seats",
    where: "Most markets",
    what: "Keys, pending cuts, and held signatures stay with the seller after transfer.",
  },
];

export function StoryJourney() {
  return (
    <div className="story near-theme">
      <section className="near-hero" aria-label="ClearTitle">
        <div className="near-hero-plane" aria-hidden>
          <div className="near-hero-plane-grid" />
          <div className="near-hero-plane-line" />
        </div>
        <div className="near-hero-inner">
          <p className="chapter-kicker">NEAR · NFTs that earn</p>
          <h1>
            Clear<em>Title</em>
          </h1>
          <p className="story-lede">
            <span className="lede-strong">Sell the seat. Keep nothing.</span>
            <br />
            Title insurance for ticket-earning seat NFTs. Pending cuts follow the buyer.
          </p>
          <HomeActions />
          <p className="hero-hint">Live testnet · signed wallet · explorer Lab</p>
        </div>
      </section>

      <section className="live-strip" aria-label="Live testnet">
        <TestnetPanel />
        <TicketRiver limit={5} compact />
      </section>

      <section className="mishap-rail" aria-label="Why ClearTitle">
        <p className="chapter-kicker">Why this exists</p>
        <ol className="mishap-list">
          {MISHAPS.map((m) => (
            <li key={m.where}>
              <span className="mishap-when">{m.when}</span>
              <span className="mishap-where">{m.where}</span>
              <span className="mishap-what">{m.what}</span>
            </li>
          ))}
        </ol>
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
            Diligence packet, claim matrix, and Member Room gating. Same rules on testnet RPC and in the scenario engine.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/verify">
              /verify proofs
            </Link>
            <Link className="btn ghost" href="/box-office">
              Buy a ticket
            </Link>
            <Link className="btn ghost" href="/inventory">
              Seat NFTs
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
