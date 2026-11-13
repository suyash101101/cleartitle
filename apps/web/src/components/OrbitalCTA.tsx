"use client";

import Link from "next/link";

/** Orbit rings with headline centered between them; CTA + meta below. */
export function OrbitalCTA() {
  return (
    <section className="orbital-cta" aria-label="Start with Nearnight">
      <div className="orbital-stage">
        <div className="orbital-ellipse outer" aria-hidden />
        <div className="orbital-ellipse mid" aria-hidden />
        <div className="orbital-ellipse tilted" aria-hidden />
        <div className="orbital-axis" aria-hidden />
        <span className="orbit-dot o1" aria-hidden />
        <span className="orbit-dot o2" aria-hidden />
        <span className="orbit-dot o3" aria-hidden />
        <h2 className="orbital-title">Own every future cut</h2>
      </div>
      <div className="orbital-copy">
        <Link className="btn" href="/console">
          Open Club Console
        </Link>
      </div>
      <p className="meta orbital-meta">
        Live FastNear proofs. Pending cuts follow the buyer.
      </p>
    </section>
  );
}
