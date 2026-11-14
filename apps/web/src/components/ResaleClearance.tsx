import Link from "next/link";

/** Oveit / WICKET / GET Protocol cap resale price. We clear title while cuts fly. */
export function ResaleClearance() {
  return (
    <aside className="price-ceiling" aria-label="Resale caps versus clear title">
      <p className="chapter-kicker">Oveit · WICKET · GET vs CleanDeed</p>
      <div className="price-ceiling-grid">
        <div>
          <p className="meta">Oveit / WICKET / GET</p>
          <strong>Price caps + resale limits</strong>
          <p className="meta">Ceilings and flip counts keep door tickets fair. Sticker control, not vault title.</p>
        </div>
        <div className="ours">
          <p className="meta">CleanDeed</p>
          <strong>Clear title mid-payout</strong>
          <p className="meta">0 keys · held-sig freeze · CLEAN gate · pending rebound. Cap the sticker or clear the vault.</p>
        </div>
      </div>
      <Link className="pin-link" href="/lab">
        Run mid-payout fail path →
      </Link>
    </aside>
  );
}
