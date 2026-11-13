"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { EXPLORER } from "@/lib/near";

export function OnchainActions() {
  const { accountId, buyTicket, listSeat, buySeat } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(label: string, fn: () => Promise<string>) {
    if (!accountId) {
      setStatus("Connect a testnet wallet first");
      return;
    }
    setBusy(true);
    setStatus(`${label}…`);
    try {
      const hash = await fn();
      setStatus(`${label} ok · ${hash}`);
    } catch (e) {
      setStatus(`${label} failed · ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel" style={{ marginTop: "1.25rem" }}>
      <h3>Signed testnet actions</h3>
      <p className="meta">Uses your connected wallet against cleartitle562464.testnet</p>
      <div className="cta-row" style={{ marginTop: "0.75rem" }}>
        <button type="button" disabled={busy || !accountId} onClick={() => void run("buy_ticket", buyTicket)}>
          Buy ticket (10 yocto)
        </button>
        <button
          type="button"
          className="ghost"
          disabled={busy || !accountId}
          onClick={() => void run("list_seat", () => listSeat("2", "100"))}
        >
          List seat #2 @ 100
        </button>
        <button
          type="button"
          className="ghost"
          disabled={busy || !accountId}
          onClick={() => void run("buy_seat", () => buySeat("2", 1, "100"))}
        >
          Buy seat #2 (nonce 1)
        </button>
      </div>
      {status && (
        <p className="meta mono" style={{ marginTop: "0.75rem" }}>
          {status.includes("ok ·") ? (
            <>
              {status.split(" · ")[0]} ·{" "}
              <a href={`${EXPLORER}/transactions/${status.split(" · ")[1]}`} target="_blank" rel="noreferrer">
                {status.split(" · ")[1]}
              </a>
            </>
          ) : (
            status
          )}
        </p>
      )}
    </div>
  );
}
