"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/lib/store";

const DEFAULT_MS = 3200;
const LAB_MS = 10000;

export function Flash() {
  const flash = useApp((s) => s.flash);

  useEffect(() => {
    if (!flash) return;
    const ms = flash.ms ?? (flash.kind === "lab" && flash.href ? LAB_MS : DEFAULT_MS);
    const t = window.setTimeout(() => {
      useApp.setState({ flash: null });
    }, ms);
    return () => window.clearTimeout(t);
  }, [flash]);

  const tone = flash?.kind === "err" ? "err" : flash?.kind === "lab" ? "lab" : "ok";

  return (
    <div className="flash-port" aria-live="polite">
      <AnimatePresence>
        {flash && (
          <motion.div
            key={`${flash.text}-${flash.href ?? ""}`}
            className={`flash ${tone}`}
            role="status"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "#f3eadc",
              color: "#1c1814",
              border: `1px solid ${tone === "err" ? "#a33" : "rgb(60 42 24 / 0.32)"}`,
            }}
          >
            <button
              type="button"
              className="flash-dismiss"
              aria-label="Dismiss"
              onClick={() => useApp.setState({ flash: null })}
            >
              {flash.text}
            </button>
            {flash.href && (
              <a
                className="flash-hash mono"
                href={flash.href}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {flash.hrefLabel ?? "Open explorer →"}
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
