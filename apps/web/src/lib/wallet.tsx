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
import { getQuitClaimClient, clubIdFromEnv } from "@/lib/client";
import { NETWORK } from "@/lib/near";
import { encodeBuyTicket, type VenueSpec } from "@/sdk";

type WalletCtx = {
  accountId: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  createVenue: (spec: VenueSpec) => Promise<string>;
  mintSeats: (clubId?: string) => Promise<string>;
  setPaused: (paused: boolean, clubId?: string) => Promise<string>;
  buyTicket: (depositYocto?: string, clubId?: string) => Promise<string>;
  listSeat: (tokenId: string, ask: string, clubId?: string) => Promise<string>;
  delistSeat: (tokenId: string, clubId?: string) => Promise<string>;
  buySeat: (tokenId: string, syncNonce: number, ask: string, clubId?: string) => Promise<string>;
  claimPayout: (tokenId: string, amount: string, clubId?: string) => Promise<string>;
};

const Ctx = createContext<WalletCtx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connector, setConnector] = useState<NearConnector | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const client = useMemo(() => getQuitClaimClient(), []);

  useEffect(() => {
    const network = NETWORK === "mainnet" ? "mainnet" : "testnet";
    const c = new NearConnector({ network });
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
      if (!connector || !accountId) throw new Error("Connect a wallet first");
      const w = await connector.wallet();
      const outcome = await w.signAndSendTransaction({
        receiverId: client.contractId,
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
    [connector, accountId, client.contractId],
  );

  const resolveClub = (clubId?: string) => clubId ?? clubIdFromEnv() ?? client.clubId;

  const value = useMemo<WalletCtx>(
    () => ({
      accountId,
      connecting,
      connect,
      disconnect,
      createVenue: (spec) => {
        const e = client.encodeCreateVenue(spec);
        return call(e.methodName, e.args, e.depositYocto);
      },
      mintSeats: (clubId) => {
        const e = client.encodeMintSeats(resolveClub(clubId));
        return call(e.methodName, e.args, e.depositYocto);
      },
      setPaused: (paused, clubId) => {
        const e = client.encodeSetPaused(paused, resolveClub(clubId));
        return call(e.methodName, e.args, e.depositYocto);
      },
      buyTicket: async (depositYocto, clubId) => {
        const id = resolveClub(clubId);
        const e =
          depositYocto != null
            ? encodeBuyTicket(depositYocto, id)
            : await client.encodeBuyTicket(id);
        return call(e.methodName, e.args, e.depositYocto);
      },
      listSeat: (tokenId, ask, clubId) => {
        const e = client.encodeListSeat(tokenId, ask, resolveClub(clubId));
        return call(e.methodName, e.args, e.depositYocto);
      },
      delistSeat: (tokenId, clubId) => {
        const e = client.encodeDelistSeat(tokenId, resolveClub(clubId));
        return call(e.methodName, e.args, e.depositYocto);
      },
      buySeat: (tokenId, syncNonce, ask, clubId) => {
        const e = client.encodeBuySeat(tokenId, syncNonce, ask, resolveClub(clubId));
        return call(e.methodName, e.args, e.depositYocto);
      },
      claimPayout: (tokenId, amount, clubId) => {
        const e = client.encodeClaimPayout(tokenId, amount, resolveClub(clubId));
        return call(e.methodName, e.args, e.depositYocto);
      },
    }),
    [accountId, connecting, connect, disconnect, call, client],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet() {
  const v = useContext(Ctx);
  if (!v) throw new Error("WalletProvider missing");
  return v;
}
