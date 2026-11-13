import Link from "next/link";

/** Coldplay/Tixel double-sell story — our Lab refuses the second claim path. */
export function DoubleSellStrip() {
  return (
    <aside className="double-sell" aria-label="Double-sell refusal">
      <p className="chapter-kicker">Why title insurance</p>
      <h3>Share-links got recalled after the money moved.</h3>
      <p className="meta">
        Oct 2024 Ticketek · Coldplay on Tixel — seller double-sold, buyer refunded, night lost.
        QuietTitle: old owner withdraw is EXPECTED FAIL with explorer receipts.
      </p>
      <div className="double-sell-ctas">
        <Link className="pin-link" href="/lab">
          Run seller-recall attack
        </Link>
        <Link className="pin-link" href="/verify">
          See claim matrix
        </Link>
      </div>
    </aside>
  );
}
