"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";

export function HomeActions() {
  const resetDemo = useApp((s) => s.resetDemo);
  const runMidPayoutScenario = useApp((s) => s.runMidPayoutScenario);
  return (
    <div className="cta-row">
      <button
        type="button"
        onClick={() => {
          resetDemo();
          window.location.assign("/seat/3");
        }}
      >
        Start demo night
      </button>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          runMidPayoutScenario();
          window.location.assign("/lab");
        }}
      >
        Play mid-payout attack
      </button>
      <Link className="btn ghost" href="/verify">
        /verify
      </Link>
    </div>
  );
}
