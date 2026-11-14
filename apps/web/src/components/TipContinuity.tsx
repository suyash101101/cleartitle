import Link from "next/link";

/** Tip addresses stay continuous across ownership flips — hero Chain Sig beat. */
export function TipContinuity({
  btc = "bc1q…ct3",
  sol = "SoL…ct3",
  beforeBtc,
  beforeSol,
}: {
  btc?: string;
  sol?: string;
  /** Optional pre-sale snapshot — when set, UI proves identical. */
  beforeBtc?: string;
  beforeSol?: string;
}) {
  const sameBtc = !beforeBtc || beforeBtc === btc;
  const sameSol = !beforeSol || beforeSol === sol;
  const continuous = sameBtc && sameSol;

  return (
    <aside className="tip-continuity" aria-label="Cross-chain tip continuity">
      <p className="chapter-kicker">Chain Sig · tip continuity</p>
      <h3>Control flips. Tips do not.</h3>
      <p className="meta" style={{ marginBottom: "0.65rem" }}>
        BTC/SOL tip addresses derive from the vault path. Sale bumps ownership + sign epoch — not
        the tip addresses.
      </p>
      <div className="tip-continuity-grid">
        <div className="tip-cell">
          <p className="meta">BTC tip</p>
          <p className="mono tip-addr" title={btc}>
            {btc}
          </p>
          {beforeBtc && (
            <p className={`meta ${sameBtc ? "pass" : "fail"}`}>
              {sameBtc ? "unchanged vs pre-sale" : "MISMATCH"}
            </p>
          )}
        </div>
        <div className="tip-cell">
          <p className="meta">SOL tip</p>
          <p className="mono tip-addr" title={sol}>
            {sol}
          </p>
          {beforeSol && (
            <p className={`meta ${sameSol ? "pass" : "fail"}`}>
              {sameSol ? "unchanged vs pre-sale" : "MISMATCH"}
            </p>
          )}
        </div>
        <div className="tip-cell tip-cell-note">
          <p className="meta">Across sale</p>
          <strong>{continuous ? "Same addresses" : "Check derive"}</strong>
          <p className="meta">Buyer inherits · seller loses claim · no re-key</p>
        </div>
      </div>
      <Link className="pin-link" href="/title/3">
        See certificate continuity →
      </Link>
    </aside>
  );
}
