"use client";

/** Visual wash / recall risk — one-up vs marketplaces that hide flip history. */
export function WashRisk({
  washFlagged,
  holderCount = 2,
  openRawSigs = 0,
}: {
  washFlagged: boolean;
  holderCount?: number;
  openRawSigs?: number;
}) {
  const risk = washFlagged ? 88 : openRawSigs > 0 ? 62 : holderCount <= 2 ? 12 : 28;
  const label = washFlagged ? "FLAGGED" : risk > 50 ? "ELEVATED" : "LOW";
  const tone = washFlagged || risk > 50 ? "warn" : "ok";

  return (
    <aside className={`wash-risk wash-risk-${tone}`} aria-label="Wash risk">
      <p className="chapter-kicker">Wash / recall risk</p>
      <div className="wash-risk-head">
        <strong className="wash-risk-num">{risk}</strong>
        <span className={`badge ${tone === "ok" ? "ok" : "warn"}`}>{label}</span>
      </div>
      <div className="wash-risk-bar" aria-hidden>
        <i style={{ width: `${risk}%` }} />
      </div>
      <ul className="wash-risk-facts">
        <li>
          Holders in chain <em>{holderCount}</em>
        </li>
        <li>
          Open raw sigs <em>{openRawSigs}</em>
        </li>
        <li>
          Wash flag <em>{washFlagged ? "ON" : "off"}</em>
        </li>
      </ul>
      <p className="meta">
        Marketplaces stop at current owner. We surface flip density and held-sig residue before you bid.
      </p>
    </aside>
  );
}
