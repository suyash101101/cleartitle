import Link from "next/link";

/** Payment rails vs NEAR-native seat title. Unshipped rails stay labeled roadmap. */
export function IntentEscrowStrip() {
  return (
    <aside className="warranty-strip" aria-label="Payment rails versus NEAR title">
      <p className="chapter-kicker">Payment vs seat title</p>
      <div className="warranty-strip-grid">
        <div>
          <p className="meta">Roadmap · any-token door fee</p>
          <strong>NEP-141 / intent-routed tickets</strong>
          <p className="meta">
            Not shipped. When it lands, funds still only unlock seat title after NEAR diligence. No fake escrow UI.
          </p>
        </div>
        <div className="ours">
          <p className="meta">Shipped · QuitClaim</p>
          <strong>NEAR-native clear title</strong>
          <p className="meta">
            One chain for vault, refuse, and rebound. Pending cuts rebind on buy_seat. Testnet ticket is yocto stand-in.
          </p>
        </div>
      </div>
      <Link className="pin-link" href="/scale">
        See scale roadmap →
      </Link>
    </aside>
  );
}
