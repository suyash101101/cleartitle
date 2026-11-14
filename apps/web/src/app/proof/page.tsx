"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CONTRACT_ID, EXPLORER } from "@/lib/near";
import { viewClub, viewDiligence, viewSeat, type ChainClub, type ChainDiligence, type ChainSeat } from "@/lib/chainViews";
import { LAB_ATTACKS, ONCHAIN, txUrl } from "@/lib/evidence";
import { VERIFY_CLAIMS } from "@/sdk";

type Packet = {
  generatedAt: string;
  contractId: string;
  club: ChainClub | null;
  seat3: ChainSeat | null;
  diligence: ChainDiligence | null;
  onchain: typeof ONCHAIN;
  labAttacks: typeof LAB_ATTACKS;
  claims: typeof VERIFY_CLAIMS;
};

/** One-click judge proof packet: live RPC + static explorer evidence. */
export default function ProofPage() {
  const [packet, setPacket] = useState<Packet | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [club, seat3, diligence] = await Promise.all([
        viewClub(),
        viewSeat("3"),
        viewDiligence("3"),
      ]);
      setPacket({
        generatedAt: new Date().toISOString(),
        contractId: CONTRACT_ID,
        club,
        seat3,
        diligence,
        onchain: ONCHAIN,
        labAttacks: LAB_ATTACKS,
        claims: VERIFY_CLAIMS,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function download() {
    if (!packet) return;
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cleandeed-proof-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const clean = packet?.diligence?.verdict?.includes("CLEAN");

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Proof packet"
        lede="Live RPC re-read plus explorer-backed evidence hashes. Download the JSON for agent judges."
      />
      <div className="cta-row" style={{ marginBottom: "1.25rem" }}>
        <button type="button" onClick={() => void refresh()} disabled={loading}>
          {loading ? "Reading RPC…" : "Re-read chain"}
        </button>
        <button type="button" className="ghost" onClick={download} disabled={!packet}>
          Download JSON
        </button>
        <Link className="btn ghost" href="/verify">
          Claim matrix
        </Link>
        <Link className="btn ghost" href="/lab">
          Transfer Lab
        </Link>
      </div>
      {err && (
        <p className="meta" style={{ color: "var(--color-warn)" }}>
          {err}
        </p>
      )}
      {packet && (
        <div className="grid-2" style={{ gap: "1.25rem" }}>
          <div className="panel">
            <h3>
              <span className="badge rpc">Live RPC</span> {packet.contractId}
            </h3>
            <p className="meta">generated · {packet.generatedAt}</p>
            <p className="meta">club · {packet.club?.name ?? "—"} · tickets · {packet.club?.tickets_sold ?? 0}</p>
            <p className="meta">
              seat #3 · owner {packet.seat3?.owner_id ?? "—"} · keys {packet.seat3?.access_key_count ?? "—"} ·{" "}
              {(packet.seat3?.encumbrance ?? "—").toString()}
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <span className={`badge ${clean ? "ok" : "warn"}`}>
                {packet.diligence?.verdict ?? "—"}
              </span>{" "}
              <a href={`${EXPLORER}/accounts/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
                Explorer account
              </a>
            </p>
          </div>
          <div className="panel">
            <h3>Explorer evidence</h3>
            <ul className="checklist">
              {LAB_ATTACKS.map((a) => (
                <li key={a.id}>
                  <span className={a.success ? "pass" : "fail"}>{a.success ? "✓" : "✕"}</span>
                  <span>
                    {a.title}
                    <br />
                    <a className="mono meta" href={txUrl(a.tx)} target="_blank" rel="noreferrer">
                      {a.tx.slice(0, 18)}…
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel desk-span-12" style={{ gridColumn: "1 / -1" }}>
            <h3>Claims covered</h3>
            <ul className="checklist">
              {VERIFY_CLAIMS.map((c) => (
                <li key={c.claim}>
                  <span className="pass">✓</span>
                  <span>
                    <strong>{c.claim}</strong>
                    <br />
                    <span className="meta">
                      {c.method} · {c.test}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
