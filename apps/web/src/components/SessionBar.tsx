"use client";

import { ActorBar } from "@/components/ActorBar";
import { WalletBar } from "@/components/WalletBar";

/** Single stacked control strip so wallet CTA never overlaps scenario cast pills. */
export function SessionBar() {
  return (
    <div className="session-bar">
      <WalletBar />
      <ActorBar />
    </div>
  );
}
