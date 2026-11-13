"use client";

import { useWallet } from "@/lib/wallet";
import { EXPLORER } from "@/lib/near";

export function WalletBar() {
  const { accountId, connecting, connect, disconnect } = useWallet();
  return (
    <div className="actor-bar" style={{ marginBottom: 0 }}>
      {accountId ? (
        <>
          <span className="badge ok">TESTNET</span>
          <a className="mono meta" href={`${EXPLORER}/accounts/${accountId}`} target="_blank" rel="noreferrer">
            {accountId}
          </a>
          <button type="button" className="ghost" onClick={() => void disconnect()}>
            Disconnect
          </button>
        </>
      ) : (
        <button type="button" onClick={() => void connect()} disabled={connecting}>
          {connecting ? "Connecting…" : "Connect testnet wallet"}
        </button>
      )}
    </div>
  );
}
