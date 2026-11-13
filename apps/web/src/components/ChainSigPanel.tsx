"use client";

import { useEffect, useState } from "react";
import { deriveSeatAddresses, type DerivedAddresses } from "@/lib/chainsig";
import { BorderBeam } from "@/components/magicui/border-beam";
import { BlurFade } from "@/components/magicui/blur-fade";

export function ChainSigPanel({ vaultAccountId }: { vaultAccountId: string }) {
  const [addr, setAddr] = useState<DerivedAddresses | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    void deriveSeatAddresses(vaultAccountId)
      .then((d) => {
        if (!cancelled) setAddr(d);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vaultAccountId]);

  return (
    <BlurFade delay={0.05}>
      <div className="panel" style={{ marginTop: "1.25rem" }}>
        <BorderBeam duration={13} size={65} colorFrom="#1B6EF3" colorTo="#0C8C6E" />
        <h3>Chain Signatures continuity</h3>
        <p className="meta">
          Derived from vault <span className="mono">{vaultAccountId}</span> via{" "}
          <span className="mono">v1.signer-prod.testnet</span> — unchanged across seat sales.
        </p>
        {loading && <p className="meta">Deriving…</p>}
        {err && <p className="meta" style={{ color: "var(--color-warn)" }}>{err}</p>}
        {addr && (
          <>
            <p className="meta mono" style={{ marginTop: "0.75rem" }}>
              BTC ({addr.pathBtc}) · {addr.btc}
            </p>
            <p className="meta mono">SOL ({addr.pathSol}) · {addr.sol}</p>
            <span className="badge ok">STABLE ACROSS SALE</span>
          </>
        )}
      </div>
    </BlurFade>
  );
}
