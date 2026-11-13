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

  useEffect(() => {
    if (stamps.length === 0) return;
    const flag = window.sessionStorage.getItem("cleartitle-judge");
    if (flag !== "1") return;
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
    // Expand while a run is incomplete; collapse when every stamp is green
    setOpen(!allOk);
  }, [allOk]);

  if (stamps.length === 0) return null;

  return (
    <div className={`judge-stamp-panel ${open ? "open" : "compact"}`} role="status">
      <div className="judge-stamp-head">
        <p className="chapter-kicker">Judge run · {stamps.filter((s) => s.ok).length}/{stamps.length}</p>
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
            Auto-advancing seat → lab → verify.{" "}
            <Link href="/lab">Skip to Lab</Link>
          </p>
        </>
      ) : (
        <p className="meta judge-compact-line">
          Mid-payout ✓ · CLEAN ✓ · old withdraw refused ✓ ·{" "}
          <Link href="/verify">/verify</Link>
        </p>
      )}
    </div>
  );
}
