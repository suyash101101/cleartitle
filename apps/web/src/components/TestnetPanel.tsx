"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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

type SeatView = {
  token_id: string;
  owner_id: string;
  vault_account_id: string;
  encumbrance: string;
  seat_bps: number;
  access_key_count: number;
  wash_flagged: boolean;
};

const SEAT_IDS = ["1", "2", "3", "4", "5"];

async function loadSeats(): Promise<SeatView[]> {
  const rows = await Promise.all(
    SEAT_IDS.map(async (token_id) => {
      try {
        const s = await viewMethod<SeatView | null>("get_seat", { token_id });
        return s ? { ...s, token_id: s.token_id ?? token_id } : null;
      } catch {
        return null;
      }
    }),
  );
  return rows.filter((s): s is SeatView => Boolean(s));
}

/** Compact single-row live strip — no sprawling empty cards. */
export function TestnetPanel({ compact = false }: { compact?: boolean }) {
  const [club, setClub] = useState<Club | null>(null);
  const [diligence, setDiligence] = useState<Diligence | null>(null);
  const [seats, setSeats] = useState<SeatView[]>([]);
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
      const [rows, clubView, dil] = await Promise.all([
        loadSeats(),
        viewMethod<Club>("get_club", {}).catch(() => null),
        viewMethod<Diligence>("diligence", { token_id: "3" }).catch(() => null),
      ]);
      setSeats(rows);
      setClub(clubView);
      setDiligence(dil);
      if (rows.length === 0) setErr("No seats from RPC");
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

  const seat3 = seats.find((s) => s.token_id === "3") ?? seats[0];
  const clean = diligence?.verdict?.includes("CLEAN");

  return (
    <div className={`live-rail live-rail-line${compact ? " live-rail-compact" : ""}`}>
      <div className="live-rail-row">
        <span className="badge rpc">Testnet</span>
        <a className="mono live-rail-id" href={`${EXPLORER}/accounts/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
          {CONTRACT_ID}
        </a>
        {club && (
          <span className="live-rail-stat">
            sold {club.tickets_sold} · treasury {club.treasury_balance}
          </span>
        )}
        {diligence && (
          <span className={`badge ${clean ? "ok" : "warn"} live-rail-verdict`}>
            {clean ? "CLEAN" : diligence.verdict}
          </span>
        )}
        {seat3 && (
          <Link href={`/seat/${seat3.token_id}`} className="live-rail-seat mono">
            #{seat3.token_id} · {seat3.owner_id}
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
      {err && <p className="meta live-rail-err">{err}</p>}
    </div>
  );
}
