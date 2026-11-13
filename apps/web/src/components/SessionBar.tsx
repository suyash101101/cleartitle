"use client";

import { ActorBar } from "@/components/ActorBar";
import { WalletBar } from "@/components/WalletBar";

/** Wallet + scenario cast — no divider hairlines. */
export function SessionBar() {
  return (
    <div className="session-bar">
      <WalletBar />
      <ActorBar />
    </div>
  );
}
