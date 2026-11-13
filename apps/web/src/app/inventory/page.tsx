"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionBar } from "@/components/SessionBar";
import { TicketRoll3D } from "@/components/TicketRoll3D";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { PageHeader } from "@/components/ui/page-header";
import { FlaskConical, ShieldCheck, Ticket } from "lucide-react";
import { CONTRACT_ID, EXPLORER, viewMethod } from "@/lib/near";
import { useApp } from "@/lib/store";
import { SEAT_KINDS } from "@/sdk";
import type { RollTicket } from "@/components/TicketRoll";

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
  if (typeof e === "string") return e.toUpperCase();
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
    let alive = true;
    setLoading(true);
    setErr(null);
    const ids = ["1", "2", "3", "4", "5"];
    const hardStop = window.setTimeout(() => {
      if (!alive) return;
      setLoading(false);
      setErr((prev) => prev ?? "RPC slow · showing cast seats below");
    }, 9000);

    void (async () => {
      const loaded: SeatView[] = [];
      await Promise.all(
        ids.map(async (token_id) => {
          try {
            const s = await viewMethod<SeatView | null>("get_seat", { token_id });
            if (!alive || !s) return;
            const row = { ...s, token_id: s.token_id ?? token_id };
            loaded.push(row);
            setLive([...loaded].sort((a, b) => Number(a.token_id) - Number(b.token_id)));
          } catch {
            /* soft fail */
          }
        }),
      );
      if (!alive) return;
      window.clearTimeout(hardStop);
      setLoading(false);
      if (loaded.length === 0) setErr("No seats returned from RPC");
    })();

    return () => {
      alive = false;
      window.clearTimeout(hardStop);
    };
  }, []);

  const filmSeats = Object.values(world.seats);
  const rollTickets: RollTicket[] = filmSeats.map((s) => {
    const kind = SEAT_KINDS[Number(s.tokenId) - 1] ?? SEAT_KINDS[0]!;
    return {
      id: s.tokenId,
      tier: kind.label,
      owner: s.owner,
      keys: s.accessKeyCount ?? 0,
      status: s.encumbrance === "FREE" ? undefined : String(s.encumbrance),
    };
  });

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Seat inventory"
        lede="Tear NEP-171 seat deeds from the roll. Cast seats load instantly. Live deeds stream from FastNear."
      />
      <SessionBar />

      <BentoGrid className="page-bento">
        <BentoCard
          name="Transfer Lab"
          Icon={FlaskConical}
          description="Seller recall · listed drain · held-sig refuses."
          href="/lab"
          cta="Open Lab"
        />
        <BentoCard
          name="Seat #3 cert"
          Icon={ShieldCheck}
          description="Quitclaim deed · PROVABLY CLEAN."
          href="/title/3"
          cta="Open cert"
        />
        <BentoCard
          name="Box office"
          Icon={Ticket}
          description="Buy a ticket · cuts hit vaults."
          href="/box-office"
          cta="Buy"
        />
      </BentoGrid>

      <TicketRoll3D tickets={rollTickets.length ? rollTickets : undefined} mode="display" />

      <h3 className="inv-heading">
        <span className="badge rpc">Live path</span> Cast seats
      </h3>
      <BentoGrid className="inv-bento">
        {filmSeats.map((s) => {
          const kind = SEAT_KINDS[Number(s.tokenId) - 1] ?? SEAT_KINDS[0]!;
          return (
            <Link key={s.tokenId} href={`/seat/${s.tokenId}`} className="bento-card inv-bento-card">
              <div className="bento-card-body">
                <p className="chapter-kicker">{kind.label}</p>
                <h3>Seat #{s.tokenId}</h3>
                <p className="meta mono">{s.owner}</p>
                <p className="meta">
                  {s.encumbrance} · pending {s.pending.length} · balance {s.balance}
                </p>
                <span className="bento-card-cta">Open desk</span>
              </div>
            </Link>
          );
        })}
      </BentoGrid>

      <h3 className="inv-heading" style={{ marginTop: "2rem" }}>
        <span className="badge rpc">Testnet RPC</span> On-chain · {CONTRACT_ID}
      </h3>
      {loading && <p className="meta">Streaming get_seat…</p>}
      {err && (
        <p className="meta" style={{ color: "var(--color-warn)" }}>
          {err}
        </p>
      )}
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
                {encLabel(s.encumbrance)} · {s.seat_bps} bps ·{" "}
                <span className={s.access_key_count === 0 ? "pass" : "fail"}>
                  {s.access_key_count} keys
                </span>
              </p>
              <div className="inv-tile-links">
                <Link href={`/title/${s.token_id}`}>certificate</Link>
                <a
                  className="mono"
                  href={`${EXPLORER}/accounts/${s.vault_account_id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  vault
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
