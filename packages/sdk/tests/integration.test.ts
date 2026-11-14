import { describe, expect, it } from "vitest";
import {
  buySeat,
  buyTicket,
  claimPayout,
  QuitClaimClient,
  createClub,
  createVenue,
  createWorld,
  encodeBuySeat,
  encodeBuyTicket,
  encodeListSeat,
  labHeldSig,
  labOldOwnerWithdraw,
  labWashPath,
  listSeat,
  mintSeats,
  runDiligence,
  seedDemoNight,
} from "../src/index";

describe("integration: end-to-end mid-payout product path", () => {
  it("createClub → mint → ticket → claim → list → buy → CLEAN → old withdraw fail", () => {
    const world = createWorld();
    createClub(world, {
      clubId: "integrator",
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

  it("wash flag fails one named diligence check → FIX BEFORE BUY", () => {
    const world = seedDemoNight();
    const clean = runDiligence(world, "3");
    expect(clean.verdict).toBe("PROVABLY CLEAN");
    expect(clean.checks.every((c) => c.pass)).toBe(true);

    labWashPath(world, "3");
    const broken = runDiligence(world, "3");
    expect(broken.verdict).toBe("FIX BEFORE BUY");
    const wash = broken.checks.find((c) => c.id === "wash");
    expect(wash?.pass).toBe(false);
    expect(broken.checks.filter((c) => c.pass).length).toBe(broken.checks.length - 1);
  });
});

describe("call encoding", () => {
  it("encodes wallet FunctionCall shapes with explicit deposits + club ids", () => {
    expect(encodeBuyTicket("25", "dayfest")).toEqual({
      methodName: "buy_ticket",
      args: { club_id: "dayfest" },
      depositYocto: "25",
    });
    expect(encodeBuyTicket(10)).toEqual({
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

describe("multi-venue engine", () => {
  it("hosts independent clubs without clobbering the first venue", () => {
    const world = createWorld();
    createVenue(world, {
      clubId: "nearnight",
      name: "Nearnight Live",
      organizer: "organizer.near",
      ticketPrice: 10,
      seatBps: [5000, 5000],
      treasuryBps: 0,
    });
    createVenue(
      world,
      {
        clubId: "dayfest",
        name: "Dayfest",
        organizer: "organizer.near",
        ticketPrice: 25,
        seatBps: [2500, 2500, 5000],
        treasuryBps: 0,
        seatKinds: [
          { id: "ga", label: "GA", blurb: "general" },
          { id: "balcony", label: "Balcony", blurb: "upper" },
          { id: "box", label: "Box", blurb: "private" },
        ],
      },
      { setActive: false },
    );
    buyTicket(world, "fan.near", 10, "nearnight");
    buyTicket(world, "fan.near", 25, "dayfest");
    expect(world.clubs.nearnight!.ticketPrice).toBe(10);
    expect(world.clubs.dayfest!.ticketPrice).toBe(25);
    expect(world.seats["nearnight:1"]!.balance).toBe(5);
    expect(world.seats["dayfest:1"]!.balance).toBe(6);
    expect(world.seats["dayfest:1"]!.kind).toBe("ga");
  });
});

describe("QuitClaimClient encodings", () => {
  it("encodes a venue create from VenueSpec without demo defaults", () => {
    const client = new QuitClaimClient({
      contractId: "my-venue.testnet",
      network: "testnet",
      clubId: "dayfest",
    });
    const enc = client.encodeCreateVenue({
      clubId: "dayfest",
      name: "Dayfest",
      organizer: "you.near",
      ticketPrice: 25,
      seatBps: [2500, 2500, 5000],
      treasuryBps: 0,
      seatKinds: [
        { id: "ga", label: "GA", blurb: "" },
        { id: "balcony", label: "Balcony", blurb: "" },
        { id: "box", label: "Box", blurb: "" },
      ],
    });
    expect(enc.methodName).toBe("create_club");
    expect(enc.args.club_id).toBe("dayfest");
    expect(enc.args.ticket_price).toBe("25");
    expect(client.encodeMintSeats().args).toEqual({ club_id: "dayfest" });
    expect(client.encodeBuySeat("1", 2, "100").depositYocto).toBe("100");
  });
});
