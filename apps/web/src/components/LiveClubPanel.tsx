"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CONTRACT_ID, EXPLORER } from "@/lib/near";
import { viewClub, viewSeats, type ChainClub, type ChainSeat } from "@/lib/chainViews";
import { clubIdFromEnv } from "@/lib/client";

function encLabel(raw: string | undefined): string {
  return (raw ?? "FREE").toUpperCase();
}

/** Live club + founding seats from RPC (organizer console). */
export function LiveClubPanel() {
  const [club, setClub] = useState<ChainClub | null>(null);
  const [seats, setSeats] = useState<ChainSeat[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const clubId = clubIdFromEnv();

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const c = await viewClub(clubId);
      setClub(c);
      try {
        const rows = await viewSeats(clubId);
        setSeats(rows);
      } catch {
        // Older deployments without list_seats: fall back empty; inventory still works via get_seat.
        setSeats([]);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
      <div className="panel">
        <h3>
          <span className="badge rpc">Live venue</span> {club?.name ?? CONTRACT_ID}
        </h3>
        {loading && <p className="meta">Reading RPC…</p>}
        {err && (
          <p className="meta" style={{ color: "var(--color-warn)" }}>
            {err}
          </p>
        )}
        {club && (
          <>
            <p className="meta">club_id · {club.club_id ?? clubId ?? "active"}</p>
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
        {!club && !loading && !err && (
          <p className="meta">No venue yet — create one below or set NEXT_PUBLIC_CLUB_ID.</p>
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
              <li key={`${s.club_id ?? ""}-${s.token_id}`}>
                <span className="pass">○</span>
                <span>
                  <Link href={`/seat/${s.token_id}`}>#{s.token_id}</Link>
                  {s.kind ? ` · ${s.kind}` : ""}
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
