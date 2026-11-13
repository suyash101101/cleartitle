import Link from "next/link";

/** Buyer warranty — we warrant the earning title, not a ticket photo. */
export function WarrantyStrip() {
  return (
    <aside className="warranty-strip" aria-label="Buyer title warranty">
      <p className="chapter-kicker">Buyer warranty</p>
      <div className="warranty-strip-grid">
        <div>
          <p className="meta">Door-ticket certs</p>
          <strong>Photo / QR is real</strong>
          <p className="meta">Checks dupes and fair price — then mints an entry cert.</p>
        </div>
        <div className="ours">
          <p className="meta">What QuietTitle warrants</p>
          <strong>Earning title is clean</strong>
          <p className="meta">0 keys · pending follows you · tip continuity · Lab refuses seller recall.</p>
        </div>
      </div>
      <Link className="pin-link" href="/title/3">
        Open the warranty certificate →
      </Link>
    </aside>
  );
}
