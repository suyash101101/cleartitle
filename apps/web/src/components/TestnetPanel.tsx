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

export function TestnetPanel() {
  const [club, setClub] = useState<Club | null>(null);
  const [diligence, setDiligence] = useState<Diligence | null>(null);
  const [seats, setSeats] = useState<SeatView[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);

  const refresh = useCallback(async () => {
    setSeatsLoading(true);
    setMetaLoading(true);
    setErr(null);
    const seatPromise = loadSeats()
      .then((rows) => {
        setSeats(rows);
        if (rows.length === 0) setErr((prev) => prev ?? "No seats from get_seat on RPC");
      })
      .catch((e) => {
        setSeats([]);
        setErr(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setSeatsLoading(false));

    void Promise.all([
      seatPromise,
      viewMethod<Club>("get_club", {})
        .then(setClub)
        .catch(() => setClub(null))
        .finally(() => {}),
      viewMethod<Diligence>("diligence", { token_id: "3" })
        .then(setDiligence)
        .catch(() => setDiligence(null)),
    ]).finally(() => setMetaLoading(false));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const showChips = seats.length > 0 || seatsLoading;

  return (
    <div className="live-rail">
      <div className="live-rail-head">
        <span className="badge rpc">Testnet RPC</span>
        <a className="mono meta" href={`${EXPLORER}/accounts/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
          {CONTRACT_ID}
        </a>
        <button
          type="button"
          className="ghost live-rail-refresh"
          onClick={() => void refresh()}
          disabled={seatsLoading || metaLoading}
        >
          {seatsLoading || metaLoading ? "Reading…" : "Refresh"}
        </button>
        <Link className="live-rail-link" href="/inventory">
          All seat NFTs →
        </Link>
      </div>
      {err && <p className="meta" style={{ color: "var(--color-warn)" }}>{err}</p>}
      {club && (
        <p className="meta live-rail-stats">
          {club.name} · sold {club.tickets_sold} · treasury {club.treasury_balance} · organizer {club.organizer}
          {diligence ? (
            <>
              {" "}
              · Seat #3{" "}
              <span className={`badge ${diligence.verdict.includes("CLEAN") ? "ok" : "warn"}`}>
                {diligence.verdict}
              </span>
            </>
          ) : null}
        </p>
      )}
      {showChips && (
        <div className="nft-chip-row" aria-label="Live seat NFTs" aria-busy={seatsLoading}>
          {seatsLoading && seats.length === 0
            ? SEAT_IDS.map((tid) => (
                <span key={tid} className="nft-chip nft-chip-skeleton" aria-hidden>
                  <strong>#{tid}</strong>
                  <span className="mono">get_seat…</span>
                </span>
              ))
            : seats.map((s) => (
                <Link key={s.token_id} href={`/seat/${s.token_id}`} className="nft-chip">
                  <strong>#{s.token_id}</strong>
                  <span className="mono">{s.owner_id}</span>
                  <span className="badge ok">{s.access_key_count} keys</span>
                </Link>
              ))}
        </div>
      )}
    </div>
  );
}
