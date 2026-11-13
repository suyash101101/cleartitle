import Link from "next/link";

/** GUTS / rotating QR stop screenshot tickets. We stop seller recall of the earning seat. */
export function DynamicQrStrip() {
  return (
    <aside className="warranty-strip" aria-label="Rotating QR versus clear title">
      <p className="chapter-kicker">GUTS · rotating QR vs QuitClaim</p>
      <div className="warranty-strip-grid">
        <div>
          <p className="meta">Door anti-clone</p>
          <strong>Dynamic / NFC codes</strong>
          <p className="meta">Kills barcode screenshots at entry. Solves counterfeit tickets — not mid-payout vault ownership.</p>
        </div>
        <div className="ours">
          <p className="meta">Title anti-recall</p>
          <strong>EXPECTED FAIL receipts</strong>
          <p className="meta">Old owner withdraw + held raw sign fail on explorer. Door QR never scores keys, wash, or pending.</p>
        </div>
      </div>
      <Link className="pin-link" href="/lab">
        Seller-recall attack →
      </Link>
    </aside>
  );
}
