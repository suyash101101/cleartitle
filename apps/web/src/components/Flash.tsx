"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/lib/store";

export function Flash() {
  const flash = useApp((s) => s.flash);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => {
      useApp.setState({ flash: null });
    }, 3200);
    return () => window.clearTimeout(t);
  }, [flash]);

  const tone = flash?.kind === "err" ? "err" : flash?.kind === "lab" ? "lab" : "ok";

  return (
    <div className="flash-port" aria-live="polite">
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.text}
            className={`flash ${tone}`}
            role="status"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={() => useApp.setState({ flash: null })}
            style={{
              background: "#f3eadc",
              color: "#1c1814",
              border: `1px solid ${tone === "err" ? "#a33" : "rgb(60 42 24 / 0.32)"}`,
            }}
          >
            {flash.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
