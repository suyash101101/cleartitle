"use client";

import { useEffect, useState } from "react";
import { CONTRACT_ID, EXPLORER, viewMethod } from "@/lib/near";

type Club = {
  name: string;
  tickets_sold: number;
  treasury_balance: number;
  organizer: string;
};

type Diligence = {
  verdict: string;
  checks: { id: string; pass: boolean; detail: string }[];
};

export function TestnetPanel() {
  const [club, setClub] = useState<Club | null>(null);
  const [diligence, setDiligence] = useState<Diligence | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const c = await viewMethod<Club>("get_club", {});
      const d = await viewMethod<Diligence>("diligence", { token_id: "3" });
      setClub(c);
      setDiligence(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="panel" style={{ marginTop: "1.5rem" }}>
      <h3>Live testnet</h3>
      <p className="meta mono">
        {CONTRACT_ID} ·{" "}
        <a href={`${EXPLORER}/accounts/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
          explorer
        </a>
      </p>
      <button type="button" className="ghost" onClick={refresh} disabled={loading} style={{ marginTop: "0.75rem" }}>
        {loading ? "Reading…" : "Refresh RPC"}
      </button>
      {err && <p className="meta" style={{ color: "var(--err)" }}>{err}</p>}
      {club && (
        <p className="meta" style={{ marginTop: "0.75rem" }}>
          {club.name} · tickets sold {club.tickets_sold} · treasury {club.treasury_balance} · organizer{" "}
          {club.organizer}
        </p>
      )}
      {diligence && (
        <p style={{ marginTop: "0.5rem" }}>
          Seat #3 · <span className={`badge ${diligence.verdict.includes("CLEAN") ? "ok" : "warn"}`}>{diligence.verdict}</span>
        </p>
      )}
    </div>
  );
}
