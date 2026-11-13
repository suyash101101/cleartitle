"use client";

import { useCallback, useEffect, useState } from "react";
import { viewDiligence, type ChainDiligence } from "@/lib/chainViews";

export function LiveDiligence({
  tokenId,
  refreshKey = 0,
}: {
  tokenId: string;
  /** Bump after a signed tx so RPC re-reads nonce / encumbrance. */
  refreshKey?: number;
}) {
  const [data, setData] = useState<ChainDiligence | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = await viewDiligence(tokenId);
      setData(d);
    } catch (e) {
      setData(null);
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setErr(null);
      try {
        const d = await viewDiligence(tokenId);
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setErr(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenId, refreshKey]);

  return (
    <div className="live-diligence">
      <div className="live-diligence-head">
        <p className="meta">Seat #{tokenId} · RPC</p>
        {data && (
          <span className={`badge ${data.verdict.includes("CLEAN") ? "ok" : "warn"}`}>{data.verdict}</span>
        )}
      </div>
      <button type="button" className="ghost desk-btn-block" disabled={loading} onClick={() => void load()}>
        {loading ? "Reading RPC…" : "Re-read diligence"}
      </button>
      {err && (
        <p className="meta" style={{ color: "var(--color-warn)" }}>
          {err}
        </p>
      )}
      {data && (
        <ul className="checklist">
          {data.checks.map((c) => (
            <li key={c.id}>
              <span className={c.pass ? "pass" : "fail"}>{c.pass ? "✓" : "✕"}</span>
              <span>
                <strong>{c.label ?? c.id}</strong>
                <br />
                <span className="meta">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
