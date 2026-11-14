"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FlaskConical,
  LayoutGrid,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { GeoNetwork } from "@/components/GeoNetwork";
import { HomeActions } from "@/components/HomeActions";
import { OrbitalCTA } from "@/components/OrbitalCTA";
import { StoryHorizScroll } from "@/components/StoryHorizScroll";
import { TestnetPanel } from "@/components/TestnetPanel";
import { TicketRoll3D } from "@/components/TicketRoll3D";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  DiligenceStampCard,
  FailSlipCard,
  OwnershipFlipCard,
  SeatDeedCard,
  TitleScoreCard,
} from "@/components/assets/StoryAssets";
import { BRAND, BRAND_BLURB, BRAND_MEANING, BRAND_TAGLINE } from "@/lib/brand";

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
      initial={{ opacity: 0, y: 14 }}
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
    kicker: "01 · Real mishaps",
    title: "Tickets get recalled after the money already moved.",
    body: `Oct 2024: Ticketek recalled accepted Coldplay share-links after a Tixel sale. On ${BRAND} those paths refuse on-chain with explorer receipts.`,
    href: "/lab",
    cta: "Run seller-recall refuse",
    asset: <FailSlipCard title="Seller recall" reason="old holder still controls access" />,
  },
  {
    id: "vault",
    kicker: "02 · Five NEP-171 seat deeds",
    title: "Any seat classes you define. Each earns on every ticket.",
    body: "Any venue on one contract. Founding seat NFTs are keyless vaults that take a cut of every door fee. Control flips. Tip addresses do not.",
    href: "/inventory",
    cta: "Browse seat inventory",
    asset: <SeatDeedCard />,
    reverse: true,
  },
  {
    id: "sale",
    kicker: "03 · Pending cuts follow the buyer",
    title: "Buy while money is still in flight.",
    body: "Ada lists Seat #3 while a ticket cut is pending. Priya buys. The pending cut rebounds. Old-owner withdraw fails on live testnet.",
    href: "/seat/3",
    cta: "Open Seat #3 live",
    asset: <OwnershipFlipCard />,
  },
  {
    id: "gate",
    kicker: "04 · Buy only if CLEAN",
    title: "Owner alone is not enough.",
    body: `${BRAND} locks the buy until six named checks pass. No CLEAN stamp, no sale.`,
    href: "/title/3",
    cta: "Open title certificate",
    asset: (
      <div className="chapter-asset-stack">
        <TitleScoreCard />
        <DiligenceStampCard />
      </div>
    ),
    reverse: true,
  },
  {
    id: "prove",
    kicker: "05 · Prove it",
    title: "Every refuse has an explorer receipt.",
    body: "Transfer Lab arms seller-recall, listed drain, and held-sig. Each fails on-chain. /verify shows the explorer receipts first, then the promise → method → test map.",
    href: "/verify",
    cta: "Open proof matrix",
    asset: <FailSlipCard title="EXPECTED FAIL" reason="not current owner · live RPC" />,
  },
];

export function StoryJourney() {
  return (
    <div className="story near-theme x-ads-story">
      <section className="near-hero x-hero" aria-label={`${BRAND}`}>
        <div className="near-hero-inner hero-centered">
          <p className="chapter-kicker">NEAR · nfts · title policy</p>
          <h1>
            {BRAND}
            <span className="h1-sub">{BRAND_TAGLINE}</span>
          </h1>
          <p className="brand-meaning">{BRAND_MEANING}</p>
          <div className="x-hero-media">
            <GeoNetwork />
          </div>
          <p className="story-lede">{BRAND_BLURB}</p>
          <HomeActions />
        </div>
      </section>

      <section className="live-strip" aria-label="Live testnet">
        <TestnetPanel compact />
      </section>

      <section className="seat-class-section dense" aria-label="Seat mint roll">
        <Reveal>
          <p className="chapter-kicker">Mint · drag & tear</p>
          <h2>Pull the paper. Tear a seat NFT.</h2>
          <TicketRoll3D mode="mint" />
        </Reveal>
      </section>

      <StoryHorizScroll beats={BEATS} />

      <section className="bento-section dense" aria-label="Product paths">
        <p className="chapter-kicker">Paths</p>
        <h2>
          Built so sellers quit every claim.
          <span className="mute"> Proven on testnet.</span>
        </h2>
        <BentoGrid>
          <BentoCard
            name="Transfer Lab"
            className="bento-span-2"
            Icon={FlaskConical}
            description="Seller recall, listed drain, held-sig. Each refuses with explorer receipts."
            href="/lab"
            cta="Open Lab"
          />
          <BentoCard
            name="Seat inventory"
            Icon={LayoutGrid}
            description="Five NEP-171 classes. Tear from the roll. Live RPC deeds."
            href="/inventory"
            cta="Browse seats"
          />
          <BentoCard
            name="Title certificate"
            Icon={ShieldCheck}
            description="PROVABLY CLEAN stamp. Six named checks. Shareable for judges."
            href="/title/3"
            cta="Open cert"
          />
          <BentoCard
            name="Box office"
            className="bento-span-2"
            Icon={Ticket}
            description="Buy a ticket. Splits hit seat vaults the same way as live buy_ticket."
            href="/box-office"
            cta="Buy ticket"
          />
        </BentoGrid>
      </section>

      <OrbitalCTA />

      <section className="finale dense">
        <Reveal>
          <h2>Prove it on testnet.</h2>
          <div className="cta-row">
            <Link className="btn" href="/lab">
              Transfer Lab
            </Link>
            <Link className="btn ghost" href="/verify">
              Proof matrix
            </Link>
          </div>
        </Reveal>
      </section>
      <div className="console-end-spacer" aria-hidden />
    </div>
  );
}
