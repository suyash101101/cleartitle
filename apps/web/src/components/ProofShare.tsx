"use client";

import { useState } from "react";
import Link from "next/link";

/** One-click judge packet — shareable QuietTitle wedge. */
export function ProofShare({
  seatId = "3",
  verdict = "PROVABLY CLEAN",
}: {
  seatId?: string;
  verdict?: string;
}) {
  const [copied, setCopied] = useState(false);
  const packet = [
    `QuietTitle · Seat #${seatId}`,
    `verdict · ${verdict}`,
    `wedge · mid-payout rebound · 0 keys · claim clock ∞`,
    `prove · /title/${seatId} · /lab · /verify`,
  ].join("\n");

  return (
    <aside className="proof-share" aria-label="Judge proof packet">
      <p className="chapter-kicker">Judge packet</p>
      <h3>Copy the wedge in one breath.</h3>
      <pre className="proof-share-body mono">{packet}</pre>
      <div className="proof-share-ctas">
        <button
          type="button"
          className="ghost"
          onClick={() => {
            void navigator.clipboard?.writeText(packet).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? "Copied" : "Copy packet"}
        </button>
        <Link className="pin-link" href={`/title/${seatId}`}>
          Open certificate
        </Link>
        <Link className="pin-link" href="/verify">
          /verify matrix
        </Link>
      </div>
    </aside>
  );
}
