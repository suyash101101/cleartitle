"use client";

import type { Seat } from "@/sdk/types";

/** Tip continuity after sale — door-ticket NFTs never show this. */
export function ContinuityStrip({ seat }: { seat: Seat }) {
  const hops = seat.holderHistory.length;
  const flips = Math.max(0, hops - 1);
  return (
    <aside className="continuity-strip" aria-label="Continuity across sales">
      <p className="chapter-kicker">Continuity across sales</p>
      <div className="continuity-strip-grid">
        <div className="tip-cell">
          <span className="meta">BTC tip</span>
          <strong className="mono tip-addr" title={seat.btcAddress}>
            {seat.btcAddress}
          </strong>
        </div>
        <div className="tip-cell">
          <span className="meta">SOL tip</span>
          <strong className="mono tip-addr" title={seat.solAddress}>
            {seat.solAddress}
          </strong>
        </div>
        <div className="tip-cell">
          <span className="meta">Hash</span>
          <strong className="mono tip-addr" title={seat.continuityHash}>
            {seat.continuityHash}
          </strong>
        </div>
        <div className="tip-cell">
          <span className="meta">Holders</span>
          <strong>{hops}</strong>
        </div>
      </div>
      <p className="meta">
        {`Control flipped ${flips} ${flips === 1 ? "time" : "times"}. Tip paths stayed put.`}
      </p>
    </aside>
  );
}
