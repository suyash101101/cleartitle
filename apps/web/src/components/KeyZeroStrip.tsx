import Link from "next/link";

/** Access-key wipe is the transfer threat most door NFT demos skip. */
export function KeyZeroStrip() {
  return (
    <aside className="key-zero" aria-label="Zero access keys proof">
      <p className="chapter-kicker">Transfer threat · access keys</p>
      <h3>Sell the seat. Keep nothing — including keys.</h3>
      <p className="meta">
        On buy_seat we bump epoch and require access_key_count = 0. Old holder cannot leave a
        lingering full-access key on the vault. Door NFT demos rarely show this refuse path.
      </p>
      <div className="key-zero-ctas">
        <Link className="pin-link" href="/lab">
          Run held-sig refuse →
        </Link>
        <Link className="pin-link" href="/title/3">
          Certificate · 0 keys →
        </Link>
      </div>
    </aside>
  );
}
