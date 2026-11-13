"use client";

import type { Seat } from "@/sdk";
import { TiltCard } from "@/components/TiltCard";

export function SeatCharter({ seat }: { seat: Seat }) {
  const pending = seat.pending.filter(
    (p) => p.status === "PENDING" || p.status === "REBOUND_TO_BUYER",
  ).length;
  return (
    <TiltCard>
      <svg
        viewBox="0 0 420 240"
        width="100%"
        role="img"
        aria-label={`Seat ${seat.tokenId} charter`}
        style={{
          display: "block",
          borderRadius: "0.7rem",
          background: "#101722",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        }}
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3EE0C5" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FFB020" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect width="420" height="240" fill="#101722" />
        <rect x="12" y="12" width="396" height="216" fill="url(#g)" stroke="#3EE0C5" strokeOpacity="0.35" strokeWidth="1.5" />
        <text x="28" y="48" fill="#F4EFE6" fontFamily="var(--font-brand), sans-serif" fontSize="28" fontWeight="700">
          Seat #{seat.tokenId}
        </text>
        <text x="28" y="78" fill="#9AA3B5" fontFamily="var(--font-sans), system-ui" fontSize="12">
          {seat.vaultAccountId}
        </text>
        <text x="28" y="112" fill="#3EE0C5" fontFamily="var(--font-sans), system-ui" fontSize="13" fontWeight="700">
          0 ACCESS KEYS · EPOCH {seat.keyEpoch}
        </text>
        <text x="28" y="140" fill="#F4EFE6" fontFamily="var(--font-sans), system-ui" fontSize="13">
          Owner · {seat.owner}
        </text>
        <text x="28" y="162" fill="#F4EFE6" fontFamily="var(--font-sans), system-ui" fontSize="13">
          Tickets accrued · {seat.ticketsAccrued} · Balance · {seat.balance}
        </text>
        <text x="28" y="184" fill="#F4EFE6" fontFamily="var(--font-sans), system-ui" fontSize="13">
          Encumbrance · {seat.encumbrance} · Pending · {pending}
        </text>
        <text x="28" y="210" fill="#64748B" fontFamily="var(--font-code), monospace" fontSize="10">
          {seat.continuityHash}
        </text>
      </svg>
    </TiltCard>
  );
}
