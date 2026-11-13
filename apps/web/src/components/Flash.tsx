"use client";

import { useApp } from "@/lib/store";

export function Flash() {
  const flash = useApp((s) => s.flash);
  if (!flash) return null;
  return (
    <div className={`flash ${flash.kind === "err" ? "err" : flash.kind === "lab" ? "lab" : ""}`} role="status">
      {flash.text}
    </div>
  );
}
