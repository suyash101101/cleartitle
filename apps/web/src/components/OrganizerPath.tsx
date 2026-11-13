"use client";

import Link from "next/link";
import { CONTRACT_ID } from "@/lib/near";

const STEPS = [
  {
    n: "01",
    title: "Connect",
    body: "Open Club Console in Live mode. Connect a testnet wallet.",
    href: "/console",
  },
  {
    n: "02",
    title: "Sell a ticket",
    body: "Box office → Buy ticket (10 yocto). Cuts hit founding seat vaults.",
    href: "/box-office",
  },
  {
    n: "03",
    title: "List mid-payout",
    body: "Seat desk → Refresh chain state → List while pending is live.",
    href: "/seat/3",
  },
  {
    n: "04",
    title: "Diligence then buy",
    body: "Buyer wallet re-reads RPC diligence, then Buy mid-payout with fresh nonce.",
    href: "/seat/3",
  },
  {
    n: "05",
    title: "Prove",
    body: "Lab expected fails + /verify claim matrix with explorer receipts.",
    href: "/verify",
  },
] as const;

/** Five-minute organizer path for Live product mode. */
export function OrganizerPath() {
  return (
    <div className="panel" aria-label="Five minute organizer path">
      <h3>Five-minute organizer path</h3>
      <p className="meta" style={{ marginBottom: "0.85rem" }}>
        Contract · <span className="mono">{CONTRACT_ID}</span> · Live wallet + RPC only.
      </p>
      <ol className="seat-timeline">
        {STEPS.map((s) => (
          <li key={s.n} className="hot">
            <span className="seat-timeline-kind">{s.n}</span>
            <span className="seat-timeline-body">
              <strong>{s.title}</strong>
              {" · "}
              {s.body}{" "}
              <Link href={s.href}>Open</Link>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
