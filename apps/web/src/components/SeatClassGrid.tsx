import Link from "next/link";

const CLASSES = [
  { id: "1", tier: "Floor", earn: "1% BPS", vibe: "General admission vault" },
  { id: "2", tier: "Lounge", earn: "1% BPS", vibe: "Bar + soft seating cut" },
  { id: "3", tier: "Suite", earn: "1% BPS", vibe: "Private box · tip rails" },
  { id: "4", tier: "VIP", earn: "1% BPS", vibe: "Front row earning deed" },
  { id: "5", tier: "Press", earn: "1% BPS", vibe: "Media booth vault" },
];

/** Five NEP-171 seat classes — vertical product depth beyond one mid-payout demo. */
export function SeatClassGrid() {
  return (
    <div className="seat-class-grid" aria-label="Seat NFT classes">
      {CLASSES.map((c) => (
        <Link key={c.id} href={`/seat/${c.id}`} className="seat-class-tile">
          <span className="seat-class-id">#{c.id}</span>
          <strong>{c.tier}</strong>
          <span className="meta">{c.vibe}</span>
          <span className="seat-class-earn mono">{c.earn} every ticket</span>
        </Link>
      ))}
    </div>
  );
}
