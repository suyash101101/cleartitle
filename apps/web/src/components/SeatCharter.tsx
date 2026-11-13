"use client";

import { motion } from "framer-motion";
import type { Seat } from "@/sdk";
import { BorderBeam } from "@/components/magicui/border-beam";

export function SeatCharter({ seat }: { seat: Seat }) {
  const pending = seat.pending.filter(
    (p) => p.status === "PENDING" || p.status === "REBOUND_TO_BUYER",
  ).length;
  return (
    <motion.div
      className="relative overflow-hidden rounded-[0.65rem] border border-line bg-[#0A1628] text-fog"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <BorderBeam size={90} duration={10} colorFrom="#1B6EF3" colorTo="#0C8C6E" />
      <svg
        viewBox="0 0 420 240"
        width="100%"
        role="img"
        aria-label={`Seat ${seat.tokenId} charter`}
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1B6EF3" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0C8C6E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="420" height="240" fill="#0A1628" />
        <rect x="12" y="12" width="396" height="216" fill="url(#g)" stroke="#1B6EF3" strokeWidth="1.5" />
        <text x="28" y="48" fill="#EEF2F7" fontFamily="Syne, sans-serif" fontSize="28" fontWeight="700">
          Seat #{seat.tokenId}
        </text>
        <text x="28" y="78" fill="#94A3B8" fontFamily="Figtree, system-ui" fontSize="12">
          {seat.vaultAccountId}
        </text>
        <text x="28" y="112" fill="#60A5FA" fontFamily="Figtree, system-ui" fontSize="13" fontWeight="700">
          0 ACCESS KEYS · EPOCH {seat.keyEpoch}
        </text>
        <text x="28" y="140" fill="#EEF2F7" fontFamily="Figtree, system-ui" fontSize="13">
          Owner · {seat.owner}
        </text>
        <text x="28" y="162" fill="#EEF2F7" fontFamily="Figtree, system-ui" fontSize="13">
          Tickets accrued · {seat.ticketsAccrued} · Balance · {seat.balance}
        </text>
        <text x="28" y="184" fill="#EEF2F7" fontFamily="Figtree, system-ui" fontSize="13">
          Encumbrance · {seat.encumbrance} · Pending · {pending}
        </text>
        <text x="28" y="210" fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="10">
          {seat.continuityHash}
        </text>
      </svg>
    </motion.div>
  );
}
