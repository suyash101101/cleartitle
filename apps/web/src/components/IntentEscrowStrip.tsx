import Link from "next/link";

/** Multi-chain payment rails ≠ NEAR-native seat title. */
export function IntentEscrowStrip() {
  return (
    <aside className="warranty-strip" aria-label="Payment rails versus NEAR title">
      <p className="chapter-kicker">Payment vs seat title</p>
      <div className="warranty-strip-grid">
        <div>
          <p className="meta">Cross-chain escrow path</p>
          <strong>Swap → hold → release</strong>
          <p className="meta">
            Funds a door-fee hold. Operator key still decides claims; seat vault never clears.
          </p>
        </div>
        <div className="ours">
          <p className="meta">QuietTitle</p>
          <strong>NEAR-native clear title</strong>
          <p className="meta">
            One chain for vault, refuse, and rebound. Pending cuts rebind on buy_seat — no escrow timer.
          </p>
        </div>
      </div>
      <Link className="pin-link" href="/verify">
        See claim clock ∞ →
      </Link>
    </aside>
  );
}
