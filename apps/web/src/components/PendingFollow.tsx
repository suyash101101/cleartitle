"use client";

import { motion, AnimatePresence } from "framer-motion";

/** Live pending counter — jumps when title flips; escrow never shows this. */
export function PendingFollow({
  amount,
  owner,
}: {
  amount: number;
  owner: string;
}) {
  return (
    <aside className="pending-follow" aria-label="Pending cuts follow holder">
      <p className="chapter-kicker">Pending follows clear title</p>
      <div className="pending-follow-row">
        <AnimatePresence mode="popLayout">
          <motion.strong
            key={amount}
            className="pending-follow-num"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {amount}
          </motion.strong>
        </AnimatePresence>
        <span className="meta">in flight · holder</span>
        <strong className="mono pending-follow-owner">{owner}</strong>
      </div>
      <p className="meta">
        Timed escrow holds a door fee until show night. This counter rebinds on buy_seat — seller keeps
        nothing.
      </p>
    </aside>
  );
}
