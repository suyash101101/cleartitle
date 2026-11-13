"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export function HomeActions() {
  const resetDemo = useApp((s) => s.resetDemo);
  const runMidPayoutScenario = useApp((s) => s.runMidPayoutScenario);
  const router = useRouter();
  return (
    <div className="cta-row">
      <button
        type="button"
        onClick={() => {
          resetDemo();
          router.push("/seat/3");
        }}
      >
        Start demo night
      </button>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          runMidPayoutScenario();
          router.push("/lab");
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
