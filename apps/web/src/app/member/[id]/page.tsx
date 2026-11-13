"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SessionBar } from "@/components/SessionBar";
import { TitleScore } from "@/components/TitleScore";
import { OffChainRoyalty } from "@/components/OffChainRoyalty";
import { WarrantyStrip } from "@/components/WarrantyStrip";
import { WedgeBadge } from "@/components/WedgeBadge";
import { PageHeader } from "@/components/ui/page-header";
import { viewMethod } from "@/lib/near";
import { useWallet } from "@/lib/wallet";
import { useApp } from "@/lib/store";

type SeatView = {
  token_id: string;
  owner_id: string;
  encumbrance: string;
};

export default function MemberRoomPage() {
  const params = useParams();
  const id = String(params.id ?? "3");
  const world = useApp((s) => s.world);
  const actor = useApp((s) => s.actor);
  const setActor = useApp((s) => s.setActor);
  const doClaim = useApp((s) => s.doClaim);
  const doList = useApp((s) => s.doList);
  const seat = world.seats[id];
  const { accountId } = useWallet();

  const [rpcOwner, setRpcOwner] = useState<string | null>(null);
  const [rpcErr, setRpcErr] = useState<string | null>(null);
  const [rpcLoading, setRpcLoading] = useState(true);

  const refreshOwner = useCallback(async () => {
    setRpcLoading(true);
    setRpcErr(null);
    const hardStop = window.setTimeout(() => {
      setRpcLoading(false);
      setRpcErr((prev) => prev ?? "RPC slow · retry Refresh");
    }, 9000);
    try {
      const s = await viewMethod<SeatView | null>("get_seat", { token_id: id });
      setRpcOwner(s?.owner_id ?? null);
      if (!s?.owner_id) setRpcErr("RPC returned no owner for this seat");
    } catch (e) {
      setRpcOwner(null);
      setRpcErr(e instanceof Error ? e.message : String(e));
    } finally {
      window.clearTimeout(hardStop);
      setRpcLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refreshOwner();
  }, [refreshOwner]);

  if (!seat) {
    return (
      <section className="section" style={{ borderTop: "none" }}>
        <h2>Member Room</h2>
        <p className="lede">Seat missing. Seed Nearnight from Club Console.</p>
      </section>
    );
  }

  const scenarioMatchesRpc = Boolean(rpcOwner && actor === rpcOwner);
  const walletMatchesRpc = Boolean(rpcOwner && accountId && accountId === rpcOwner);
  const unlocked = scenarioMatchesRpc || walletMatchesRpc;
  const engineReady = actor === seat.owner;

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title={`Member Room · Seat #${id}`}
        lede="Gated by on-chain owner_id from FastNear RPC. Scenario cast must match to unlock."
      />
      <WedgeBadge />
      <WarrantyStrip />
      <OffChainRoyalty />
      <SessionBar />

      <div className="panel owner-gate" style={{ marginBottom: "1.25rem" }}>
        <div className="owner-gate-head">
          <span className="badge rpc">Live owner check</span>
          <button type="button" className="ghost live-rail-refresh" onClick={() => void refreshOwner()} disabled={rpcLoading}>
            {rpcLoading ? "Reading…" : "Refresh RPC"}
          </button>
        </div>
        {rpcErr && (
          <p className="meta" style={{ color: "var(--color-warn)", marginTop: "0.65rem" }}>
            {rpcErr}
          </p>
        )}
        <dl className="owner-gate-grid">
          <div className={scenarioMatchesRpc ? "match" : "mismatch"}>
            <dt>Scenario actor</dt>
            <dd className="mono">{actor}</dd>
          </div>
          <div className={rpcOwner ? (scenarioMatchesRpc ? "match" : "mismatch") : undefined}>
            <dt>RPC owner · get_seat</dt>
            <dd className="mono">{rpcLoading ? "…" : (rpcOwner ?? "—")}</dd>
          </div>
          <div className={walletMatchesRpc ? "match" : undefined}>
            <dt>Connected wallet</dt>
            <dd className="mono">{accountId ?? "not connected"}</dd>
          </div>
        </dl>
        <p className="meta" style={{ marginTop: "0.75rem" }}>
          Scenario engine owner for seat #{id}: <strong className="mono">{seat.owner}</strong>
          {engineReady ? " · in sync with cast" : " · actions need matching cast"}
        </p>
        {!unlocked && rpcOwner && actor !== rpcOwner && (
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <button type="button" onClick={() => setActor(rpcOwner)}>
              Set scenario to RPC owner
            </button>
          </div>
        )}
      </div>

      {unlocked ? (
        <div className="member-unlocked-grid">
          <div className="panel">
            <span className="badge ok">UNLOCKED</span>
            <p style={{ marginTop: "1rem", fontSize: "1.15rem" }}>
              {walletMatchesRpc && !scenarioMatchesRpc
                ? "Wallet matches on-chain owner. Connect scenario cast for engine actions."
                : `Scenario ${actor} matches RPC owner for seat #${id}.`}
            </p>
            <p className="meta" style={{ marginTop: "0.5rem" }}>
              Continuity {seat.continuityHash} · epoch {seat.keyEpoch} · {seat.encumbrance}
            </p>
            <div className="cta-row" style={{ marginTop: "1rem" }}>
              <button type="button" onClick={() => doClaim(id)} disabled={!engineReady || seat.encumbrance !== "FREE"}>
                Claim payout
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => doList(id, 100)}
                disabled={!engineReady || seat.encumbrance !== "FREE"}
              >
                List seat @ 100
              </button>
              <Link className="btn ghost" href={`/title/${id}`}>
                Certificate
              </Link>
            </div>
            {!engineReady && (
              <div style={{ marginTop: "0.85rem" }}>
                <p className="meta" style={{ color: "var(--color-warn)" }}>
                  Room unlocked via live RPC owner. Engine actions still need cast = {seat.owner}.
                </p>
                <div className="cta-row" style={{ marginTop: "0.55rem" }}>
                  <button type="button" className="ghost" onClick={() => setActor(seat.owner)}>
                    Align cast to engine owner
                  </button>
                  <Link className="btn ghost" href="/console">
                    Club Console judge path
                  </Link>
                </div>
              </div>
            )}
          </div>
          <TitleScore
            seat={seat}
            verdict={seat.washFlagged || seat.accessKeyCount > 0 ? "FIX BEFORE BUY" : "PROVABLY CLEAN"}
          />
        </div>
      ) : (
        <div className="member-unlocked-grid">
          <div className="panel">
            <span className="badge warn">LOCKED</span>
            <p style={{ marginTop: "1rem", fontSize: "1.15rem" }}>
              Member controls stay hidden until scenario actor matches the RPC owner
              {rpcOwner ? (
                <>
                  {" "}
                  (<strong className="mono">{rpcOwner}</strong>).
                </>
              ) : (
                "."
              )}
            </p>
            <p className="meta" style={{ marginTop: "0.5rem" }}>
              Or connect a testnet wallet that holds this seat NFT. Seats (#34) gates a vault vote —
              we gate the earning seat with live owner_id.
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <Link className="btn ghost" href={`/title/${id}`}>
                View title certificate
              </Link>
              <Link className="btn ghost" href="/lab">
                Transfer Lab
              </Link>
            </div>
          </div>
          <TitleScore
            seat={seat}
            verdict={seat.washFlagged || seat.accessKeyCount > 0 ? "FIX BEFORE BUY" : "PROVABLY CLEAN"}
          />
        </div>
      )}
      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
