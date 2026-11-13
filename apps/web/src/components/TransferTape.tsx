import Link from "next/link";

/** Visual ownership tape — show the rebound moment, not just the owner flip. */
const BEATS = [
  { t: "T0", label: "Ada holds", detail: "pending cut in flight · FREE" },
  { t: "T1", label: "List @ 100", detail: "FREEZE · held-sig locked · wash check" },
  { t: "T2", label: "CLEAN stamp", detail: "TitleScore 6/6 · buy unlocked" },
  { t: "T3", label: "Priya buys", detail: "REBOUND_TO_BUYER · epoch bump" },
  { t: "T4", label: "Ada recall", detail: "EXPECTED FAIL · explorer receipt" },
];

export function TransferTape() {
  return (
    <aside className="transfer-tape" aria-label="Ownership transfer tape">
      <p className="chapter-kicker">Transfer tape</p>
      <h3>Owner flips. Pending follows. Recall dies.</h3>
      <ol className="transfer-tape-list">
        {BEATS.map((b) => (
          <li key={b.t}>
            <span className="transfer-tape-t">{b.t}</span>
            <span className="transfer-tape-label">{b.label}</span>
            <span className="transfer-tape-detail meta">{b.detail}</span>
          </li>
        ))}
      </ol>
      <Link className="pin-link" href="/seat/3">
        Run this tape live →
      </Link>
    </aside>
  );
}
