"use client";

import type { Seat } from "@cleartitle/sdk";

export function SeatCharter({ seat }: { seat: Seat }) {
  const pending = seat.pending.filter(
    (p) => p.status === "PENDING" || p.status === "REBOUND_TO_BUYER",
  ).length;
  return (
    <svg
      viewBox="0 0 420 240"
      width="100%"
      role="img"
      aria-label={`Seat ${seat.tokenId} charter`}
      style={{ display: "block", border: "1px solid var(--line)", background: "#100e0c" }}
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8a317" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#e8a317" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" fill="#100e0c" />
      <rect x="12" y="12" width="396" height="216" fill="url(#g)" stroke="#e8a317" strokeWidth="1.5" />
      <text x="28" y="48" fill="#f4efe6" fontFamily="Georgia, serif" fontSize="28">
        Seat #{seat.tokenId}
      </text>
      <text x="28" y="78" fill="#c9c0b0" fontFamily="system-ui" fontSize="12">
        {seat.vaultAccountId}
      </text>
      <text x="28" y="112" fill="#e8a317" fontFamily="system-ui" fontSize="13" fontWeight="700">
        0 ACCESS KEYS · EPOCH {seat.keyEpoch}
      </text>
      <text x="28" y="140" fill="#f4efe6" fontFamily="system-ui" fontSize="13">
        Owner · {seat.owner}
      </text>
      <text x="28" y="162" fill="#f4efe6" fontFamily="system-ui" fontSize="13">
        Tickets accrued · {seat.ticketsAccrued} · Balance · {seat.balance}
      </text>
      <text x="28" y="184" fill="#f4efe6" fontFamily="system-ui" fontSize="13">
        Encumbrance · {seat.encumbrance} · Pending · {pending}
      </text>
      <text x="28" y="210" fill="#c9b896" fontFamily="ui-monospace, monospace" fontSize="10">
        {seat.continuityHash}
      </text>
    </svg>
  );
}
