"use client";

import { useEffect, useState } from "react";
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

export function TestnetPanel() {
  const [club, setClub] = useState<Club | null>(null);
  const [diligence, setDiligence] = useState<Diligence | null>(null);
  const [seats, setSeats] = useState<SeatView[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const c = await viewMethod<Club>("get_club", {});
      const d = await viewMethod<Diligence>("diligence", { token_id: "3" });
      const ids = ["1", "2", "3", "4", "5"];
      const loaded = await Promise.all(
        ids.map((token_id) => viewMethod<SeatView | null>("nft_token", { token_id })),
      );
      setClub(c);
      setDiligence(d);
      setSeats(loaded.filter((s): s is SeatView => Boolean(s)));
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
    <div className="live-rail">
      <div className="live-rail-head">
        <span className="badge ok">LIVE RPC</span>
        <a className="mono meta" href={`${EXPLORER}/accounts/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
          {CONTRACT_ID}
        </a>
        <button type="button" className="ghost" onClick={refresh} disabled={loading}>
          {loading ? "Reading…" : "Refresh"}
        </button>
        <Link className="pin-link" href="/inventory">
          All seat NFTs
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
      {seats.length > 0 && (
        <div className="nft-chip-row" aria-label="Live seat NFTs">
          {seats.map((s) => (
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
