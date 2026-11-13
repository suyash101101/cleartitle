"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/lib/store";

export function Flash() {
  const flash = useApp((s) => s.flash);
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
          style={{ left: "50%", x: "-50%" }}
        >
          {flash.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
