import Link from "next/link";

/** Door NFT royalties die off-platform. Title rules are on-chain refuses. */
export function OffChainRoyalty() {
  return (
    <aside className="warranty-strip" aria-label="Off-chain royalty bypass versus clear title">
      <p className="chapter-kicker">Royalty bypass vs QuitClaim</p>
      <div className="warranty-strip-grid">
        <div>
          <p className="meta">Door NFT royalties</p>
          <strong>Easy to dodge</strong>
          <p className="meta">
            Zero-value on-chain transfer + cash off-chain skips artist % when marketplaces disagree.
          </p>
        </div>
        <div className="ours">
          <p className="meta">QuitClaim refuses</p>
          <strong>On-chain EXPECTED FAIL</strong>
          <p className="meta">
            Old owner withdraw · held-sig · listed drain — explorer receipts, not marketplace policy.
          </p>
        </div>
      </div>
      <Link className="pin-link" href="/lab">
        See refuse receipts →
      </Link>
    </aside>
  );
}
