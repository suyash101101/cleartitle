import { describe, expect, it } from "vitest";
import {
  buySeat,
  buyTicket,
  claimPayout,
  createClub,
  createWorld,
  delistSeat,
  labHeldSig,
  labListedWithdraw,
  labOldOwnerWithdraw,
  labWashPath,
  listSeat,
  mintSeats,
  requestRawSign,
  runDiligence,
  seedDemoNight,
  setPaused,
  settlePayout,
  withdrawVault,
} from "../src/index";

describe("S1 bps + pause", () => {
  it("bps_sum_10000_and_immutable", () => {
    const world = createWorld();
    expect(() =>
      createClub(world, {
        name: "X",
        organizer: "organizer.near",
        ticketPrice: 10,
        seatBps: [1000, 1000],
        treasuryBps: 8000,
      }),
    ).not.toThrow();
    expect(() =>
      createClub(createWorld(), {
        name: "Bad",
        organizer: "organizer.near",
        ticketPrice: 10,
        seatBps: [1000],
        treasuryBps: 1000,
      }),
    ).toThrow(/10000/);
  });

  it("pause_stops_ticket", () => {
    const world = createWorld();
    createClub(world, {
      name: "N",
      organizer: "organizer.near",
      ticketPrice: 10,
      seatBps: [5000],
      treasuryBps: 5000,
    });
    mintSeats(world, "organizer.near");
    setPaused(world, "organizer.near", true);
    expect(() => buyTicket(world, "fan.near", 10)).toThrow(/paused/);
  });
});

describe("S2 mint keys", () => {
  it("keys_empty_after_mint", () => {
    const world = createWorld();
    createClub(world, {
      name: "Nearnight Live",
      organizer: "organizer.near",
      ticketPrice: 10,
      seatBps: [1000, 1000, 1000, 1000, 1000],
      treasuryBps: 5000,
    });
    const seats = mintSeats(world, "organizer.near");
    expect(seats).toHaveLength(5);
    for (const s of seats) {
      expect(s.accessKeyCount).toBe(0);
      expect(s.vaultAccountId).toMatch(/^seat-\d+\.nearnight\.near$/);
    }
  });
});

describe("S3 ticket split", () => {
  it("ticket_splits_treasury_and_seats", () => {
    const world = createWorld();
    createClub(world, {
      name: "N",
      organizer: "organizer.near",
      ticketPrice: 10,
      seatBps: [1000, 1000, 1000, 1000, 1000],
      treasuryBps: 5000,
    });
    mintSeats(world, "organizer.near");
    const ev = buyTicket(world, "fan.near", 10);
    expect(ev.treasuryCut).toBe(5);
    expect(ev.seatCuts.every((c) => c.amount === 1)).toBe(true);
    expect(ev.treasuryCut + ev.seatCuts.reduce((a, c) => a + c.amount, 0)).toBe(10);
    expect(world.club!.treasuryBalance).toBe(5);
    expect(world.seats["1"]!.balance).toBe(1);
  });
});

describe("S4–S6 mid-payout sale", () => {
  it("sale_mid_payout_rebinds_pending", () => {
    const world = seedDemoNight();
    const seat = world.seats["3"]!;
    expect(seat.owner).toBe("ada.near");
    expect(seat.pending.some((p) => p.status === "PENDING")).toBe(true);
    const pendingBefore = seat.pending.find((p) => p.status === "PENDING")!;
    const nonce = listSeat(world, "ada.near", "3", 100);
    const { rebounded } = buySeat(world, "priya.near", "3", 100, nonce);
    expect(rebounded).toBe(pendingBefore.amount);
    expect(seat.owner).toBe("priya.near");
    expect(seat.pending.find((p) => p.id === pendingBefore.id)!.status).toBe("REBOUND_TO_BUYER");
    expect(seat.encumbrance).toBe("FREE");
  });

  it("old_owner_withdraw_fails_after_sale", () => {
    const world = seedDemoNight();
    const nonce = listSeat(world, "ada.near", "3", 100);
    buySeat(world, "priya.near", "3", 100, nonce);
    const lab = labOldOwnerWithdraw(world, "ada.near", "3");
    expect(lab.reason).toMatch(/not current owner/);
  });

  it("stale_nonce_refunds", () => {
    const world = seedDemoNight();
    listSeat(world, "ada.near", "3", 100);
    expect(() => buySeat(world, "priya.near", "3", 100, 999)).toThrow(/stale/);
  });
});

describe("S5 encumbrance", () => {
  it("list_blocks_claim_and_sig", () => {
    const world = seedDemoNight();
    listSeat(world, "ada.near", "3", 50);
    expect(() => claimPayout(world, "ada.near", "3")).toThrow(/encumbered/);
    const lab = labHeldSig(world, "ada.near", "3");
    expect(lab.reason).toMatch(/refused|freeze/i);
    const w = labListedWithdraw(world, "ada.near", "3");
    expect(w.reason).toMatch(/encumbered/);
  });
});

describe("P1 diligence + continuity + wash", () => {
  it("diligence_clean_when_healthy", () => {
    const world = seedDemoNight();
    const d = runDiligence(world, "3");
    expect(d.verdict).toBe("PROVABLY CLEAN");
  });

  it("continuity_hash_stable", () => {
    const world = seedDemoNight();
    const before = world.seats["3"]!.continuityHash;
    const btc = world.seats["3"]!.btcAddress;
    const sol = world.seats["3"]!.solAddress;
    const nonce = listSeat(world, "ada.near", "3", 100);
    buySeat(world, "priya.near", "3", 100, nonce);
    expect(world.seats["3"]!.continuityHash).toBe(before);
    expect(world.seats["3"]!.btcAddress).toBe(btc);
    expect(world.seats["3"]!.solAddress).toBe(sol);
  });

  it("held_sig_refused_while_listed", () => {
    const world = seedDemoNight();
    listSeat(world, "ada.near", "3", 40);
    expect(() => requestRawSign(world, "ada.near", "3")).toThrow(/refused|freeze/i);
  });

  it("wash_flag_excludes_earnings", () => {
    const world = seedDemoNight();
    const lab = labWashPath(world, "3");
    expect(lab.reason).toMatch(/FIX/);
    expect(runDiligence(world, "3").verdict).toBe("FIX BEFORE BUY");
  });
});

describe("settle + delist", () => {
  it("settle and delist paths", () => {
    const world = seedDemoNight();
    const id = world.seats["3"]!.pending[0]!.id;
    settlePayout(world, "3", id);
    expect(world.seats["3"]!.pending[0]!.status).toBe("SETTLED");
    listSeat(world, "ada.near", "3", 10);
    delistSeat(world, "ada.near", "3");
    expect(world.seats["3"]!.encumbrance).toBe("FREE");
    withdrawVault(world, "ada.near", "3", 0.1);
  });
});

describe("film-ready seed (no auto sale)", () => {
  it("seed leaves seat 3 FREE with pending so List is clickable", () => {
    const world = seedDemoNight();
    const seat = world.seats["3"]!;
    expect(seat.owner).toBe("ada.near");
    expect(seat.encumbrance).toBe("FREE");
    expect(seat.pending.some((p) => p.status === "PENDING")).toBe(true);
    expect(seat.accessKeyCount).toBe(0);
    const d = runDiligence(world, "3");
    expect(d.verdict).toBe("PROVABLY CLEAN");
    const nonce = listSeat(world, "ada.near", "3", 100);
    expect(world.seats["3"]!.encumbrance).toBe("LISTED");
    expect(nonce).toBeGreaterThan(0);
  });

  it("full mid-payout after explicit list is CLEAN", () => {
    const world = seedDemoNight();
    const nonce = listSeat(world, "ada.near", "3", 100);
    buySeat(world, "priya.near", "3", 100, nonce);
    expect(runDiligence(world, "3").verdict).toBe("PROVABLY CLEAN");
    expect(labOldOwnerWithdraw(world, "ada.near", "3").reason).toMatch(/not current owner/);
  });
});
