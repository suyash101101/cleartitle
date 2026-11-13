"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ActorBar } from "@/components/ActorBar";
import { ChainSigPanel } from "@/components/ChainSigPanel";
import { SeatCharter } from "@/components/SeatCharter";
import { WalletBar } from "@/components/WalletBar";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { useApp } from "@/lib/store";

export default function SeatPage() {
  const params = useParams();
  const id = String(params.id ?? "3");
  const world = useApp((s) => s.world);
  const diligence = useApp((s) => s.diligence);
  const doDiligence = useApp((s) => s.doDiligence);
  const doClaim = useApp((s) => s.doClaim);
  const doList = useApp((s) => s.doList);
  const doBuySeat = useApp((s) => s.doBuySeat);
  const actor = useApp((s) => s.actor);
  const seat = world.seats[id];

  if (!seat) {
    return (
      <section className="section" style={{ borderTop: "none" }}>
        <h2>Seat not found</h2>
        <p className="lede">Load demo night from Console.</p>
      </section>
    );
  }

  const isOwner = actor === seat.owner;
  const report = diligence?.tokenId === id ? diligence : null;

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <BlurFade>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <h2 style={{ margin: 0 }} className="font-display text-4xl md:text-5xl">
            Seat #{seat.tokenId}
          </h2>
          <span className="badge ok">0 keys</span>
          <span className="badge amber">{seat.encumbrance}</span>
        </div>
        <p className="lede">
          {seat.vaultAccountId} · owner {seat.owner} · epoch {seat.keyEpoch}
        </p>
      </BlurFade>
      <WalletBar />
      <ActorBar />

      <div style={{ marginBottom: "1.25rem" }}>
        <SeatCharter seat={seat} />
      </div>
      <ChainSigPanel vaultAccountId={`seat-${id}.cleartitle562464.testnet`} />

      <div className="grid-2">
        <BlurFade delay={0.08}>
          <div className="panel">
            <h3>Charter details</h3>
            <p className="meta">tickets accrued · {seat.ticketsAccrued}</p>
            <p className="meta">vault balance · {seat.balance}</p>
            <p className="meta">seat bps · {seat.seatBps}</p>
            <p className="meta mono">BTC · {seat.btcAddress}</p>
            <p className="meta mono">SOL · {seat.solAddress}</p>
            <p className="meta mono">continuity · {seat.continuityHash}</p>
            <div className="cta-row" style={{ marginTop: "1rem" }}>
              {isOwner && (
                <>
                  <button type="button" onClick={() => doClaim(id)}>
                    Claim payout
                  </button>
                  <button type="button" className="ghost" onClick={() => doList(id, 100)}>
                    List @ 100
                  </button>
                </>
              )}
              {seat.encumbrance === "LISTED" && !isOwner && (
                <button type="button" onClick={() => doBuySeat(id)}>
                  Buy mid-payout
                </button>
              )}
              <Link className="btn ghost" href={`/member/${id}`}>
                Member Room
              </Link>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.14}>
          <div className="panel">
            <BorderBeam duration={9} size={70} colorFrom="#0C8C6E" colorTo="#1B6EF3" />
            <h3>Diligence Packet</h3>
            <button type="button" className="ghost" onClick={() => doDiligence(id)}>
              Run diligence
            </button>
            {report && (
              <>
                <div
                  className={`stamp ${report.verdict === "PROVABLY CLEAN" ? "clean" : "fix"}`}
                  style={{ marginTop: "1rem" }}
                >
                  {report.verdict}
                </div>
                <ul className="checklist">
                  {report.checks.map((c) => (
                    <li key={c.id}>
                      <span className={c.pass ? "pass" : "fail"}>{c.pass ? "✓" : "✕"}</span>
                      <span>
                        {c.label}
                        <br />
                        <span className="meta">{c.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </BlurFade>
      </div>

      <BlurFade delay={0.18}>
        <div className="panel" style={{ marginTop: "1.25rem" }}>
          <h3>Pending & ledger</h3>
          {seat.pending.length === 0 ? (
            <p className="meta">No pending payouts.</p>
          ) : (
            <ul className="checklist">
              {seat.pending.map((p) => (
                <li key={p.id}>
                  <span className="pass">·</span>
                  <span>
                    {p.id} · {p.amount} · <strong>{p.status}</strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <ul className="checklist">
            {seat.ledger
              .slice()
              .reverse()
              .slice(0, 8)
              .map((e, i) => (
                <li key={i}>
                  <span className="pass">·</span>
                  <span className="meta">
                    {e.kind} · {e.amount} · {e.note}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </BlurFade>
    </section>
  );
}
