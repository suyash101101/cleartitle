"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { HomeActions } from "@/components/HomeActions";
import { TestnetPanel } from "@/components/TestnetPanel";
import { TiltCard } from "@/components/TiltCard";
import {
  DiligenceStampCard,
  FailSlipCard,
  NightTicketCard,
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
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -60]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 8]);

  return (
    <motion.div ref={ref} className="hero-visual" style={{ y, rotate }}>
      <TiltCard className="hero-visual-card">
        <SeatDeedCard />
      </TiltCard>
      <div className="hero-visual-float">
        <TiltCard>
          <NightTicketCard />
        </TiltCard>
      </div>
    </motion.div>
  );
}

const CHAPTERS = [
  {
    id: "ticket",
    kicker: "01 · Box office",
    title: "A ticket hits the door.",
    body: "Nearnight sells a ticket. One payment. On-chain split into treasury and five founding seat vaults — a receipt, not a spreadsheet.",
    href: "/box-office",
    cta: "Open Box Office",
    asset: <NightTicketCard />,
  },
  {
    id: "vault",
    kicker: "02 · Seat vault",
    title: "The seat owns a wallet. You don’t own a key.",
    body: "NEP-171 deed over a keyless sub-account. Zero access keys. BTC and SOL tips stay put when the seat sells — control flips, continuity doesn’t.",
    href: "/seat/3",
    cta: "Inspect Seat #3",
    asset: <SeatDeedCard />,
    reverse: true,
  },
  {
    id: "sale",
    kicker: "03 · Mid-payout",
    title: "Sell while the cut is still pending.",
    body: "Ada lists. Priya buys mid-payout. Pending ticket money rebounds to the buyer. Old owner keeps nothing — no key, no dime, no held signature.",
    href: "/seat/3",
    cta: "Run mid-payout",
    asset: <OwnershipFlipCard />,
  },
  {
    id: "lab",
    kicker: "04 · Transfer Lab",
    title: "Then we attack the sale.",
    body: "Old owner withdraw. Listed drain. Held-sig raw sign. Expected fails with live explorer receipts — the product is the refusal.",
    href: "/lab",
    cta: "Open Transfer Lab",
    asset: <FailSlipCard />,
    reverse: true,
  },
  {
    id: "clean",
    kicker: "05 · Diligence",
    title: "PROVABLY CLEAN before you buy.",
    body: "Keys empty. Continuity stable. Pending rebound. Epoch freeze. Stamp it, then open the Member Room.",
    href: "/verify",
    cta: "See /verify",
    asset: <DiligenceStampCard />,
  },
];

export function StoryJourney() {
  return (
    <div className="story near-theme">
      <section className="near-hero" aria-label="ClearTitle">
        <div className="near-hero-bg" aria-hidden />
        <div className="near-hero-inner">
          <p className="chapter-kicker">Nearnight Live · NFTs that do something</p>
          <h1>
            Clear<em>Title</em>
          </h1>
          <p className="story-lede">
            Sell the seat. Keep nothing. Ticket money follows clear title — scroll the night.
          </p>
          <HomeActions />
          <div className="cta-row" style={{ marginTop: "0.75rem" }}>
            <Link className="btn ghost" href="#ticket">
              Enter the story
            </Link>
            <Link className="btn ghost" href="/lab">
              Transfer Lab
            </Link>
          </div>
        </div>
        <HeroVisual />
      </section>

      <nav className="story-jump" aria-label="Story chapters">
        {CHAPTERS.map((c) => (
          <a key={c.id} href={`#${c.id}`}>
            {c.id}
          </a>
        ))}
      </nav>

      {CHAPTERS.map((c, i) => (
        <section key={c.id} id={c.id} className={`chapter-row ${c.reverse ? "reverse" : ""}`}>
          <Reveal className="chapter-copy" delay={0.05}>
            <p className="chapter-kicker">{c.kicker}</p>
            <h2>{c.title}</h2>
            <p>{c.body}</p>
            <Link className="pin-link" href={c.href}>
              {c.cta}
            </Link>
          </Reveal>
          <Reveal className="chapter-asset" delay={0.12}>
            <TiltCard>{c.asset}</TiltCard>
          </Reveal>
        </section>
      ))}

      <section className="finale">
        <Reveal>
          <h2>Run the night.</h2>
          <p className="story-lede">
            Load demo night · buy a ticket · flip Seat #3 mid-payout · fail the lab · read /verify.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/console">
              Club Console
            </Link>
            <Link className="btn ghost" href="/seat/3">
              Seat #3
            </Link>
            <Link className="btn ghost" href="/verify">
              /verify
            </Link>
          </div>
        </Reveal>
        <div className="story-panel-wrap">
          <TestnetPanel />
        </div>
      </section>
    </div>
  );
}
