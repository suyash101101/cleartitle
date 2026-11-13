import { describe, expect, it } from "vitest";
import { seatBuyNonce, viewClub, viewDiligence, viewSeat } from "../src/near";

const live = process.env.QUITCLAIM_LIVE_RPC === "1";

describe.runIf(live)("live RPC (QUITCLAIM_LIVE_RPC=1)", () => {
  it("reads club, seat 3, diligence CLEAN", async () => {
    const club = await viewClub();
    expect(club.name).toBeTruthy();
    const seat = await viewSeat("3");
    expect(seat.owner_id).toBeTruthy();
    expect(seat.access_key_count ?? 0).toBe(0);
    const dil = await viewDiligence("3");
    expect(dil.verdict).toBe("PROVABLY CLEAN");
    expect(typeof seatBuyNonce(seat)).toBe("number");
  });
});

describe("near helpers offline", () => {
  it("seatBuyNonce prefers listing_nonce", () => {
    expect(seatBuyNonce({ token_id: "1", owner_id: "x", listing_nonce: 4, sync_nonce: 9 })).toBe(4);
    expect(seatBuyNonce({ token_id: "1", owner_id: "x", sync_nonce: 9 })).toBe(9);
    expect(seatBuyNonce({ token_id: "1", owner_id: "x" })).toBe(0);
  });
});
