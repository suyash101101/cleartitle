"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
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

function useChapterProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  return useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
}

function ParallaxLayer({
  progress,
  from,
  to,
  children,
  className,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  children: React.ReactNode;
  className?: string;
}) {
  const y = useTransform(progress, [0, 1], [from, to]);
  const opacity = useTransform(progress, [0.05, 0.2, 0.75, 0.95], [0, 1, 1, 0.35]);
  return (
    <motion.div style={{ y, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

function Chapter({
  id,
  kicker,
  title,
  body,
  asset,
  reverse,
}: {
  id: string;
  kicker: string;
  title: string;
  body: string;
  asset: React.ReactNode;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const progress = useChapterProgress(ref);
  const textX = useTransform(progress, [0.1, 0.45], reverse ? [40, 0] : [-40, 0]);
  const assetRotate = useTransform(progress, [0.15, 0.55], reverse ? [-8, -2] : [8, 2]);
  const assetScale = useTransform(progress, [0.1, 0.4], [0.9, 1]);

  return (
    <section ref={ref} id={id} className="chapter">
      <div className={`chapter-grid ${reverse ? "reverse" : ""}`}>
        <motion.div className="chapter-copy" style={{ x: textX }}>
          <p className="chapter-kicker">{kicker}</p>
          <h2>{title}</h2>
          <p>{body}</p>
        </motion.div>
        <motion.div
          className="chapter-asset"
          style={{ rotate: assetRotate, scale: assetScale }}
        >
          <TiltCard>{asset}</TiltCard>
        </motion.div>
      </div>
    </section>
  );
}

export function StoryJourney() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const ticketFloat = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const ticketSpin = useTransform(scrollYProgress, [0, 1], [-8, 6]);

  const stageRef = useRef<HTMLDivElement>(null);
  const stageProgress = useChapterProgress(stageRef);
  const orbX = useTransform(stageProgress, [0, 1], [-80, 120]);
  const orb2X = useTransform(stageProgress, [0, 1], [100, -60]);

  return (
    <div className="story" ref={stageRef}>
      <motion.div className="stage-orb orb-a" style={{ x: orbX }} aria-hidden />
      <motion.div className="stage-orb orb-b" style={{ x: orb2X }} aria-hidden />

      <section ref={heroRef} className="story-hero" aria-label="ClearTitle">
        <motion.div className="story-hero-copy" style={{ y: heroY, opacity: heroFade }}>
          <p className="chapter-kicker">Nearnight Live · title insurance for seats that earn</p>
          <h1>
            Clear<em>Title</em>
          </h1>
          <p className="story-lede">
            Sell the seat. Keep nothing. Scroll the night — ticket money, keyless vaults, mid-payout
            sale, and a Transfer Lab that refuses the dirty path.
          </p>
          <HomeActions />
          <div className="cta-row" style={{ marginTop: "0.75rem" }}>
            <Link className="btn ghost" href="#ticket">
              Start the story
            </Link>
            <Link className="btn ghost" href="/lab">
              Transfer Lab
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="story-hero-stage"
          style={{ y: ticketFloat, rotate: ticketSpin }}
        >
          <TiltCard className="hero-tilt">
            <SeatDeedCard />
          </TiltCard>
          <div className="hero-stack">
            <TiltCard>
              <NightTicketCard />
            </TiltCard>
          </div>
        </motion.div>
      </section>

      <div className="story-rail" aria-hidden>
        <span>ticket</span>
        <span>split</span>
        <span>0 keys</span>
        <span>mid-payout</span>
        <span>lab</span>
        <span>CLEAN</span>
      </div>

      <Chapter
        id="ticket"
        kicker="01 · Box office"
        title="A ticket hits the door."
        body="Nearnight sells a ticket. One payment. On-chain split: treasury cut plus a river of seat cuts into five founding vaults — not a spreadsheet, a receipt."
        asset={<NightTicketCard />}
      />

      <Chapter
        id="vault"
        kicker="02 · Seat vault"
        title="The seat owns a wallet. You don’t own a key."
        body="Each founding seat is a NEP-171 deed over a keyless sub-account. Zero access keys. BTC and SOL tip addresses stay put when the seat sells — control flips, continuity doesn’t."
        asset={<SeatDeedCard />}
        reverse
      />

      <Chapter
        id="sale"
        kicker="03 · Mid-payout"
        title="Sell while the cut is still pending."
        body="Ada lists. Priya buys mid-payout. Pending ticket money rebounds to the buyer in one breath. Old owner keeps nothing — no key, no dime, no held signature."
        asset={<OwnershipFlipCard />}
      />

      <Chapter
        id="lab"
        kicker="04 · Transfer Lab"
        title="Then we attack the sale."
        body="Old owner withdraw. Listed drain. Held-sig raw sign. Wash flag. Expected fails with live explorer receipts — the product is the refusal."
        asset={<FailSlipCard />}
        reverse
      />

      <Chapter
        id="clean"
        kicker="05 · Diligence"
        title="PROVABLY CLEAN before you buy."
        body="Keys empty. Continuity stable. Pending rebound. Epoch freeze. Wash clear. Stamp it, then open the Member Room."
        asset={<DiligenceStampCard />}
      />

      <section className="chapter finale">
        <ParallaxLayer progress={stageProgress} from={40} to={-20}>
          <h2>Run the night.</h2>
          <p className="story-lede">
            Load demo night, buy a ticket, flip Seat #3 mid-payout, fail the lab, read /verify.
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
        </ParallaxLayer>
        <div className="finale-assets">
          <TiltCard>
            <SeatDeedCard owner="priya.near" epoch={2} />
          </TiltCard>
          <TiltCard>
            <DiligenceStampCard />
          </TiltCard>
          <TiltCard>
            <FailSlipCard title="Held-sig refuse" reason="epoch freeze while listed" />
          </TiltCard>
        </div>
      </section>

      <div className="story-panel-wrap">
        <TestnetPanel />
      </div>
    </div>
  );
}
