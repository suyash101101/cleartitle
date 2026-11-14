"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";
import { CONTRACT_ID, EXPLORER } from "@/lib/near";
import { seatBuyNonce, viewSeat, type ChainSeat } from "@/lib/chainViews";

const DEFAULT_TOKEN = "3";

export function OnchainActions() {
  const { accountId, buyTicket, listSeat, buySeat } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN);
  const [seat, setSeat] = useState<ChainSeat | null>(null);
  const [seatErr, setSeatErr] = useState<string | null>(null);

  const refreshSeat = useCallback(async (id: string) => {
    setSeatErr(null);
    try {
      const s = await viewSeat(id);
      setSeat(s);
    } catch (e) {
      setSeat(null);
      setSeatErr(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refreshSeat(tokenId);
  }, [tokenId, refreshSeat]);

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
      await new Promise((r) => setTimeout(r, 800));
      await refreshSeat(tokenId);
    } catch (e) {
      setStatus(`${label} failed · ${e instanceof Error ? e.message : String(e)}`);
      await refreshSeat(tokenId);
    } finally {
      setBusy(false);
    }
  }

  const ask = seat?.listing_ask ? String(seat.listing_ask) : "100";
  const nonce = seat ? seatBuyNonce(seat) : 0;
  const enc = (seat?.encumbrance ?? "?").toUpperCase();

  return (
    <div className="panel" style={{ marginTop: "1.25rem" }}>
      <h3>
        <span className="badge rpc">Testnet wallet</span> Signed actions
      </h3>
      <p className="meta">
        {accountId
          ? `Signing as ${accountId} against ${CONTRACT_ID}`
          : "Connect a wallet above to enable buy_ticket / list / buy_seat."}
      </p>
      <label className="meta" style={{ display: "block", marginTop: "0.65rem" }}>
        Seat token id{" "}
        <input
          className="mono"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value.trim() || DEFAULT_TOKEN)}
          style={{ width: "4rem", marginLeft: "0.35rem" }}
        />
      </label>
      {seat && (
        <p className="meta" style={{ marginTop: "0.35rem" }}>
          owner · {seat.owner_id} · {enc} · nonce · {nonce}
          {seat.listing_ask != null && seat.listing_ask !== "" ? ` · ask · ${ask}` : ""}
        </p>
      )}
      {seatErr && (
        <p className="meta" style={{ color: "var(--color-warn)" }}>
          {seatErr}
        </p>
      )}
      <div className="cta-row" style={{ marginTop: "0.75rem" }}>
        <button type="button" disabled={busy || !accountId} onClick={() => void run("buy_ticket", buyTicket)}>
          Buy ticket (10 yocto)
        </button>
        <button
          type="button"
          className="ghost"
          disabled={busy || !accountId}
          onClick={() => void run("list_seat", () => listSeat(tokenId, ask === "0" ? "100" : ask))}
        >
          List seat #{tokenId} @ {ask === "0" || !seat?.listing_ask ? "100" : ask}
        </button>
        <button
          type="button"
          className="ghost"
          disabled={busy || !accountId || enc !== "LISTED"}
          onClick={() => void run("buy_seat", () => buySeat(tokenId, nonce, ask))}
        >
          Buy seat #{tokenId} (nonce {nonce})
        </button>
        <button type="button" className="ghost" disabled={busy} onClick={() => void refreshSeat(tokenId)}>
          Refresh view
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
