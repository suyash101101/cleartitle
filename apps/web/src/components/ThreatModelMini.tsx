import Link from "next/link";

/** Compact threat model for judges who skip /verify. */
const THREATS = [
  { fail: true, title: "Old owner withdraw", detail: "0 keys · owner check · epoch bump" },
  { fail: true, title: "Listed drain", detail: "Encumbrance freeze · withdraw refused" },
  { fail: true, title: "Held raw sig", detail: "Epoch freeze while LISTED" },
  { fail: false, title: "Mid-payout buy", detail: "Pending REBOUND_TO_BUYER" },
];

export function ThreatModelMini() {
  return (
    <aside className="threat-mini" aria-label="Compact threat model">
      <p className="chapter-kicker">Threat model · 10s</p>
      <ul className="threat-mini-list">
        {THREATS.map((t) => (
          <li key={t.title}>
            <span className={t.fail ? "fail" : "pass"} aria-hidden>
              {t.fail ? "✕" : "✓"}
            </span>
            <span>
              <strong>{t.title}</strong>
              <span className="meta"> · {t.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <Link className="pin-link" href="/verify">
        Full receipts + claims →
      </Link>
    </aside>
  );
}
