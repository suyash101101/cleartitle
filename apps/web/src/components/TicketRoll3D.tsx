"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RollTicket } from "@/components/TicketRoll";

const DEFAULTS: RollTicket[] = [
  { id: "1", tier: "Floor", owner: "organizer.near", keys: 0 },
  { id: "2", tier: "Lounge", owner: "organizer.near", keys: 0 },
  { id: "3", tier: "Suite", owner: "ada.near", keys: 0, status: "CLEAN" },
  { id: "4", tier: "VIP", owner: "organizer.near", keys: 0 },
  { id: "5", tier: "Press", owner: "organizer.near", keys: 0 },
];

/** Resting flap length (px) — short hang like the inspiration. */
const FLAP_MIN = 72;
const TEAR_AT = 200;

/**
 * Side-view toilet-paper roll matching the Graphic Ticket / Roll Paper reference:
 * fat wound cylinder + cardboard core on the right + short hanging flap.
 */
export function TicketRoll3D({
  tickets = DEFAULTS,
  mode = "display",
  onMint,
}: {
  tickets?: RollTicket[];
  mode?: "display" | "mint";
  onMint?: () => void;
}) {
  const [torn, setTorn] = useState<RollTicket[]>(mode === "display" ? tickets : []);
  const [pull, setPull] = useState(FLAP_MIN);
  const [wrapBase, setWrapBase] = useState(0);
  const [ripping, setRipping] = useState(false);
  const drag = useRef<{ active: boolean; startY: number; base: number }>({
    active: false,
    startY: 0,
    base: 0,
  });
  const remaining = Math.max(0, tickets.length - torn.length);
  const next = tickets[torn.length];
  const canPull = mode === "mint" && remaining > 0 && !ripping;
  const wrapShift = wrapBase + (pull - FLAP_MIN) * 0.9;
  const flapH = Math.max(FLAP_MIN, pull);

  const tear = useCallback(() => {
    if (!next || ripping) return;
    setRipping(true);
    setPull(TEAR_AT + 28);
    window.setTimeout(() => {
      setTorn((t) => [...t, next]);
      setWrapBase((s) => s + (TEAR_AT - FLAP_MIN) * 0.9);
      setPull(FLAP_MIN);
      setRipping(false);
      onMint?.();
    }, 520);
  }, [next, onMint, ripping]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canPull) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, startY: e.clientY, base: pull };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !canPull) return;
    const delta = e.clientY - drag.current.startY;
    const nextPull = Math.max(FLAP_MIN, Math.min(TEAR_AT + 36, drag.current.base + delta));
    setPull(nextPull);
    if (nextPull >= TEAR_AT) {
      drag.current.active = false;
      tear();
    }
  };

  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (pull >= TEAR_AT) tear();
    else setPull(FLAP_MIN);
  };

  return (
    <div className="roll3d roll3d-tp" aria-label="Graphic ticket roll">
      <div className="roll3d-head">
        <div>
          <p className="roll3d-kicker">Graphic Ticket</p>
          <p className="roll3d-kicker">Roll Paper</p>
        </div>
        <p className="roll3d-count mono">
          {mode === "mint" ? "TORN" : "STACKED"}{" "}
          <strong>{String(torn.length).padStart(2, "0")}</strong>
        </p>
      </div>

      <div className="tpv-stage">
        <div className="tpv-roll" style={{ ["--wrap" as string]: `${wrapShift}px` }}>
          {/* Fat wound body */}
          <div className="tpv-wound" aria-hidden>
            <span className="tpv-wraps" />
            <span className="tpv-wound-sheen" />
            <span className="tpv-wound-rim" />
          </div>

          {/* Cardboard core — right end, hollow ring */}
          <div className="tpv-core" aria-hidden>
            <span className="tpv-core-wall" />
            <span className="tpv-core-hole" />
          </div>

          {/* Short hanging flap — peels from underside */}
          <div
            className={`tpv-flap-wrap ${canPull ? "draggable" : ""}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role={canPull ? "slider" : undefined}
            aria-valuemin={canPull ? FLAP_MIN : undefined}
            aria-valuemax={canPull ? TEAR_AT : undefined}
            aria-valuenow={canPull ? Math.round(pull) : undefined}
            aria-label={canPull ? "Pull paper to mint seat NFT" : undefined}
            tabIndex={canPull ? 0 : undefined}
          >
            <motion.div
              className={`tpv-flap ${ripping ? "tearing" : ""}`}
              style={{ height: flapH }}
              animate={ripping ? { rotate: 1.5, y: 18, opacity: 0.85 } : { rotate: 0, y: 0, opacity: 1 }}
            >
              <span className="tpv-flap-curl" aria-hidden />
              <span className="tpv-flap-face" />
              {next && canPull && (
                <span className="tpv-flap-label mono">
                  #{next.id} · {next.tier}
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {canPull && (
          <p className="meta tpv-hint">
            {pull < FLAP_MIN + 16
              ? "Pull the flap down to tear a seat"
              : pull < TEAR_AT
                ? "Keep pulling…"
                : "Tearing…"}
          </p>
        )}
        {mode === "mint" && remaining === 0 && (
          <p className="meta tpv-hint">Roll empty · all founding seats torn.</p>
        )}

        <AnimatePresence>
          {ripping && (
            <motion.div
              className="tpv-flash"
              initial={{ opacity: 0.5, y: 0 }}
              animate={{ opacity: 0, y: 48 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="roll3d-stack tp-stack" aria-label="Torn seat NFTs">
        {torn.map((t, i) => (
          <motion.div
            key={`${t.id}-${i}`}
            className="roll3d-ticket"
            style={{
              zIndex: i + 1,
              ["--tilt" as string]: `${(i % 2 === 0 ? -1 : 1) * (3 + (i % 4))}deg`,
            }}
            initial={{ y: -50, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <Link href={`/seat/${t.id}`} className="roll3d-face">
              <div className="roll3d-art roll3d-art-white" aria-hidden />
              <div className="roll3d-meta">
                <strong>
                  #{t.id} · {t.tier}
                </strong>
                <span className="mono">{t.owner}</span>
                <em>{t.keys} keys</em>
                {t.status && <em className="ok">{t.status}</em>}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
