import Link from "next/link";

/** Tip addresses stay continuous across ownership flips. */
export function TipContinuity({
  btc = "bc1q…ct3",
  sol = "SoL…ct3",
}: {
  btc?: string;
  sol?: string;
}) {
  return (
    <aside className="tip-continuity" aria-label="Cross-chain tip continuity">
      <p className="chapter-kicker">Cross-chain tips</p>
      <h3>Control flips. Tips do not.</h3>
      <div className="tip-continuity-grid">
        <div className="tip-cell">
          <p className="meta">BTC tip</p>
          <p className="mono tip-addr" title={btc}>
            {btc}
          </p>
        </div>
        <div className="tip-cell">
          <p className="meta">SOL tip</p>
          <p className="mono tip-addr" title={sol}>
            {sol}
          </p>
        </div>
        <div className="tip-cell tip-cell-note">
          <p className="meta">Across sale</p>
          <strong>Same addresses</strong>
          <p className="meta">Buyer inherits · seller loses claim · no re-key</p>
        </div>
      </div>
      <Link className="pin-link" href="/title/3">
        See certificate continuity →
      </Link>
    </aside>
  );
}
