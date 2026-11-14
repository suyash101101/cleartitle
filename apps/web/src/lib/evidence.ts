/** Live proof artifacts from the published CleanDeed specimen. */

import { CONTRACT_ID as BOUND_CONTRACT, EXPLORER as BOUND_EXPLORER } from "@/lib/near";

export const CONTRACT_ID = BOUND_CONTRACT;
export const EXPLORER = BOUND_EXPLORER.includes("explorer")
  ? "https://testnet.nearblocks.io"
  : "https://testnet.nearblocks.io";

/** Filmed 2026-11-14 after migrate_reset + two-venue seed (nearnight + dayfest). */
export const ONCHAIN = {
  deploy: "4b6s9LbkcLzyekzaoefCZz51BLACJSgrG8U2QHzuuAAw",
  createClub: "7G8rehpRPb4RmsnaqYGxh4J5F2f4rm557xvhNy7B4bTv",
  mintSeats: "62wwmLzzrX75gwGmEq7gvrBTDaz7PzFeBrKitEfHTEpo",
  createClubDayfest: "3NFUDeZ5zBzpjErpLrFDnArYiWDcknLy9PGGB5Dm8pgX",
  mintSeatsDayfest: "7m9cQoQu1qioNeBKuLCwDhx2X27QS9q6QyDgaA9XxDTc",
  buyTicket: "HNipMg3BSsWPk8fYixAtVUGUvT9uZj1v7Wd6HzyF7WGr",
  listSeat: "7CRKAJgctBt23R7EF5r9gr52RDDKuARrjLcjUyiejVgp",
  heldSigRefuse: "9i8m2uqzbN14AyBZPt5wbe1JH4NoDR4GJENnSQu1wH8C",
  buySeatMidPayout: "5EJhuGcYHH9NAEGUPUM5qvTKNfARExqrZ5wRE9znK7j4",
  oldOwnerWithdrawRefuse: "68stHg3LPFSbqiqbff9z9cpKeGE58uFqj1RhmAKfEJ44",
  listedWithdrawRefuse: "GkboFqbNbBCbkgJvK4eL8V54uRvCJbHamM3t4Wu3d52T",
} as const;

export function txUrl(id: string) {
  return `${EXPLORER}/txns/${id}`;
}

/** Each Lab row maps to a unique filmed testnet hash (no reuse). */
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
    reason: "ownership flip + rebound path (success)",
    tx: ONCHAIN.buySeatMidPayout,
    success: true,
  },
  {
    id: "seal",
    title: "Sign-epoch bump on list",
    reason: "key_epoch increments on list_seat",
    tx: ONCHAIN.listSeat,
    success: true,
  },
  {
    id: "ticket",
    title: "Ticket buy splits treasury + seats",
    reason: "buy_ticket credits venue economics",
    tx: ONCHAIN.buyTicket,
    success: true,
  },
] as const;
