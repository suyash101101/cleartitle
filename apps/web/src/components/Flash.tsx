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
          initial={{ opacity: 0, y: 16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 8, x: "-50%" }}
          transition={{ duration: 0.28 }}
        >
          {flash.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
