"use client";

import { useCallback, useEffect, useState } from "react";
import { EXPLORER } from "@/lib/near";
import { seatBuyNonce, viewDiligence, viewSeat, type ChainSeat } from "@/lib/chainViews";
import { useWallet } from "@/lib/wallet";

type Props = {
  tokenId: string;
};

export function LiveSeatActions({ tokenId }: Props) {
  const { accountId, listSeat, buySeat } = useWallet();
  const [seat, setSeat] = useState<ChainSeat | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setErr(null);
    try {
      const [s, d] = await Promise.all([viewSeat(tokenId), viewDiligence(tokenId)]);
      setSeat(s);
      setVerdict(d.verdict);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }, [tokenId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
      // Fresh view after mutate (nonce / FREEZE race)
      await new Promise((r) => setTimeout(r, 800));
      await refresh();
    } catch (e) {
      setStatus(`${label} failed · ${e instanceof Error ? e.message : String(e)}`);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const enc = (seat?.encumbrance ?? "FREE").toUpperCase();
  const isOwner = Boolean(accountId && seat?.owner_id && accountId === seat.owner_id);
  const ask = seat?.listing_ask ? String(seat.listing_ask) : "100";
  const nonce = seat ? seatBuyNonce(seat) : 0;
  const clean = verdict?.includes("CLEAN") ?? false;
  const buyLocked = enc === "LISTED" && !isOwner && !clean;

  return (
    <div className="panel desk-actions">
      <h3>
        <span className="badge rpc">Live</span> Charter actions
      </h3>
      <p className="meta">
        {accountId ? `Signing as ${accountId}` : "Connect wallet to list or buy on testnet."}
        {seat && (
          <>
            <br />
            owner · {seat.owner_id} · {enc}
            {verdict && <> · {verdict}</>}
          </>
        )}
      </p>
      {err && (
        <p className="meta" style={{ color: "var(--color-warn)" }}>
          {err}
        </p>
      )}
      <div className="desk-actions-grid" style={{ marginTop: "0.65rem" }}>
        <button type="button" className="ghost" disabled={busy} onClick={() => void refresh()}>
          Refresh chain state
        </button>
        {isOwner && enc === "FREE" && (
          <button
            type="button"
            disabled={busy || !accountId}
            onClick={() => void run("list_seat", () => listSeat(tokenId, ask))}
          >
            List @ {ask}
          </button>
        )}
        {enc === "LISTED" && !isOwner && (
          <button
            type="button"
            disabled={busy || !accountId || buyLocked}
            title={buyLocked ? "Wait for PROVABLY CLEAN on live diligence" : undefined}
            onClick={() =>
              void run("buy_seat", () => buySeat(tokenId, nonce, ask))
            }
          >
            {buyLocked ? "Buy locked · diligence" : `Buy mid-payout (nonce ${nonce})`}
          </button>
        )}
        {isOwner && enc === "LISTED" && (
          <p className="meta">Listed @ {ask} · wait for a buyer wallet</p>
        )}
      </div>
      {status && (
        <p className="meta mono" style={{ marginTop: "0.75rem" }}>
          {status.includes("ok ·") ? (
            <>
              {status.split(" · ")[0]} ·{" "}
              <a
                href={`${EXPLORER}/transactions/${status.split(" · ")[1]}`}
                target="_blank"
                rel="noreferrer"
              >
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
