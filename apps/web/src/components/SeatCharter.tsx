"use client";

import type { Seat } from "@/sdk";

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
      style={{ display: "block", border: "1px solid var(--color-line)", borderRadius: "0.4rem", background: "#0f172a" }}
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" fill="#0f172a" />
      <rect x="12" y="12" width="396" height="216" fill="url(#g)" stroke="#334155" strokeWidth="1.5" />
      <text x="28" y="48" fill="#f8fafc" fontFamily="var(--font-brand), Georgia, serif" fontSize="28">
        Seat #{seat.tokenId}
      </text>
      <text x="28" y="78" fill="#94a3b8" fontFamily="var(--font-sans), system-ui" fontSize="12">
        {seat.vaultAccountId}
      </text>
      <text x="28" y="112" fill="#93c5fd" fontFamily="var(--font-sans), system-ui" fontSize="13" fontWeight="700">
        0 ACCESS KEYS · EPOCH {seat.keyEpoch}
      </text>
      <text x="28" y="140" fill="#f8fafc" fontFamily="var(--font-sans), system-ui" fontSize="13">
        Owner · {seat.owner}
      </text>
      <text x="28" y="162" fill="#f8fafc" fontFamily="var(--font-sans), system-ui" fontSize="13">
        Tickets accrued · {seat.ticketsAccrued} · Balance · {seat.balance}
      </text>
      <text x="28" y="184" fill="#f8fafc" fontFamily="var(--font-sans), system-ui" fontSize="13">
        Encumbrance · {seat.encumbrance} · Pending · {pending}
      </text>
      <text x="28" y="210" fill="#64748b" fontFamily="var(--font-code), monospace" fontSize="10">
        {seat.continuityHash}
      </text>
    </svg>
  );
}
