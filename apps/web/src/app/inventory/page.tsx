"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionBar } from "@/components/SessionBar";
import { PageHeader } from "@/components/ui/page-header";
import { CONTRACT_ID, EXPLORER, viewMethod } from "@/lib/near";
import { useApp } from "@/lib/store";
import { SEAT_KINDS } from "@/sdk";

type SeatView = {
  token_id: string;
  owner_id: string;
  vault_account_id: string;
  encumbrance: string | { Free?: unknown; Listed?: unknown; Settling?: unknown };
  seat_bps: number;
  access_key_count: number;
  wash_flagged: boolean;
  continuity_hash: string;
  listing_ask: string | number | null;
};

function encLabel(e: SeatView["encumbrance"]): string {
  if (typeof e === "string") return e;
  if (e && typeof e === "object") {
    if ("Free" in e || "FREE" in e) return "FREE";
    if ("Listed" in e || "LISTED" in e) return "LISTED";
    if ("Settling" in e || "SETTLING" in e) return "SETTLING";
  }
  return "UNKNOWN";
}

export default function InventoryPage() {
  const world = useApp((s) => s.world);
  const [live, setLive] = useState<SeatView[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const ids = ["1", "2", "3", "4", "5"];
        const loaded: SeatView[] = [];
        for (const token_id of ids) {
          try {
            const s = await viewMethod<SeatView | null>("get_seat", { token_id });
            if (s) loaded.push({ ...s, token_id: s.token_id ?? token_id });
          } catch {
            /* skip missing */
          }
        }
        if (!cancelled) {
          setLive(loaded);
          if (loaded.length === 0) setErr("No seats returned from RPC");
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filmSeats = Object.values(world.seats);

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Seat inventory"
        lede="Testnet NEP-171 deeds from RPC, plus scenario seats for mid-payout storytelling."
      />
      <SessionBar />

      <h3 className="inv-heading">
        <span className="badge rpc">Testnet RPC</span> On-chain NFTs · {CONTRACT_ID}
      </h3>
      {loading && <p className="meta">Reading get_seat…</p>}
      {err && <p className="meta" style={{ color: "var(--color-warn)" }}>{err}</p>}
      <div className="inv-grid">
        {live.map((s) => {
          const kind = SEAT_KINDS[Number(s.token_id) - 1] ?? SEAT_KINDS[0]!;
          return (
            <div key={s.token_id} className="inv-tile">
              <p className="chapter-kicker">{kind.label}</p>
              <h3>
                <Link href={`/seat/${s.token_id}`}>Seat #{s.token_id}</Link>
              </h3>
              <p className="meta mono">{s.owner_id}</p>
              <p className="meta">
                {encLabel(s.encumbrance)} · {s.seat_bps} bps · {s.access_key_count} keys
              </p>
              <p className="meta mute">{kind.blurb}</p>
              <a
                className="mono meta"
                href={`${EXPLORER}/accounts/${s.vault_account_id}`}
                target="_blank"
                rel="noreferrer"
              >
                vault
              </a>
            </div>
          );
        })}
      </div>

      <h3 className="inv-heading" style={{ marginTop: "2rem" }}>
        <span className="badge scenario">Scenario engine</span> Cast seats
      </h3>
      <div className="inv-grid">
        {filmSeats.map((s) => {
          const kind = SEAT_KINDS[Number(s.tokenId) - 1] ?? SEAT_KINDS[0]!;
          return (
            <Link key={s.tokenId} href={`/seat/${s.tokenId}`} className="inv-tile film">
              <p className="chapter-kicker">{kind.label} · scenario</p>
              <h3>Seat #{s.tokenId}</h3>
              <p className="meta mono">{s.owner}</p>
              <p className="meta">
                {s.encumbrance} · pending {s.pending.length} · balance {s.balance}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
