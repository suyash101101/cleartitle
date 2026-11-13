import { describe, expect, it } from "vitest";
import {
  buySeat,
  buyTicket,
  claimPayout,
  createClub,
  createWorld,
  encodeBuySeat,
  encodeBuyTicket,
  encodeListSeat,
  labHeldSig,
  labOldOwnerWithdraw,
  listSeat,
  mintSeats,
  runDiligence,
  seedDemoNight,
} from "../src/index";

describe("integration: end-to-end mid-payout product path", () => {
  it("createClub → mint → ticket → claim → list → buy → CLEAN → old withdraw fail", () => {
    const world = createWorld();
    createClub(world, {
      name: "Integrator Club",
      organizer: "organizer.near",
      ticketPrice: 10,
      seatBps: [1000, 1000, 1000, 1000, 1000],
      treasuryBps: 5000,
    });
    mintSeats(world, "organizer.near");
    // Hand seat 3 to ada like a founding sale
    world.seats["3"]!.owner = "ada.near";
    buyTicket(world, "fan.near", 10);
    claimPayout(world, "ada.near", "3");
    expect(world.seats["3"]!.pending.some((p) => p.status === "PENDING")).toBe(true);

    const nonce = listSeat(world, "ada.near", "3", 100);
    expect(labHeldSig(world, "ada.near", "3").success).toBe(false);
    const { rebounded } = buySeat(world, "priya.near", "3", 100, nonce);
    expect(rebounded).toBeGreaterThan(0);
    expect(world.seats["3"]!.owner).toBe("priya.near");
    expect(runDiligence(world, "3").verdict).toBe("PROVABLY CLEAN");
    expect(labOldOwnerWithdraw(world, "ada.near", "3").reason).toMatch(/not current owner/);
  });

  it("seedDemoNight film path matches integrator snippet", () => {
    const world = seedDemoNight();
    const nonce = listSeat(world, "ada.near", "3", 100);
    buySeat(world, "priya.near", "3", 100, nonce);
    expect(runDiligence(world, "3").verdict).toBe("PROVABLY CLEAN");
  });
});

describe("call encoding", () => {
  it("encodes wallet FunctionCall shapes", () => {
    expect(encodeBuyTicket()).toEqual({
      methodName: "buy_ticket",
      args: {},
      depositYocto: "10",
    });
    expect(encodeListSeat("3", "100").args).toEqual({ token_id: "3", ask: "100" });
    expect(encodeBuySeat("3", 2, "100")).toEqual({
      methodName: "buy_seat",
      args: { token_id: "3", sync_nonce: 2 },
      depositYocto: "100",
    });
  });
});
