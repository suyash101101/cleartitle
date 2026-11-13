"use client";

import { create } from "zustand";
import {
  buySeat,
  buyTicket,
  claimPayout,
  createClub,
  createWorld,
  labHeldSig,
  labListedWithdraw,
  labOldOwnerWithdraw,
  labWashPath,
  listSeat,
  mintSeats,
  runDiligence,
  seedDemoNight,
  type DiligenceReport,
  type LabResult,
  type WorldState,
} from "@/sdk";

type Flash = { kind: "ok" | "err" | "lab"; text: string } | null;

interface AppState {
  world: WorldState;
  diligence: DiligenceReport | null;
  lastLab: LabResult | null;
  lastSplit: ReturnType<typeof buyTicket> | null;
  flash: Flash;
  actor: string;
  setActor: (a: string) => void;
  resetDemo: () => void;
  bootstrapClub: () => void;
  doBuyTicket: () => void;
  doClaim: (tokenId: string) => void;
  doList: (tokenId: string, ask: number) => void;
  doBuySeat: (tokenId: string) => void;
  doDiligence: (tokenId: string) => void;
  runLab: (kind: "old" | "listed" | "held" | "wash" | "mid", tokenId: string) => void;
  runMidPayoutScenario: () => void;
}

function flashOk(text: string): Flash {
  return { kind: "ok", text };
}
function flashErr(text: string): Flash {
  return { kind: "err", text };
}

export const useApp = create<AppState>((set, get) => ({
  world: seedDemoNight(),
  diligence: null,
  lastLab: null,
  lastSplit: null,
  flash: null,
  actor: "ada.near",
  setActor: (actor) => set({ actor }),
  resetDemo: () =>
    set({
      world: seedDemoNight(),
      actor: "ada.near",
      diligence: null,
      lastLab: null,
      lastSplit: null,
      flash: flashOk("Nearnight seeded. Seat #3 suite pending. Ready for mid-payout."),
    }),
  bootstrapClub: () => {
    try {
      const world = createWorld();
      createClub(world, {
        name: "Nearnight Live",
        organizer: "organizer.near",
        ticketPrice: 10,
        seatBps: [1000, 1000, 1000, 1000, 1000],
        treasuryBps: 5000,
      });
      mintSeats(world, "organizer.near");
      set({
        world,
        flash: flashOk("Club created · 5 seats minted · 0 access keys each."),
        diligence: null,
        lastLab: null,
        lastSplit: null,
      });
    } catch (e) {
      set({ flash: flashErr(e instanceof Error ? e.message : String(e)) });
    }
  },
  doBuyTicket: () => {
    try {
      const world = JSON.parse(JSON.stringify(get().world)) as WorldState;
      const ev = buyTicket(world, get().actor, world.club!.ticketPrice);
      set({
        world,
        lastSplit: ev,
        flash: flashOk(`Ticket sold · treasury +${ev.treasuryCut} · seats split live · ${ev.txHash}`),
      });
    } catch (e) {
      set({ flash: flashErr(e instanceof Error ? e.message : String(e)) });
    }
  },
  doClaim: (tokenId) => {
    try {
      const world = JSON.parse(JSON.stringify(get().world)) as WorldState;
      const id = claimPayout(world, get().actor, tokenId);
      set({ world, flash: flashOk(`Payout ${id} pending on seat #${tokenId}`) });
    } catch (e) {
      set({ flash: flashErr(e instanceof Error ? e.message : String(e)) });
    }
  },
  doList: (tokenId, ask) => {
    try {
      const world = JSON.parse(JSON.stringify(get().world)) as WorldState;
      const nonce = listSeat(world, get().actor, tokenId, ask);
      set({ world, flash: flashOk(`Seat #${tokenId} listed @ ${ask} · nonce ${nonce} · FREEZE`) });
    } catch (e) {
      set({ flash: flashErr(e instanceof Error ? e.message : String(e)) });
    }
  },
  doBuySeat: (tokenId) => {
    try {
      const world = JSON.parse(JSON.stringify(get().world)) as WorldState;
      const seat = world.seats[tokenId];
      if (!seat?.listingAsk) throw new Error("seat not listed");
      const { txHash, rebounded } = buySeat(
        world,
        get().actor,
        tokenId,
        seat.listingAsk,
        seat.listingNonce,
      );
      const diligence = runDiligence(world, tokenId);
      set({
        world,
        diligence,
        flash: flashOk(
          `Bought seat #${tokenId} mid-payout · rebound ${rebounded} · ${txHash} · clear title.`,
        ),
      });
    } catch (e) {
      set({ flash: flashErr(e instanceof Error ? e.message : String(e)) });
    }
  },
  doDiligence: (tokenId) => {
    try {
      const diligence = runDiligence(get().world, tokenId);
      set({
        diligence,
        flash: flashOk(`Diligence: ${diligence.verdict}`),
      });
    } catch (e) {
      set({ flash: flashErr(e instanceof Error ? e.message : String(e)) });
    }
  },
  runLab: (kind, tokenId) => {
    const world = JSON.parse(JSON.stringify(get().world)) as WorldState;
    const seat = world.seats[tokenId];
    if (!seat) {
      set({ flash: flashErr(`Seat ${tokenId} missing. Seed Nearnight from Club first.`) });
      return;
    }
    // Arm the threat so one-click Lab buttons always demonstrate the refusal.
    if (kind === "old" && seat.owner === "ada.near") {
      const nonce = listSeat(world, "ada.near", tokenId, 100);
      buySeat(world, "priya.near", tokenId, 100, nonce);
    } else if (kind === "listed" && seat.encumbrance !== "LISTED") {
      listSeat(world, seat.owner, tokenId, 100);
    } else if (kind === "held" && seat.encumbrance !== "LISTED") {
      listSeat(world, seat.owner, tokenId, 100);
    }

    let lastLab: LabResult;
    if (kind === "old") lastLab = labOldOwnerWithdraw(world, "ada.near", tokenId);
    else if (kind === "listed") lastLab = labListedWithdraw(world, world.seats[tokenId]!.owner, tokenId);
    else if (kind === "held") lastLab = labHeldSig(world, world.seats[tokenId]!.owner, tokenId);
    else if (kind === "mid") {
      get().runMidPayoutScenario();
      return;
    } else lastLab = labWashPath(world, tokenId);
    set({
      world,
      lastLab,
      flash: { kind: "lab", text: `Lab · ${lastLab.attack}: ${lastLab.reason}` },
      diligence: kind === "wash" ? runDiligence(world, tokenId) : get().diligence,
    });
  },
  runMidPayoutScenario: () => {
    try {
      const world = seedDemoNight();
      const nonce = listSeat(world, "ada.near", "3", 100);
      const held = labHeldSig(world, "ada.near", "3");
      const { rebounded, txHash } = buySeat(world, "priya.near", "3", 100, nonce);
      const old = labOldOwnerWithdraw(world, "ada.near", "3");
      const diligence = runDiligence(world, "3");
      set({
        world,
        actor: "priya.near",
        diligence,
        lastLab: old,
        flash: {
          kind: "lab",
          text: `Mid-payout OK · rebound ${rebounded} · held-sig: ${held.reason.slice(0, 40)}… · old withdraw: ${old.reason} · ${txHash}`,
        },
      });
    } catch (e) {
      set({ flash: flashErr(e instanceof Error ? e.message : String(e)) });
    }
  },
}));
