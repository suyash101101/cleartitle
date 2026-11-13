"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";
import {
  motion,
  motionValue,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { HomeActions } from "@/components/HomeActions";
import { TestnetPanel } from "@/components/TestnetPanel";
import { MouseField } from "@/components/MouseField";
import { TiltCard } from "@/components/TiltCard";
import {
  DiligenceStampCard,
  FailSlipCard,
  NightTicketCard,
  OwnershipFlipCard,
  SeatDeedCard,
} from "@/components/assets/StoryAssets";

const Scene3D = dynamic(
  () => import("@/components/Scene3D").then((m) => m.Scene3D),
  {
    ssr: false,
    loading: () => <div className="scene3d scene3d-fallback" aria-hidden />,
  },
);

const idleProgress = motionValue(0);

const BEATS = [
  {
    id: "ticket",
    kicker: "01 · Box office",
    title: "A ticket hits the door.",
    body: "Nearnight sells a ticket. One payment. On-chain split into treasury and five founding seat vaults — a receipt, not a spreadsheet.",
  },
  {
    id: "vault",
    kicker: "02 · Seat vault",
    title: "The seat owns a wallet. You don’t own a key.",
    body: "NEP-171 deed over a keyless sub-account. Zero access keys. BTC and SOL tips stay put when the seat sells — control flips, continuity doesn’t.",
  },
  {
    id: "sale",
    kicker: "03 · Mid-payout",
    title: "Sell while the cut is still pending.",
    body: "Ada lists. Priya buys mid-payout. Pending ticket money rebounds to the buyer. Old owner keeps nothing — no key, no dime, no held signature.",
  },
  {
    id: "lab",
    kicker: "04 · Transfer Lab",
    title: "Then we attack the sale.",
    body: "Old owner withdraw. Listed drain. Held-sig raw sign. Expected fails with live explorer receipts — the product is the refusal.",
  },
  {
    id: "clean",
    kicker: "05 · Diligence",
    title: "PROVABLY CLEAN before you buy.",
    body: "Keys empty. Continuity stable. Pending rebound. Epoch freeze. Stamp it, then open the Member Room.",
  },
];

function BeatCopy({
  beat,
  index,
  progress,
}: {
  beat: (typeof BEATS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index / BEATS.length;
  const end = (index + 1) / BEATS.length;
  const opacity = useTransform(progress, [start, start + 0.08, end - 0.06, end], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, start + 0.1, end], [36, 0, -28]);
  const blur = useTransform(progress, [start, start + 0.1, end - 0.05, end], [8, 0, 0, 6]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div className="pin-copy" style={{ opacity, y, filter }} aria-hidden={false}>
      <p className="chapter-kicker">{beat.kicker}</p>
      <h2>{beat.title}</h2>
      <p>{beat.body}</p>
      <Link className="pin-link" href={index === 3 ? "/lab" : index === 4 ? "/seat/3" : "/box-office"}>
        {index === 3 ? "Open Transfer Lab" : index === 4 ? "Inspect Seat #3" : "Open Box Office"}
      </Link>
    </motion.div>
  );
}

function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, [0, 1], ["0%", "100%"]);
  return (
    <div className="pin-rail" aria-hidden>
      <motion.div className="pin-rail-fill" style={{ width }} />
      <div className="pin-rail-labels">
        {BEATS.map((b) => (
          <span key={b.id}>{b.id}</span>
        ))}
      </div>
    </div>
  );
}

export function StoryJourney() {
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });

  const sceneScale = useTransform(progress, [0, 0.5, 1], [1, 1.08, 0.92]);
  const sceneRotate = useTransform(progress, [0, 1], [0, 12]);
  const heroOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  return (
    <div className="story near-theme">
      <MouseField />

      {/* Intro hero — NEAR-inspired */}
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
            <Link className="btn ghost" href="#journey">
              Enter the story
            </Link>
            <Link className="btn ghost" href="/verify">
              /verify
            </Link>
          </div>
        </div>
        <motion.div className="near-hero-visual" style={{ opacity: heroOpacity }}>
          <Scene3D progress={idleProgress} />
        </motion.div>
      </section>

      {/* Igloo-style pinned scroll journey */}
      <div id="journey" ref={pinRef} className="pin-track">
        <div className="pin-sticky">
          <ProgressRail progress={progress} />
          <div className="pin-stage">
            <div className="pin-copy-stack">
              {BEATS.map((beat, i) => (
                <BeatCopy key={beat.id} beat={beat} index={i} progress={progress} />
              ))}
            </div>
            <motion.div className="pin-scene" style={{ scale: sceneScale, rotateZ: sceneRotate }}>
              <Scene3D progress={progress} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Artifact strip — 3D tilt props after the pin */}
      <section className="artifact-strip">
        <h2>Artifacts from the night</h2>
        <p className="story-lede">Hover — depth responds. These map to live demo routes.</p>
        <div className="artifact-grid">
          <TiltCard>
            <NightTicketCard />
          </TiltCard>
          <TiltCard>
            <SeatDeedCard />
          </TiltCard>
          <TiltCard>
            <OwnershipFlipCard />
          </TiltCard>
          <TiltCard>
            <FailSlipCard />
          </TiltCard>
          <TiltCard>
            <DiligenceStampCard />
          </TiltCard>
        </div>
      </section>

      <section className="chapter finale">
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
          <Link className="btn ghost" href="/lab">
            Transfer Lab
          </Link>
        </div>
        <div className="story-panel-wrap">
          <TestnetPanel />
        </div>
      </section>
    </div>
  );
}
