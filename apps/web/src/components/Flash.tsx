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

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          key={flash.text}
          className={`flash ${flash.kind === "err" ? "err" : flash.kind === "lab" ? "lab" : ""}`}
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.22 }}
          onClick={() => useApp.setState({ flash: null })}
          style={{ left: "50%", x: "-50%", cursor: "pointer" }}
        >
          {flash.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
