"use client";

import { ActorBar } from "@/components/ActorBar";
import { WalletBar } from "@/components/WalletBar";
import { useApp } from "@/lib/store";

/** Wallet always; scenario cast only in Preview. */
export function SessionBar() {
  const productMode = useApp((s) => s.productMode);
  return (
    <div className="session-bar">
      <WalletBar />
      {productMode === "preview" && <ActorBar />}
    </div>
  );
}
