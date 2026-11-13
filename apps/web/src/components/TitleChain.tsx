"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Seat } from "@/sdk/types";

function fmt(ts: number) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/** Provable holder chain — one-up vs ticket NFT markets that only show current owner. */
export function TitleChain({ seat }: { seat: Seat }) {
  const path = usePathname();
  const onCert = path?.startsWith("/title/");
  const chain = seat.holderHistory.slice().reverse();
  const wash = seat.washFlagged;

  return (
    <div className="title-chain" aria-label="Clear title chain">
      <div className="title-chain-head">
        <div>
          <p className="chapter-kicker">Clear title chain</p>
          <h3>Who held Seat #{seat.tokenId}</h3>
          <p className="meta">
            Continuity hash stays put. Control flips. Wash flag{" "}
            <span className={`badge ${wash ? "warn" : "ok"}`}>
              {wash ? "FLAGGED" : "CLEAN"}
            </span>
          </p>
        </div>
        {!onCert && (
          <Link className="btn ghost title-cert-link" href={`/title/${seat.tokenId}`}>
            Open certificate
          </Link>
        )}
      </div>
      <ol className="title-chain-list">
        {chain.length === 0 ? (
          <li>
            <span className="title-chain-who">{seat.owner}</span>
            <span className="title-chain-meta">current · no prior hops</span>
          </li>
        ) : (
          chain.map((h, i) => {
            const current = h.to === null;
            return (
              <li key={`${h.owner}-${h.from}-${i}`} className={current ? "current" : undefined}>
                <span className="title-chain-dot" aria-hidden />
                <span className="title-chain-who">{h.owner}</span>
                <span className="title-chain-meta">
                  {current ? "current holder" : "prior"} · from {fmt(h.from)}
                  {h.to ? ` → ${fmt(h.to)}` : ""}
                </span>
              </li>
            );
          })
        )}
      </ol>
    </div>
  );
}
