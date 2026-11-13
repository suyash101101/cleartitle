"use client";

import Link from "next/link";

/** Orbit stage on top; copy + meta sit cleanly underneath. */
export function OrbitalCTA() {
  return (
    <section className="orbital-cta" aria-label="Start with Nearnight">
      <div className="orbital-stage" aria-hidden>
        <div className="orbital-ellipse outer" />
        <div className="orbital-ellipse mid" />
        <div className="orbital-ellipse tilted" />
        <div className="orbital-axis" />
        <span className="orbit-dot o1" />
        <span className="orbit-dot o2" />
        <span className="orbit-dot o3" />
      </div>
      <div className="orbital-copy">
        <h2>Own every future cut</h2>
        <Link className="btn" href="/console">
          Start Judge Run
        </Link>
      </div>
      <p className="meta orbital-meta">
        Live FastNear proofs. Pending cuts follow the buyer.
      </p>
    </section>
  );
}
