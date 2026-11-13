/** Live proof artifacts from testnet QuietTitle deployment. */

export const CONTRACT_ID = "cleartitle562464.testnet";
export const EXPLORER = "https://explorer.testnet.near.org";

export const ONCHAIN = {
  deploy: "WXRUUPjAtyKuUGFkDy54QxYmF2NxbHLnfkqpcpPmE1q",
  createClub: "28d8GWcvGXBmKt9QznaNYzKJroKyrez5heDVTvAG6PBo",
  mintSeats: "BWYsnQvo3tNikB88uJHQN4LVBPbPhWKmjHKtjvQdN8J5",
  buyTicket: "G93TQ94JjFC99wkXh4uXhvkkGkXbRXztRL6YjTxwVAd6",
  claimPayout: "6SYRQS8mpSmHUftiGamXou8VT38oSnYUZB3x1PDBjFym",
  listSeat: "6e4wRXkkuJtgMvp33tHzMjgvuitA9nL51fiuxRgaLtb8",
  heldSigRefuse: "995tLJWsSejrYGHDt8tffdC6hVFpoY2EYJpbfJwj5ZBA",
  buySeatMidPayout: "FVjgDg8kdjkxVMkqAtAA8MRiC8YChK2tb34ppKbZYMYi",
  oldOwnerWithdrawRefuse: "HCaWPtkvF8HTgADXL6MjbSESBwcBvfwSwHtC4qXYzNea",
  listedWithdrawRefuse: "5ZPnETPWQK2TYgeuQQeWteQpGJ2VPKFV7BqP6sszqckz",
} as const;

export function txUrl(id: string) {
  return `${EXPLORER}/transactions/${id}`;
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
