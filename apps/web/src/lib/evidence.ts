/** Live proof artifacts from the published specimen QuitClaim deployment. */

import { CONTRACT_ID as BOUND_CONTRACT, EXPLORER as BOUND_EXPLORER } from "@/lib/near";

export const CONTRACT_ID = BOUND_CONTRACT;
export const EXPLORER = BOUND_EXPLORER.includes("explorer")
  ? "https://testnet.nearblocks.io"
  : "https://testnet.nearblocks.io";

export const ONCHAIN = {
  deploy: "WXRUUPjAtyKuUGFkDy54QxYmF2NxbHLnfkqpcpPmE1q",
  createClub: "28d8GWcvGXBmKt9QznaNYzKJroKyrez5heDVTvAG6PBo",
  mintSeats: "BWYsnQvo3tNikB88uJHQN4LVBPbPhWKmjHKtjvQdN8J5",
  buyTicket: "G93TQ94JjFC99wkXh4uXhvkkGkXbRXztRL6YjTxwVAd6",
  claimPayout: "6SYRQS8mpSmHUftiGamXou8VT38oSnYUZB3x1PDBjFym",
  listSeat: "FyYM94ENeJRecuTBzjEBcFhnSKzh8Zm43dkphcUqFpSH",
  heldSigRefuse: "4MdAisiCZv37kQCqKoTguB2jFqYoNdsfDapV1JQ6rzL5",
  buySeatMidPayout: "25mJXYgXMw2k7jD4ThYpdrn7YVtk4PeMW6D4xif6TSyR",
  oldOwnerWithdrawRefuse: "Fxo1au6zR3Uy2QXbiPZkCon7VckxbixhYVdFjVi9onK4",
  listedWithdrawRefuse: "24hdybwyxZ7NL3zHEXb1w9U13iPqgsCsbePzXjERJ2Xo",
} as const;

export function txUrl(id: string) {
  return `${EXPLORER}/txns/${id}`;
}

export const LAB_ATTACKS = [
  {
    id: "held",
    title: "Held-sig raw sign while listed",
    reason: "epoch freeze: raw sign refused while seat encumbered",
    tx: ONCHAIN.heldSigRefuse,
    success: false,
  },
  {
    id: "old",
    title: "Old owner withdraw after sale",
    reason: "withdraw refused: not current owner",
    tx: ONCHAIN.oldOwnerWithdrawRefuse,
    success: false,
  },
  {
    id: "listed",
    title: "Withdraw while listed",
    reason: "withdraw refused: encumbered",
    tx: ONCHAIN.listedWithdrawRefuse,
    success: false,
  },
  {
    id: "mid",
    title: "Mid-payout seat purchase",
    reason: "pending rebound + ownership flip (success path)",
    tx: ONCHAIN.buySeatMidPayout,
    success: true,
  },
] as const;
