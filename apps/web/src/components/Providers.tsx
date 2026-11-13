"use client";

import { useEffect, type ReactNode } from "react";
import { hydrateJudgeFromSession, hydrateProductMode } from "@/lib/store";
import { WalletProvider } from "@/lib/wallet";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrateProductMode();
    hydrateJudgeFromSession();
  }, []);

  return <WalletProvider>{children}</WalletProvider>;
}
