"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deriveSeatAddresses, type DerivedAddresses } from "@/lib/chainsig";

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
    <div className="panel" style={{ marginTop: "1.25rem" }}>
      <h3>Chain Signatures continuity</h3>
      <p className="meta">
        Live derive from vault <span className="mono">{vaultAccountId}</span> via{" "}
        <span className="mono">v1.signer-prod.testnet</span>. Addresses stay stable across seat sales.
      </p>
      <p className="meta">
        <span className="badge ok">Shipped · derive</span>{" "}
        <span className="badge">Roadmap · MPC tip spend</span>
      </p>
      {loading && <p className="meta">Deriving…</p>}
      {err && (
        <p className="meta" style={{ color: "var(--color-warn)" }}>
          {err}
        </p>
      )}
      {addr && (
        <>
          <p className="meta mono" style={{ marginTop: "0.75rem" }}>
            BTC ({addr.pathBtc}) · {addr.btc}
          </p>
          <p className="meta mono">SOL ({addr.pathSol}) · {addr.sol}</p>
          <span className="badge ok">STABLE ACROSS SALE</span>
        </>
      )}
      <p className="meta" style={{ marginTop: "0.75rem" }}>
        <Link href="/scale">Why continuity matters on the scale path</Link>
      </p>
    </div>
  );
}
