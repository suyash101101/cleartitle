"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CONTRACT_ID, EXPLORER } from "@/lib/near";
import { viewClub, viewDiligence, viewSeats, type ChainClub, type ChainSeat } from "@/lib/chainViews";

/** Compact live strip: club + any seats from chain (no hardcoded token ids). */
export function TestnetPanel({ compact = false }: { compact?: boolean }) {
  const [club, setClub] = useState<ChainClub | null>(null);
  const [diligence, setDiligence] = useState<{ verdict: string } | null>(null);
  const [seats, setSeats] = useState<ChainSeat[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const hardStop = window.setTimeout(() => {
      setLoading(false);
      setErr((prev) => prev ?? "RPC slow · retry");
    }, 7000);

    try {
      const rows = await viewSeats().catch(() => [] as ChainSeat[]);
      const clubView = await viewClub().catch(() => null);
      const focus = rows[0]?.token_id;
      const dil = focus
        ? await viewDiligence(focus).catch(() => null)
        : null;
      setSeats(rows);
      setClub(clubView);
      setDiligence(dil);
      if (rows.length === 0 && !clubView) setErr("No venue on this contract yet");
    } catch (e) {
      setSeats([]);
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      window.clearTimeout(hardStop);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const focus = seats[0];
  const clean = diligence?.verdict?.includes("CLEAN");

  return (
    <div className={`live-rail live-rail-line${compact ? " live-rail-compact" : ""}`}>
      <div className="live-rail-row">
        <span className="badge rpc">Live</span>
        <a className="mono live-rail-id" href={`${EXPLORER}/accounts/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
          {CONTRACT_ID}
        </a>
        {club && (
          <span className="live-rail-stat">
            {club.name ?? club.club_id ?? "venue"} · sold {club.tickets_sold ?? 0} · ticket{" "}
            {String(club.ticket_price ?? "—")}
          </span>
        )}
        {diligence && (
          <span className={`badge ${clean ? "ok" : "warn"} live-rail-verdict`}>
            {clean ? "CLEAN" : diligence.verdict}
          </span>
        )}
        {focus && (
          <Link href={`/seat/${focus.token_id}`} className="live-rail-seat mono">
            #{focus.token_id} · {focus.owner_id}
          </Link>
        )}
        <button
          type="button"
          className="ghost live-rail-refresh"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? "…" : "Refresh"}
        </button>
        <Link className="live-rail-link" href="/inventory">
          Seats →
        </Link>
      </div>
      {err && (
        <p className="meta" style={{ marginTop: "0.35rem", color: "var(--color-warn)" }}>
          {err}
        </p>
      )}
    </div>
  );
}
