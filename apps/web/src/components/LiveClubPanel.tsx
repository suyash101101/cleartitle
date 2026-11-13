"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CONTRACT_ID, EXPLORER } from "@/lib/near";
import { viewClub, viewSeat, type ChainClub, type ChainSeat } from "@/lib/chainViews";

const SEAT_IDS = ["1", "2", "3", "4", "5"];

function encLabel(raw: string | undefined): string {
  return (raw ?? "FREE").toUpperCase();
}

/** Live club + founding seats from RPC (organizer console). */
export function LiveClubPanel() {
  const [club, setClub] = useState<ChainClub | null>(null);
  const [seats, setSeats] = useState<ChainSeat[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const c = await viewClub();
      setClub(c);
      const rows = await Promise.all(
        SEAT_IDS.map(async (id) => {
          try {
            return await viewSeat(id);
          } catch {
            return null;
          }
        }),
      );
      setSeats(rows.filter((s): s is ChainSeat => Boolean(s)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
      <div className="panel">
        <h3>
          <span className="badge rpc">Live club</span> {club?.name ?? CONTRACT_ID}
        </h3>
        {loading && <p className="meta">Reading RPC…</p>}
        {err && (
          <p className="meta" style={{ color: "var(--color-warn)" }}>
            {err}
          </p>
        )}
        {club && (
          <>
            <p className="meta">organizer · {club.organizer ?? "—"}</p>
            <p className="meta">ticket · {String(club.ticket_price ?? "—")}</p>
            <p className="meta">treasury · {String(club.treasury_balance ?? "—")}</p>
            <p className="meta">tickets sold · {club.tickets_sold ?? 0}</p>
            <p style={{ marginTop: "0.75rem" }}>
              <span className={`badge ${club.paused ? "warn" : "ok"}`}>
                {club.paused ? "PAUSED" : "LIVE"}
              </span>{" "}
              <a href={`${EXPLORER}/accounts/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
                Explorer
              </a>
            </p>
          </>
        )}
        <div className="cta-row" style={{ marginTop: "0.85rem" }}>
          <button type="button" className="ghost" onClick={() => void refresh()}>
            Refresh
          </button>
          <Link className="btn" href="/box-office">
            Box office
          </Link>
        </div>
      </div>
      <div className="panel">
        <h3>Founding seats (chain)</h3>
        {seats.length === 0 ? (
          <p className="meta">{loading ? "Loading…" : "No seats returned."}</p>
        ) : (
          <ul className="checklist">
            {seats.map((s) => (
              <li key={s.token_id}>
                <span className="pass">○</span>
                <span>
                  <Link href={`/seat/${s.token_id}`}>#{s.token_id}</Link>
                  {" · "}
                  {s.owner_id}
                  {" · "}
                  <span className="badge">{encLabel(s.encumbrance)}</span>
                  {" · "}
                  <span className="badge ok">{s.access_key_count ?? 0} keys</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="meta" style={{ marginTop: "0.75rem" }}>
          Bound via <span className="mono">NEXT_PUBLIC_CONTRACT_ID</span> → {CONTRACT_ID}
        </p>
      </div>
    </div>
  );
}
