"use client";

import { useEffect, useState } from "react";
import { viewMethod } from "@/lib/near";

type Diligence = {
  verdict: string;
  checks: { id: string; pass: boolean; detail: string; label?: string }[];
};

export function LiveDiligence({ tokenId }: { tokenId: string }) {
  const [data, setData] = useState<Diligence | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void viewMethod<Diligence>("diligence", { token_id: tokenId })
      .then((d) => {
        if (!cancelled) setData(d);
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
  }, [tokenId]);

  return (
    <div className="panel" style={{ marginTop: "1.25rem" }}>
      <h3>Live diligence · Seat #{tokenId}</h3>
      {loading && <p className="meta">Reading RPC…</p>}
      {err && <p className="meta" style={{ color: "var(--color-warn)" }}>{err}</p>}
      {data && (
        <>
          <p style={{ margin: "0.5rem 0 0.75rem" }}>
            <span className={`badge ${data.verdict.includes("CLEAN") ? "ok" : "warn"}`}>{data.verdict}</span>
          </p>
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
        </>
      )}
    </div>
  );
}
