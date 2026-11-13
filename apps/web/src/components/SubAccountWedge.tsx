import Link from "next/link";

/** NFT-as-account track: we are the title insurance layer on the earning vault. */
export function SubAccountWedge() {
  return (
    <aside className="price-ceiling" aria-label="NFT as account versus clear title">
      <p className="chapter-kicker">NFTs that do something</p>
      <div className="price-ceiling-grid">
        <div>
          <p className="meta">Generic track ask</p>
          <strong>NFT owns a sub-account</strong>
          <p className="meta">Mint · earn · transfer. Most demos stop at “owner flipped.”</p>
        </div>
        <div className="ours">
          <p className="meta">QuitClaim</p>
          <strong>Title insurance on transfer</strong>
          <p className="meta">
            Mid-payout rebound · 0 keys · held-sig freeze · CLEAN gate · Lab EXPECTED FAIL with
            explorer receipts.
          </p>
        </div>
      </div>
      <Link className="pin-link" href="/lab">
        Prove the refuse paths →
      </Link>
    </aside>
  );
}
