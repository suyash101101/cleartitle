"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChainSigPanel } from "@/components/ChainSigPanel";
import { LiveDiligence } from "@/components/LiveDiligence";
import { SeatCharter } from "@/components/SeatCharter";
import { JudgeStampPanel } from "@/components/JudgeStampPanel";
import { SessionBar } from "@/components/SessionBar";
import { ContinuityStrip } from "@/components/ContinuityStrip";
import { EarningsLedger } from "@/components/EarningsLedger";
import { PendingFollow } from "@/components/PendingFollow";
import { TitleChain } from "@/components/TitleChain";
import { TitleScore } from "@/components/TitleScore";
import { EpochBump } from "@/components/EpochBump";
import { TipContinuity } from "@/components/TipContinuity";
import { TransferTape } from "@/components/TransferTape";
import { TrustExplain } from "@/components/TrustExplain";
import { WedgeBadge } from "@/components/WedgeBadge";
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
        <p className="lede">Seed Nearnight from Club Console.</p>
      </section>
    );
  }

  const isOwner = actor === seat.owner;
  const report = diligence?.tokenId === id ? diligence : null;
  const clean =
    report?.verdict === "PROVABLY CLEAN" &&
    !seat.washFlagged &&
    seat.accessKeyCount === 0;
  const pendingTotal = seat.pending.reduce((sum, p) => sum + p.amount, 0);
  const buyLocked = seat.encumbrance === "LISTED" && !isOwner && !clean;

  return (
    <section className="section seat-desk" style={{ borderTop: "none", paddingTop: 0 }}>
      <p className="chapter-kicker">Seat desk · Nearnight</p>
      <div className="seat-desk-head">
        <h1 className="page-title">Seat #{seat.tokenId}</h1>
        <div className="seat-desk-chips">
          <span className="badge ok">0 keys</span>
          <span className="badge">{seat.kind}</span>
          <span className="badge">{seat.encumbrance}</span>
        </div>
      </div>
      <p className="lede">
        {seat.vaultAccountId} · owner {seat.owner} · epoch {seat.keyEpoch}
      </p>
      <WedgeBadge />
      <SessionBar />

      <div className="seat-grid">
        <div className="seat-charter-wrap">
          <SeatCharter seat={seat} />
        </div>

        <div className="panel seat-cell">
          <h3>Transfer tape</h3>
          <TransferTape />
        </div>

        <div className="panel seat-cell seat-cell-wide">
          <h3>Live diligence</h3>
          <p className="meta">Six named checks before buy unlocks.</p>
          <JudgeStampPanel />
          <LiveDiligence tokenId={id} />
        </div>

        <div className="panel seat-cell">
          <h3>Charter details</h3>
          <p className="meta">tickets accrued · {seat.ticketsAccrued}</p>
          <p className="meta">vault balance · {seat.balance}</p>
          <p className="meta">seat bps · {seat.seatBps}</p>
          <p className="meta mono">BTC · {seat.btcAddress}</p>
          <p className="meta mono">SOL · {seat.solAddress}</p>
          <p className="meta mono">continuity · {seat.continuityHash}</p>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
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
              <button
                type="button"
                onClick={() => doBuySeat(id)}
                disabled={buyLocked}
                title={buyLocked ? "Run diligence — buy unlocks on PROVABLY CLEAN" : undefined}
              >
                {buyLocked ? "Buy locked · run diligence" : "Buy mid-payout"}
              </button>
            )}
            {buyLocked && (
              <button type="button" className="ghost" onClick={() => doDiligence(id)}>
                Unlock with diligence
              </button>
            )}
            <Link className="btn ghost" href={`/member/${id}`}>
              Member Room
            </Link>
            <Link className="btn ghost" href={`/title/${id}`}>
              Title certificate
            </Link>
          </div>
        </div>

        <div className="panel seat-cell">
          <h3>Diligence packet</h3>
          <button type="button" className="ghost" onClick={() => doDiligence(id)}>
            Run diligence
          </button>
          {report && (
            <>
              <div
                className={`stamp ${report.verdict === "PROVABLY CLEAN" ? "clean" : "fix"}`}
                style={{ marginTop: "0.85rem" }}
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
      </div>

      <div className="seat-strip-grid">
        <PendingFollow amount={pendingTotal} owner={seat.owner} />
        <TipContinuity btc={seat.btcAddress} sol={seat.solAddress} />
        <ContinuityStrip seat={seat} />
        <EpochBump />
      </div>

      <ChainSigPanel vaultAccountId={`seat-${id}.cleartitle562464.testnet`} />

      <div className="cert-bottom-grid">
        <TitleChain seat={seat} />
        <EarningsLedger seat={seat} />
        <TitleScore
          seat={seat}
          verdict={report?.verdict ?? (seat.washFlagged ? "FIX BEFORE BUY" : "PROVABLY CLEAN")}
        />
        <TrustExplain
          seat={seat}
          verdict={report?.verdict ?? (seat.washFlagged ? "FIX BEFORE BUY" : "PROVABLY CLEAN")}
        />
      </div>

      <div className="grid-2 seat-tail-grid">
        <div className="panel">
          <h3>Pending payouts</h3>
          {seat.pending.length === 0 ? (
            <p className="meta">No pending payouts.</p>
          ) : (
            <ul className="checklist">
              {seat.pending.map((p) => (
                <li key={p.id}>
                  <span className={p.status.includes("REBOUND") ? "pass" : "fail"}>
                    {p.status.includes("REBOUND") ? "✓" : "·"}
                  </span>
                  <span>
                    {p.id} · {p.amount} · <strong>{p.status}</strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h3>Seat history</h3>
          <p className="meta" style={{ marginBottom: "0.65rem" }}>
            Earned · paid · who held it.
          </p>
          <ol className="seat-timeline">
            {seat.ledger
              .slice()
              .reverse()
              .slice(0, 12)
              .map((e, i) => {
                const hot = e.kind === "sale" || e.kind === "claim_pending" || e.kind === "ticket_cut";
                return (
                  <li key={`${e.at}-${i}`} className={hot ? "hot" : undefined}>
                    <span className="seat-timeline-kind">{e.kind}</span>
                    <span className="seat-timeline-body">
                      {e.amount > 0 ? `${e.amount} · ` : ""}
                      {e.note}
                    </span>
                  </li>
                );
              })}
          </ol>
        </div>
      </div>
    </section>
  );
}
