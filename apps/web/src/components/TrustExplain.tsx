type SeatLike = {
  accessKeyCount: number;
  washFlagged: boolean;
  openRawSigs: number;
  encumbrance: string;
  continuityHash: string;
  pending: { status: string }[];
};

/** Six named checks — deterministic title facts you can re-run on RPC. */
export function TrustExplain({
  seat,
  verdict,
}: {
  seat: SeatLike;
  verdict: string;
}) {
  const checks = [
    {
      id: "keys",
      label: "Zero access keys",
      detail: "Vault has no live keys a seller can drain after transfer.",
      ok: seat.accessKeyCount === 0,
    },
    {
      id: "wash",
      label: "Wash risk clear",
      detail: "No circular trade flag on the holder chain.",
      ok: !seat.washFlagged,
    },
    {
      id: "sigs",
      label: "No open raw signatures",
      detail: "Held Chain Signatures freeze while listed.",
      ok: seat.openRawSigs === 0,
    },
    {
      id: "enc",
      label: "Encumbrance known",
      detail: `State · ${seat.encumbrance}`,
      ok: seat.encumbrance === "FREE" || seat.encumbrance === "LISTED",
    },
    {
      id: "continuity",
      label: "Tip continuity hash",
      detail: "BTC/SOL tip addresses survive ownership flips.",
      ok: Boolean(seat.continuityHash),
    },
    {
      id: "pending",
      label: "Pending follows buyer",
      detail:
        seat.pending.some((p) => p.status.includes("REBOUND"))
          ? "At least one cut rebounded to the new holder."
          : "No orphaned seller claim path on open cuts.",
      ok:
        seat.pending.length === 0 ||
        seat.pending.every((p) => !p.status.includes("SELLER") || p.status.includes("REBOUND")),
    },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const clean = verdict === "PROVABLY CLEAN" && passed === checks.length;

  return (
    <aside className="trust-explain" aria-label="Explainable title checks">
      <div className="trust-explain-head">
        <p className="chapter-kicker">Explainable diligence</p>
        <p className="trust-explain-count">
          <strong>{passed}</strong>
          <span>/{checks.length}</span>
        </p>
      </div>
      <p className="meta trust-explain-blurb">
        Every check is named — re-run on testnet RPC.
      </p>
      <ol className="trust-explain-list">
        {checks.map((c, i) => (
          <li key={c.id} className={c.ok ? "pass" : "fail"}>
            <span className="trust-explain-idx">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <strong>{c.label}</strong>
              <span className="meta">{c.detail}</span>
            </span>
            <span aria-hidden>{c.ok ? "✓" : "✕"}</span>
          </li>
        ))}
      </ol>
      <p className={`trust-explain-verdict ${clean ? "ok" : "warn"}`}>
        {clean ? "PROVABLY CLEAN · six of six" : `${passed} of ${checks.length} · fix before buy`}
      </p>
    </aside>
  );
}
