"use client";

import { useCallback, useEffect, useState } from "react";
import { seatBuyNonce, viewDiligence, viewSeat, type ChainSeat } from "@/lib/chainViews";

/** Live chain strip for seat desk. Source of truth when productMode is live. */
export function LiveChainBanner({ tokenId }: { tokenId: string }) {
  const [seat, setSeat] = useState<ChainSeat | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [s, d] = await Promise.all([viewSeat(tokenId), viewDiligence(tokenId)]);
      setSeat(s);
      setVerdict(d.verdict);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="panel" aria-label="Live chain seat state" style={{ marginBottom: "1rem" }}>
      <div className="live-diligence-head">
        <p className="chapter-kicker">Live chain · seat #{tokenId}</p>
        {verdict && (
          <span className={`badge ${verdict.includes("CLEAN") ? "ok" : "warn"}`}>{verdict}</span>
        )}
      </div>
      {loading && <p className="meta">Reading RPC…</p>}
      {err && (
        <p className="meta" style={{ color: "var(--color-warn)" }}>
          {err}
        </p>
      )}
      {seat && (
        <p className="meta">
          owner · <strong>{seat.owner_id}</strong>
          {" · "}
          {(seat.encumbrance ?? "FREE").toString().toUpperCase()}
          {" · "}
          keys · {seat.access_key_count ?? 0}
          {" · "}
          nonce · {seatBuyNonce(seat)}
          {seat.listing_ask != null && seat.listing_ask !== "" ? ` · ask · ${seat.listing_ask}` : ""}
        </p>
      )}
      <button type="button" className="ghost" style={{ marginTop: "0.5rem" }} onClick={() => void refresh()}>
        Refresh chain
      </button>
    </div>
  );
}
