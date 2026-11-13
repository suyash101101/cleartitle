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
        style={{
          display: "block",
          borderRadius: "0.65rem",
          background: "#0e1216",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0091FD" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#C8FF3D" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect width="420" height="240" fill="#0e1216" />
        <rect x="12" y="12" width="396" height="216" fill="url(#g)" stroke="#5EB8FF" strokeOpacity="0.35" strokeWidth="1" />
        <text x="28" y="48" fill="#FFFFFF" fontFamily="var(--font-brand), sans-serif" fontSize="28" fontWeight="600">
          Seat #{seat.tokenId}
        </text>
        <text x="28" y="78" fill="#8FB0BF" fontFamily="var(--font-sans), system-ui" fontSize="12">
          {seat.vaultAccountId}
        </text>
        <text x="28" y="112" fill="#C8FF3D" fontFamily="var(--font-sans), system-ui" fontSize="13" fontWeight="700">
          0 ACCESS KEYS · {seat.kind.toUpperCase()} · EPOCH {seat.keyEpoch}
        </text>
        <text x="28" y="140" fill="#FFFFFF" fontFamily="var(--font-sans), system-ui" fontSize="13">
          Owner · {seat.owner}
        </text>
        <text x="28" y="162" fill="#FFFFFF" fontFamily="var(--font-sans), system-ui" fontSize="13">
          Tickets accrued · {seat.ticketsAccrued} · Balance · {seat.balance}
        </text>
        <text x="28" y="184" fill="#FFFFFF" fontFamily="var(--font-sans), system-ui" fontSize="13">
          Encumbrance · {seat.encumbrance} · Pending · {pending}
        </text>
        <text x="28" y="210" fill="#64748B" fontFamily="var(--font-code), monospace" fontSize="10">
          {seat.continuityHash}
        </text>
      </svg>
  );
}
