"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export function HomeActions() {
  const router = useRouter();
  const resetDemo = useApp((s) => s.resetDemo);
  const runMidPayoutScenario = useApp((s) => s.runMidPayoutScenario);
  return (
    <div className="cta-row">
      <button
        type="button"
        onClick={() => {
          resetDemo();
          router.push("/seat/3");
        }}
      >
        Open Seat #3
      </button>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          runMidPayoutScenario();
          router.push("/lab");
        }}
      >
        Prove seller recall fails
      </button>
      <Link className="btn ghost" href="/inventory">
        All seat NFTs
      </Link>
    </div>
  );
}
