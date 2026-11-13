"use client";

import { useEffect, type ReactNode } from "react";
import { hydrateJudgeFromSession } from "@/lib/store";
import { WalletProvider } from "@/lib/wallet";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrateJudgeFromSession();
  }, []);

  return <WalletProvider>{children}</WalletProvider>;
}
