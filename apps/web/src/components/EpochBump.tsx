import Link from "next/link";

/** Epoch bump kills held raw signatures — escrow never shows this refuse. */
export function EpochBump() {
  return (
    <aside className="epoch-bump" aria-label="Epoch bump freeze">
      <p className="chapter-kicker">Held-sig freeze</p>
      <h3>List bumps the epoch. Held raw signs die.</h3>
      <p className="meta">
        While LISTED, Chain Signature raw sign is refused. On buy_seat the epoch advances again so
        any stale held sig from the seller is useless. Escrow demos never stamp this refuse.
      </p>
      <Link className="pin-link" href="/lab">
        Run held-sig attack →
      </Link>
    </aside>
  );
}
