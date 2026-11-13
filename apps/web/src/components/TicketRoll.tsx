"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type RollTicket = {
  id: string;
  tier: string;
  owner: string;
  keys: number;
  status?: string;
  accent?: string;
};

const DEFAULTS: RollTicket[] = [
  { id: "1", tier: "Floor", owner: "organizer.near", keys: 0, accent: "#ff4fd8" },
  { id: "2", tier: "Lounge", owner: "organizer.near", keys: 0, accent: "#4fd8ff" },
  { id: "3", tier: "Suite", owner: "ada.near", keys: 0, accent: "#ffe14f", status: "CLEAN" },
  { id: "4", tier: "VIP", owner: "organizer.near", keys: 0, accent: "#7cff4f" },
  { id: "5", tier: "Press", owner: "organizer.near", keys: 0, accent: "#ff7a4f" },
];

/** Toilet-paper / graphic ticket-roll UI for mint + seat NFT display. */
export function TicketRoll({
  tickets = DEFAULTS,
  title = "Nearnight seat roll",
  mode = "display",
  onMint,
}: {
  tickets?: RollTicket[];
  title?: string;
  mode?: "display" | "mint";
  onMint?: () => void;
}) {
  return (
    <div className="ticket-roll" aria-label="Graphic ticket roll">
      <div className="ticket-roll-head">
        <p className="chapter-kicker">{title}</p>
        <span className="ticket-roll-torn mono">TORN {String(tickets.length).padStart(2, "0")}</span>
      </div>

      <div className="ticket-roll-stage">
        <div className="ticket-roll-cylinder" aria-hidden>
          <div className="ticket-roll-core" />
          <div className="ticket-roll-paper" />
        </div>

        <div className="ticket-roll-stream">
          {tickets.map((t, i) => (
            <motion.div
              key={t.id}
              className="ticket-perforated"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, type: "spring", stiffness: 220, damping: 22 }}
              style={{ ["--ticket-accent" as string]: t.accent ?? "#fff" }}
            >
              <Link href={`/seat/${t.id}`} className="ticket-face">
                <div className="ticket-art" aria-hidden>
                  <span className="ticket-glitch" />
                  <span className="ticket-barcode" />
                </div>
                <div className="ticket-meta">
                  <strong>
                    #{t.id} · {t.tier}
                  </strong>
                  <span className="mono">{t.owner}</span>
                  <span className="ticket-chips">
                    <em>{t.keys} keys</em>
                    {t.status && <em className="ok">{t.status}</em>}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {mode === "mint" && (
        <div className="ticket-roll-actions">
          <button type="button" className="btn x-pill" onClick={onMint}>
            Tear next seat NFT
          </button>
          <p className="meta">Perforated NEP-171 deeds. Pull from the roll, own the vault.</p>
        </div>
      )}
    </div>
  );
}
