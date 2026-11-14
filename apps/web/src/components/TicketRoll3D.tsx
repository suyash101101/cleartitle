"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RollTicket } from "@/components/TicketRoll";

const TEAR_AT = 240;
const SHEET_MIN = 168;

/**
 * Side-view toilet-paper roll (2D illusion):
 * wrap bands scroll with pull; hanging sheet is pure white.
 * Tickets come from the active venue — no baked-in seat catalog.
 */
export function TicketRoll3D({
  tickets = [],
  mode = "display",
  onMint,
}: {
  tickets?: RollTicket[];
  mode?: "display" | "mint";
  onMint?: () => void;
}) {
  const [torn, setTorn] = useState<RollTicket[]>(mode === "display" ? tickets : []);
  const [pull, setPull] = useState(SHEET_MIN);
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
  const wrapShift = wrapBase + (pull - SHEET_MIN) * 1.05;
  const sheetH = Math.max(SHEET_MIN, pull);

  const tear = useCallback(() => {
    if (!next || ripping) return;
    setRipping(true);
    setPull(TEAR_AT + 32);
    window.setTimeout(() => {
      setTorn((t) => [...t, next]);
      setWrapBase((s) => s + (TEAR_AT - SHEET_MIN) * 1.05);
      setPull(SHEET_MIN);
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
    const nextPull = Math.max(SHEET_MIN, Math.min(TEAR_AT + 40, drag.current.base + delta));
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
    else setPull(SHEET_MIN);
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

      <div className="tp-stage">
        <div className="tp-shadow" aria-hidden />

        <div className="tp-dispenser tp-dispenser-tilt">
          <div
            className="tp-roll-2d tp-roll-no-ends"
            style={{ ["--wrap" as string]: `${wrapShift}px` }}
          >
            <span className="tp-cylinder">
              <span className="tp-cylinder-clip" aria-hidden>
                <span className="tp-paper-layers" />
                <span className="tp-paper-curve" />
                <span className="tp-cylinder-shade" />
                <span className="tp-curl" />
              </span>

              {/* Sheet spans full roll width */}
              <div
                className={`tp-sheet-wrap ${canPull ? "draggable" : ""}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                role={canPull ? "slider" : undefined}
                aria-valuemin={canPull ? SHEET_MIN : undefined}
                aria-valuemax={canPull ? TEAR_AT : undefined}
                aria-valuenow={canPull ? Math.round(pull) : undefined}
                aria-label={canPull ? "Pull paper to mint seat NFT" : undefined}
                tabIndex={canPull ? 0 : undefined}
              >
                <motion.div
                  className={`tp-sheet tp-sheet-white ${ripping ? "tearing" : ""}`}
                  style={{ height: sheetH }}
                  animate={ripping ? { rotate: 3.5, x: 6, y: 20 } : { rotate: 0, x: 0, y: 0 }}
                >
                  <span className="tp-sheet-blank" />
                  <span className="tp-sheet-perfs" aria-hidden />
                  {next && canPull && (
                    <div className={`tp-sheet-body ${ripping ? "tp-sheet-body-open" : ""}`}>
                      <span className="tp-sheet-label mono">
                        #{next.id} · {next.tier}
                      </span>
                      {ripping && (
                        <>
                          <span className="tp-sheet-sub mono">{next.owner}</span>
                          <span className="tp-sheet-sub">
                            {next.keys} keys
                            {next.status ? ` · ${next.status}` : ""}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </span>
          </div>
        </div>

        {canPull && (
          <p className="meta tp-hint">
            {pull < SHEET_MIN + 20
              ? "Drag the white paper down"
              : pull < TEAR_AT
                ? "Keep pulling…"
                : "Tearing…"}
          </p>
        )}
        {mode === "mint" && remaining === 0 && (
          <p className="meta tp-hint">Roll empty · all founding seats torn.</p>
        )}

        <AnimatePresence>
          {ripping && (
            <motion.div
              className="tp-rip-flash"
              initial={{ opacity: 0.6, y: 0 }}
              animate={{ opacity: 0, y: 70 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="roll3d-stack tp-stack" aria-label="Torn seat NFTs">
        {torn.map((t, i) => {
          const tilt = (i % 2 === 0 ? -1 : 1) * (5.5 + (i % 3) * 1.4);
          const drop = i % 2 === 0 ? 0 : 22;
          return (
            <motion.div
              key={`${t.id}-${i}`}
              className="roll3d-ticket"
              style={{ zIndex: i + 1, ["--tilt" as string]: `${tilt}deg` }}
              initial={{ y: -36, opacity: 0, scale: 0.94, rotate: 0 }}
              animate={{ y: drop, opacity: 1, scale: 1, rotate: tilt }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <Link href={`/seat/${t.id}`} className="roll3d-face" title={`${t.owner} · ${t.keys} keys`}>
                <div className="roll3d-tear" aria-hidden />
                <div className="roll3d-meta">
                  <strong>
                    #{t.id} · {t.tier}
                  </strong>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
