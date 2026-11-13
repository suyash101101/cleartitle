"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export type StoryBeat = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  asset: ReactNode;
  reverse?: boolean;
};

/** Full-viewport chapter panels: normal vertical scroll drives sideways motion. */
export function StoryHorizScroll({ beats }: { beats: StoryBeat[] }) {
  const pin = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: pin,
    offset: ["start start", "end end"],
  });
  const n = Math.max(1, beats.length);
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${((n - 1) / n) * 100}%`]);

  return (
    <section
      ref={pin}
      className="story-pin"
      style={{ height: `${n * 100}vh` }}
      aria-label="Product story"
    >
      <div className="story-pin-sticky">
        <motion.div
          className="story-pin-track"
          style={{ x, width: `${n * 100}%` }}
        >
          {beats.map((c, i) => (
            <article
              key={c.id}
              id={c.id}
              className={`story-pin-panel ${c.reverse ? "reverse" : ""}`}
              style={{ width: `${100 / n}%` }}
            >
              <div className="story-pin-inner">
                <div className="chapter-copy">
                  <p className="chapter-kicker">{c.kicker}</p>
                  <h2>{c.title}</h2>
                  <p>{c.body}</p>
                  <Link className="pin-link" href={c.href}>
                    {c.cta}
                  </Link>
                </div>
                <div className="chapter-asset">{c.asset}</div>
                <span className="story-pin-num mono">{String(i + 1).padStart(2, "0")}</span>
              </div>
            </article>
          ))}
        </motion.div>
        <div className="story-pin-progress" aria-hidden>
          <motion.span style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}
