"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NearConnector } from "@hot-labs/near-connect";
import { encodeBuySeat, encodeBuyTicket, encodeListSeat } from "@/sdk";
import { CONTRACT_ID } from "@/lib/near";

type WalletCtx = {
  accountId: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  buyTicket: () => Promise<string>;
  listSeat: (tokenId: string, ask: string) => Promise<string>;
  buySeat: (tokenId: string, syncNonce: number, ask: string) => Promise<string>;
};

const Ctx = createContext<WalletCtx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connector, setConnector] = useState<NearConnector | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const c = new NearConnector({ network: "testnet" });
    setConnector(c);
    c.on("wallet:signIn", async () => {
      try {
        const w = await c.wallet();
        const accounts = await w.getAccounts();
        setAccountId(accounts[0]?.accountId ?? null);
      } catch {
        setAccountId(null);
      }
    });
    c.on("wallet:signOut", () => setAccountId(null));
    // try restore
    void (async () => {
      try {
        const w = await c.wallet();
        const accounts = await w.getAccounts();
        if (accounts[0]?.accountId) setAccountId(accounts[0].accountId);
      } catch {
        /* not connected */
      }
    })();
  }, []);

  const connect = useCallback(async () => {
    if (!connector) return;
    setConnecting(true);
    try {
      await connector.connect();
      const w = await connector.wallet();
      const accounts = await w.getAccounts();
      setAccountId(accounts[0]?.accountId ?? null);
    } finally {
      setConnecting(false);
    }
  }, [connector]);

  const disconnect = useCallback(async () => {
    if (!connector) return;
    await connector.disconnect();
    setAccountId(null);
  }, [connector]);

  const call = useCallback(
    async (method: string, args: object, depositYoctor: string) => {
      if (!connector || !accountId) throw new Error("Connect a testnet wallet first");
      const w = await connector.wallet();
      const outcome = await w.signAndSendTransaction({
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: method,
              args,
              gas: "100000000000000",
              deposit: depositYoctor,
            },
          },
        ],
      });
      const hash =
        (outcome as { transaction?: { hash?: string }; transaction_outcome?: { id?: string } })
          ?.transaction?.hash ??
        (outcome as { transaction_outcome?: { id?: string } })?.transaction_outcome?.id ??
        "unknown";
      return String(hash);
    },
    [connector, accountId],
  );

  const value = useMemo<WalletCtx>(
    () => ({
      accountId,
      connecting,
      connect,
      disconnect,
      buyTicket: () => {
        const e = encodeBuyTicket();
        return call(e.methodName, e.args, e.depositYocto);
      },
      listSeat: (tokenId, ask) => {
        const e = encodeListSeat(tokenId, ask);
        return call(e.methodName, e.args, e.depositYocto);
      },
      buySeat: (tokenId, syncNonce, ask) => {
        const e = encodeBuySeat(tokenId, syncNonce, ask);
        return call(e.methodName, e.args, e.depositYocto);
      },
    }),
    [accountId, connecting, connect, disconnect, call],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet() {
  const v = useContext(Ctx);
  if (!v) throw new Error("WalletProvider missing");
  return v;
}
