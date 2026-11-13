import Link from "next/link";

/** Visual 90-second judge path — mirrors console manual path. */
const STEPS = [
  { n: "01", label: "Load", href: "/console", cta: "Club Console" },
  { n: "02", label: "List + CLEAN", href: "/seat/3", cta: "Seat #3" },
  { n: "03", label: "Buy mid-payout", href: "/seat/3", cta: "Rebound" },
  { n: "04", label: "Attack FAIL", href: "/lab", cta: "Transfer Lab" },
  { n: "05", label: "Prove", href: "/verify", cta: "/verify" },
];

export function NinetySecondPath() {
  return (
    <aside className="ninety-path" aria-label="Ninety second judge path">
      <p className="chapter-kicker">90-second path</p>
      <ol className="ninety-path-list">
        {STEPS.map((s) => (
          <li key={s.n}>
            <span className="ninety-path-n">{s.n}</span>
            <span className="ninety-path-label">{s.label}</span>
            <Link className="pin-link" href={s.href}>
              {s.cta}
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
