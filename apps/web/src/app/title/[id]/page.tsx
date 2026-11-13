"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ContinuityStrip } from "@/components/ContinuityStrip";
import { EarningsLedger } from "@/components/EarningsLedger";
import { EpochBump } from "@/components/EpochBump";
import { KeyZeroStrip } from "@/components/KeyZeroStrip";
import { TitleChain } from "@/components/TitleChain";
import { TitleScore } from "@/components/TitleScore";
import { TrustExplain } from "@/components/TrustExplain";
import { WarrantyStrip } from "@/components/WarrantyStrip";
import { WashRisk } from "@/components/WashRisk";
import { BRAND } from "@/lib/brand";
import { useApp } from "@/lib/store";

/** Shareable quitclaim certificate — judges can screenshot this alone. */
export default function TitleCertificatePage() {
  const params = useParams();
  const id = String(params.id ?? "3");
  const world = useApp((s) => s.world);
  const diligence = useApp((s) => s.diligence);
  const doDiligence = useApp((s) => s.doDiligence);
  const [copied, setCopied] = useState(false);
  const seat = world.seats[id];
  const report = diligence?.tokenId === id ? diligence : null;

  useEffect(() => {
    if (seat) doDiligence(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, Boolean(seat)]);

  if (!seat) {
    return (
      <section className="section" style={{ borderTop: "none" }}>
        <h2>Certificate unavailable</h2>
        <p className="lede">Seed Nearnight from Club Console, then reopen.</p>
        <Link className="btn" href="/console">
          Club Console
        </Link>
      </section>
    );
  }

  const verdict = report?.verdict ?? (seat.washFlagged ? "FIX BEFORE BUY" : "PROVABLY CLEAN");
  const clean = verdict === "PROVABLY CLEAN" && !seat.washFlagged && seat.accessKeyCount === 0;

  const copyCertificate = () => {
    const text = [
      `${BRAND} · Seat #${seat.tokenId} · ${seat.kind}`,
      `owner ${seat.owner} · epoch ${seat.keyEpoch}`,
      `verdict ${verdict}`,
      `keys ${seat.accessKeyCount} · wash ${seat.washFlagged ? "FLAGGED" : "clean"}`,
      `continuity ${seat.continuityHash}`,
      `vault ${seat.vaultAccountId}`,
    ].join("\n");
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <section className="section cert-page" style={{ borderTop: "none", paddingTop: 0 }}>
      <p className="chapter-kicker">NEP-171 · Quitclaim Deed</p>

      <div className="cert-sheet">
        <div className="cert-sheet-top">
          <div className="cert-sheet-identity">
            <h1 className="cert-title">Seat #{seat.tokenId}</h1>
            <p className="cert-kind">{seat.kind}</p>
            <p className="meta mono cert-vault">{seat.vaultAccountId}</p>
            <p className="cert-status">
              {seat.accessKeyCount} KEYS · {seat.encumbrance} · EPOCH {seat.keyEpoch}
            </p>
            <p className="meta">Owner · {seat.owner}</p>
            <p className="meta">
              Tickets · {seat.pending.length} · Balance · {seat.balance} · {seat.encumbrance}
              {seat.pending.length ? ` · pending ${seat.pending.length}` : ""}
            </p>
            <p className="cert-continuity mono">continuity · {seat.continuityHash}</p>
          </div>
          <div className={`stamp ${clean ? "clean" : "fix"}`}>{verdict}</div>
        </div>

        <ul className="cert-facts">
          <li>
            <span>Access keys</span>
            <strong className={seat.accessKeyCount === 0 ? "pass" : "fail"}>{seat.accessKeyCount}</strong>
          </li>
          <li>
            <span>Encumbrance</span>
            <strong>{seat.encumbrance}</strong>
          </li>
          <li>
            <span>Open raw sigs</span>
            <strong>{seat.openRawSigs}</strong>
          </li>
          <li>
            <span>Wash</span>
            <strong className={seat.washFlagged ? "fail" : "pass"}>
              {seat.washFlagged ? "FLAGGED" : "clean"}
            </strong>
          </li>
          <li>
            <span>BTC tip</span>
            <strong className="mono cert-tip">{seat.btcAddress}</strong>
          </li>
          <li>
            <span>SOL tip</span>
            <strong className="mono cert-tip">{seat.solAddress}</strong>
          </li>
        </ul>
      </div>

      <div className="desk-grid">
        <div className="desk-cell">
          <TitleScore seat={seat} verdict={verdict} />
        </div>
        <div className="desk-cell desk-span-8 desk-trust">
          <TrustExplain seat={seat} verdict={verdict} />
          <div className="title-inline-actions">
            <button type="button" className="ghost" onClick={() => doDiligence(id)}>
              Refresh diligence
            </button>
            <button type="button" className="ghost" onClick={copyCertificate}>
              {copied ? "Copied" : "Copy certificate"}
            </button>
            <Link className="btn" href={`/seat/${id}`}>
              Open seat desk
            </Link>
            <Link className="btn ghost" href="/lab">
              Transfer Lab
            </Link>
          </div>
        </div>

        <div className="desk-cell">
          <WashRisk
            washFlagged={seat.washFlagged}
            holderCount={Math.max(1, seat.holderHistory.length)}
            openRawSigs={seat.openRawSigs}
          />
        </div>
        <div className="desk-cell">
          <KeyZeroStrip />
        </div>
        <div className="desk-cell">
          <WarrantyStrip />
        </div>

        <div className="desk-cell">
          <EpochBump />
        </div>
        <div className="desk-cell desk-span-8">
          <TitleChain seat={seat} />
        </div>

        <div className="desk-cell desk-span-12">
          <ContinuityStrip seat={seat} />
        </div>
      </div>

      <div className="desk-grid desk-grid-tail">
        <div className="desk-cell desk-span-12">
          <EarningsLedger seat={seat} />
        </div>
      </div>

      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
