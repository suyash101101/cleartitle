import Link from "next/link";

const BEATS = [
  {
    t: "T+0s",
    label: "List mid-payout",
    detail: "Ada FREEZE · pending cut open · diligence CLEAN",
  },
  {
    t: "T+12s",
    label: "Buy seat",
    detail: "Priya · pending REBOUND_TO_BUYER · tip continuity holds",
  },
  {
    t: "T+28s",
    label: "Seller recall",
    detail: "Old owner withdraw · EXPECTED FAIL · explorer receipt",
  },
  {
    t: "T+40s",
    label: "Held-sig attack",
    detail: "Raw Chain Signature while listed · epoch freeze refuse",
  },
  {
    t: "T+55s",
    label: "Prove",
    detail: "/verify claim ↔ tx matrix · TitleScore six of six",
  },
];

/** Judge-facing attack clock — rivals show mint+QR; we show the refuse path. */
export function AttackTimeline() {
  return (
    <aside className="attack-timeline" aria-label="Attack timeline">
      <p className="chapter-kicker">90-second attack clock</p>
      <h3>Every refuse path, in order.</h3>
      <ol className="attack-timeline-list">
        {BEATS.map((b) => (
          <li key={b.t}>
            <span className="attack-timeline-t">{b.t}</span>
            <span>
              <strong>{b.label}</strong>
              <span className="meta">{b.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="attack-timeline-ctas">
        <Link className="pin-link" href="/lab">
          Open Transfer Lab
        </Link>
        <Link className="pin-link" href="/console">
          Judge Run
        </Link>
      </div>
    </aside>
  );
}
