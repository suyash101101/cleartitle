"use client";

type SeatLike = {
  accessKeyCount: number;
  washFlagged: boolean;
  openRawSigs: number;
  encumbrance: string;
  owner: string;
  continuityHash?: string;
};

/** Live title-clarity score — one-ups marketplaces that only show current owner. */
export function TitleScore({
  seat,
  verdict,
}: {
  seat: SeatLike;
  verdict: string;
}) {
  const keysOk = seat.accessKeyCount === 0;
  const washOk = !seat.washFlagged;
  const sigsOk = seat.openRawSigs === 0;
  const encOk = seat.encumbrance === "FREE" || seat.encumbrance === "LISTED";
  const continuityOk = Boolean(seat.continuityHash);
  const cleanVerdict = verdict === "PROVABLY CLEAN";

  const checks = [
    { label: "0 access keys", ok: keysOk, weight: 24 },
    { label: "Wash clean", ok: washOk, weight: 18 },
    { label: "No open raw sigs", ok: sigsOk, weight: 16 },
    { label: "Encumbrance known", ok: encOk, weight: 14 },
    { label: "Tip continuity", ok: continuityOk, weight: 14 },
    { label: "Diligence stamp", ok: cleanVerdict, weight: 14 },
  ];

  const score = checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0);
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 55 ? "C" : "F";
  const tone = score >= 90 ? "clean" : score >= 75 ? "signal" : "warn";

  return (
    <aside className={`title-score title-score-${tone}`} aria-label="Title clarity score">
      <div className="title-score-head">
        <p className="chapter-kicker">Title clarity</p>
        <div className="title-score-mark">
          <strong className="title-score-num">{score}</strong>
          <span className="title-score-grade">{grade}</span>
        </div>
      </div>
      <p className="meta title-score-blurb">
        Six named title facts before you bid — deterministic, re-runnable on testnet RPC.
      </p>
      <ul className="title-score-checks">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? "pass" : "fail"}>
            <span aria-hidden>{c.ok ? "✓" : "✕"}</span>
            {c.label}
            <em>{c.weight}</em>
          </li>
        ))}
      </ul>
      <p className="meta mono">owner · {seat.owner}</p>
    </aside>
  );
}
