import { describe, expect, it } from "vitest";
import {
  assertCleanToBuy,
  buySeat,
  buyTicket,
  claimPayout,
  createClub,
  createWorld,
  delistSeat,
  flagWash,
  labHeldSig,
  labListedWithdraw,
  labOldOwnerWithdraw,
  labWashPath,
  listSeat,
  mintSeats,
  offerLease,
  quoteTicketIntentDry,
  requestRawSign,
  runDiligence,
  seedPreviewWorld,
  setPaused,
  settleLease,
  settlePayout,
  takeLease,
  withdrawVault,
} from "../src/index";

describe("S1 bps + pause", () => {
  it("bps_sum_10000_and_immutable", () => {
    const world = createWorld();
    expect(() =>
      createClub(world, {
        clubId: "ok-venue",
        name: "X",
        organizer: "organizer.near",
        ticketPrice: 10,
        seatBps: [1000, 1000],
        treasuryBps: 8000,
      }),
    ).not.toThrow();
    expect(() =>
      createClub(createWorld(), {
        clubId: "bad-bps",
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
      clubId: "pause-club",
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
      clubId: "venue",
      name: "Preview venue",
      organizer: "organizer.near",
      ticketPrice: 10,
      seatBps: [1000, 1000, 1000, 1000, 1000],
      treasuryBps: 5000,
    });
    const seats = mintSeats(world, "organizer.near");
    expect(seats).toHaveLength(5);
    for (const s of seats) {
      expect(s.accessKeyCount).toBe(0);
      expect(s.vaultAccountId).toMatch(/^seat-\d+\.venue\.near$/);
      expect(s.btcAddress.startsWith("bc1")).toBe(true);
    }
  });
});

describe("S3 ticket split", () => {
  it("ticket_splits_treasury_and_seats", () => {
    const world = createWorld();
    createClub(world, {
      clubId: "split-club",
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
    const world = seedPreviewWorld();
    const seat = world.seats["3"]!;
    expect(seat.owner).toBe("seller.near");
    expect(seat.pending.some((p) => p.status === "PENDING")).toBe(true);
    const pendingBefore = seat.pending.find((p) => p.status === "PENDING")!;
    const nonce = listSeat(world, "seller.near", "3", 100);
    const { rebounded } = buySeat(world, "buyer.near", "3", 100, nonce);
    expect(rebounded).toBe(pendingBefore.amount);
    expect(seat.owner).toBe("buyer.near");
    expect(seat.pending.find((p) => p.id === pendingBefore.id)!.status).toBe("REBOUND_TO_BUYER");
    expect(seat.encumbrance).toBe("FREE");
  });

  it("old_owner_withdraw_fails_after_sale", () => {
    const world = seedPreviewWorld();
    const nonce = listSeat(world, "seller.near", "3", 100);
    buySeat(world, "buyer.near", "3", 100, nonce);
    const lab = labOldOwnerWithdraw(world, "seller.near", "3");
    expect(lab.reason).toMatch(/not current owner/);
  });

  it("stale_nonce_refunds", () => {
    const world = seedPreviewWorld();
    listSeat(world, "seller.near", "3", 100);
    expect(() => buySeat(world, "buyer.near", "3", 100, 999)).toThrow(/stale/);
  });
});

describe("S5 encumbrance", () => {
  it("list_blocks_claim_and_sig", () => {
    const world = seedPreviewWorld();
    listSeat(world, "seller.near", "3", 50);
    expect(() => claimPayout(world, "seller.near", "3")).toThrow(/encumbered/);
    const lab = labHeldSig(world, "seller.near", "3");
    expect(lab.reason).toMatch(/refused|freeze/i);
    const w = labListedWithdraw(world, "seller.near", "3");
    expect(w.reason).toMatch(/encumbered/);
  });
});

describe("P1 diligence + continuity + wash", () => {
  it("diligence_clean_when_healthy", () => {
    const world = seedPreviewWorld();
    const d = runDiligence(world, "3");
    expect(d.verdict).toBe("PROVABLY CLEAN");
  });

  it("continuity_hash_stable", () => {
    const world = seedPreviewWorld();
    const before = world.seats["3"]!.continuityHash;
    const btc = world.seats["3"]!.btcAddress;
    const sol = world.seats["3"]!.solAddress;
    const nonce = listSeat(world, "seller.near", "3", 100);
    buySeat(world, "buyer.near", "3", 100, nonce);
    expect(world.seats["3"]!.continuityHash).toBe(before);
    expect(world.seats["3"]!.btcAddress).toBe(btc);
    expect(world.seats["3"]!.solAddress).toBe(sol);
  });

  it("held_sig_refused_while_listed", () => {
    const world = seedPreviewWorld();
    listSeat(world, "seller.near", "3", 40);
    expect(() => requestRawSign(world, "seller.near", "3")).toThrow(/refused|freeze/i);
  });

  it("wash_flag_excludes_earnings", () => {
    const world = seedPreviewWorld();
    const lab = labWashPath(world, "3");
    expect(lab.reason).toMatch(/FIX/);
    expect(runDiligence(world, "3").verdict).toBe("FIX BEFORE BUY");
  });
});

describe("settle + delist", () => {
  it("settle and delist paths", () => {
    const world = seedPreviewWorld();
    const id = world.seats["3"]!.pending[0]!.id;
    settlePayout(world, "3", id);
    expect(world.seats["3"]!.pending[0]!.status).toBe("SETTLED");
    listSeat(world, "seller.near", "3", 10);
    delistSeat(world, "seller.near", "3");
    expect(world.seats["3"]!.encumbrance).toBe("FREE");
    withdrawVault(world, "seller.near", "3", 0.1);
  });
});

describe("film-ready seed (no auto sale)", () => {
  it("seed leaves seat 3 FREE with pending so List is clickable", () => {
    const world = seedPreviewWorld();
    const seat = world.seats["3"]!;
    expect(seat.owner).toBe("seller.near");
    expect(seat.encumbrance).toBe("FREE");
    expect(seat.pending.some((p) => p.status === "PENDING")).toBe(true);
    expect(seat.accessKeyCount).toBe(0);
    expect(seat.btcAddress.startsWith("bc1")).toBe(true);
    expect(seat.solAddress.length).toBeGreaterThan(30);
    const d = runDiligence(world, "3");
    expect(d.verdict).toBe("PROVABLY CLEAN");
    const nonce = listSeat(world, "seller.near", "3", 100);
    expect(world.seats["3"]!.encumbrance).toBe("LISTED");
    expect(nonce).toBeGreaterThan(0);
  });

  it("full mid-payout after explicit list is CLEAN", () => {
    const world = seedPreviewWorld();
    const nonce = listSeat(world, "seller.near", "3", 100);
    buySeat(world, "buyer.near", "3", 100, nonce);
    expect(runDiligence(world, "3").verdict).toBe("PROVABLY CLEAN");
    expect(labOldOwnerWithdraw(world, "seller.near", "3").reason).toMatch(/not current owner/);
  });
});

describe("multi_venue_clubs", () => {
  it("multi_venue_clubs", () => {
    const world = createWorld();
    createClub(world, {
      clubId: "venue-a",
      name: "A",
      organizer: "organizer.near",
      ticketPrice: 10,
      seatBps: [10000],
      treasuryBps: 0,
    });
    createClub(world, {
      clubId: "venue-b",
      name: "B",
      organizer: "organizer.near",
      ticketPrice: 99,
      seatBps: [4000, 6000],
      treasuryBps: 0,
      setActive: false,
    });
    expect(Object.keys(world.clubs)).toEqual(["venue-a", "venue-b"]);
    expect(world.club!.clubId).toBe("venue-a");
    expect(world.clubs["venue-b"]!.ticketPrice).toBe(99);
  });
});

describe("P0/P1 policy · sign-epoch · lease · intents", () => {
  it("list_bumps_sign_epoch", () => {
    const world = seedPreviewWorld();
    const before = world.seats["3"]!.keyEpoch;
    listSeat(world, "seller.near", "3", 100);
    expect(world.seats["3"]!.keyEpoch).toBe(before + 1);
  });

  it("assertCleanToBuy_blocks_wash", () => {
    const world = seedPreviewWorld();
    const nonce = listSeat(world, "seller.near", "3", 100);
    flagWash(world, "3");
    expect(() => assertCleanToBuy(world, "3")).toThrow(/wash|FIX/i);
    expect(() => buySeat(world, "buyer.near", "3", 100, nonce)).toThrow(/wash|FIX/i);
  });

  it("lease_blocks_list_until_settle", () => {
    const world = seedPreviewWorld();
    const nonce = offerLease(world, "seller.near", "3", 5, 120_000);
    takeLease(world, "renter.near", "3", 5, nonce);
    expect(world.seats["3"]!.lessee).toBe("renter.near");
    expect(() => listSeat(world, "seller.near", "3", 50)).toThrow(/lease/i);
    settleLease(world, "seller.near", "3");
    expect(world.seats["3"]!.lessee).toBeNull();
    listSeat(world, "seller.near", "3", 50);
    expect(world.seats["3"]!.encumbrance).toBe("LISTED");
  });

  it("quoteTicketIntentDry_is_dry", () => {
    const q = quoteTicketIntentDry({ clubId: "venue", ticketPriceYocto: "1000" });
    expect(q.dry).toBe(true);
    expect(q.requestPreview.dry).toBe(true);
    expect(q.ticketPriceYocto).toBe("1000");
  });
});
