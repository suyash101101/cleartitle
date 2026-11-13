"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

const ROUTE_ORDER = ["/seat/3", "/lab", "/verify"] as const;

export function JudgeStampPanel() {
  const stamps = useApp((s) => s.judgeStamps);
  const pathname = usePathname();
  const router = useRouter();
  const allOk = stamps.length > 0 && stamps.every((s) => s.ok);
  const [open, setOpen] = useState(false);

  const [mode, setMode] = useState<"off" | "film" | "tour">("off");

  useEffect(() => {
    if (stamps.length === 0) {
      setMode("off");
      return;
    }
    const flag = window.sessionStorage.getItem("cleartitle-judge");
    if (flag === "film") {
      setMode("film");
      return;
    }
    if (flag !== "1") {
      setMode("off");
      return;
    }
    setMode("tour");
    const idx = ROUTE_ORDER.findIndex((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (idx < 0 || idx >= ROUTE_ORDER.length - 1) {
      if (pathname.startsWith("/verify")) {
        window.sessionStorage.removeItem("cleartitle-judge");
      }
      return;
    }
    const next = ROUTE_ORDER[idx + 1]!;
    const t = window.setTimeout(() => router.push(next), 2400);
    return () => window.clearTimeout(t);
  }, [stamps.length, pathname, router]);

  useEffect(() => {
    // Film mode: keep compact. Tour: expand while incomplete.
    setOpen(mode === "tour" && !allOk);
  }, [allOk, mode]);

  if (stamps.length === 0) return null;

  return (
    <div className={`judge-stamp-panel ${open ? "open" : "compact"}`} role="status">
      <div className="judge-stamp-head">
        <p className="chapter-kicker">
          {mode === "film" ? "Film ready" : "Judge run"} ·{" "}
          {stamps.filter((s) => s.ok).length}/{stamps.length}
        </p>
        <button type="button" className="ghost judge-toggle" onClick={() => setOpen((v) => !v)}>
          {open ? "Collapse" : "Expand stamps"}
        </button>
      </div>
      {open ? (
        <>
          <ol className="judge-stamp-list">
            {stamps.map((s) => (
              <li key={s.step} className={s.ok ? "ok" : "warn"}>
                <span className="judge-step">{s.step}</span>
                <span className="judge-detail">{s.detail}</span>
                <span className="judge-mark">{s.ok ? "✓" : "·"}</span>
              </li>
            ))}
          </ol>
          <p className="meta judge-hint">
            {mode === "film" ? (
              <>
                No auto-advance — click <strong>List @ 100</strong> on the seat.{" "}
                <Link href="/seat/3">Open Seat #3</Link>
              </>
            ) : (
              <>
                Auto-advancing seat → lab → verify.{" "}
                <Link href="/lab">Skip to Lab</Link>
              </>
            )}
          </p>
        </>
      ) : (
        <p className="meta judge-compact-line">
          {mode === "film" ? (
            <>
              ada · pending · FREE ·{" "}
              <Link href="/seat/3">Seat #3 → List @ 100</Link>
            </>
          ) : (
            <>
              Mid-payout ✓ · CLEAN ✓ · old withdraw refused ✓ ·{" "}
              <Link href="/verify">/verify</Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
