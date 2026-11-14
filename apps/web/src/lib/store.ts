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
import { ONCHAIN, txUrl } from "@/lib/evidence";

type Flash = {
  kind: "ok" | "err" | "lab";
  text: string;
  href?: string;
  hrefLabel?: string;
  ms?: number;
} | null;

function labExplorerProof(
  kind: "old" | "listed" | "held" | "mid" | null,
): { href: string; label: string } | null {
  if (!kind) return null;
  const tx =
    kind === "old"
      ? ONCHAIN.oldOwnerWithdrawRefuse
      : kind === "listed"
        ? ONCHAIN.listedWithdrawRefuse
        : kind === "held"
          ? ONCHAIN.heldSigRefuse
          : ONCHAIN.buySeatMidPayout;
  return {
    href: txUrl(tx),
    label: `${tx.slice(0, 14)}… →`,
  };
}

export type JudgeStamp = { step: string; detail: string; ok: boolean };

/** live = wallet + RPC product path; preview = local scenario / film. */
export type ProductMode = "live" | "preview";

const MODE_KEY = "cleartitle-product-mode";

function readProductMode(): ProductMode {
  if (typeof window === "undefined") return "live";
  try {
    const raw = window.sessionStorage.getItem(MODE_KEY);
    if (raw === "preview" || raw === "live") return raw;
  } catch {
    /* ignore */
  }
  return "live";
}

function writeProductMode(mode: ProductMode) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

interface AppState {
  world: WorldState;
  diligence: DiligenceReport | null;
  lastLab: LabResult | null;
  lastSplit: ReturnType<typeof buyTicket> | null;
  flash: Flash;
  judgeStamps: JudgeStamp[];
  actor: string;
  productMode: ProductMode;
  setProductMode: (mode: ProductMode) => void;
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
  runJudgePath: () => void;
}

function flashOk(text: string): Flash {
  return { kind: "ok", text };
}
function flashErr(text: string): Flash {
  return { kind: "err", text };
}

const JUDGE_STATE_KEY = "cleartitle-judge-state";

type PersistedJudge = {
  world: WorldState;
  diligence: DiligenceReport | null;
  lastLab: LabResult | null;
  judgeStamps: JudgeStamp[];
  actor: string;
};

function readJudgeState(): PersistedJudge | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(JUDGE_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedJudge;
  } catch {
    return null;
  }
}

function writeJudgeState(state: PersistedJudge) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(JUDGE_STATE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

/** Restore Judge Run stamps/world after full navigation reload. */
export function hydrateJudgeFromSession() {
  const saved = readJudgeState();
  if (!saved) return;
  useApp.setState({
    world: saved.world,
    diligence: saved.diligence,
    lastLab: saved.lastLab,
    judgeStamps: saved.judgeStamps,
    actor: saved.actor,
  });
}

export const useApp = create<AppState>((set, get) => ({
  world: seedDemoNight(),
  diligence: null,
  lastLab: null,
  lastSplit: null,
  flash: null,
  judgeStamps: [],
  actor: "ada.near",
  productMode: "live",
  setProductMode: (productMode) => {
    writeProductMode(productMode);
    set({
      productMode,
      flash: flashOk(
        productMode === "live"
          ? "Live mode · connect wallet · RPC diligence and signed list/buy."
          : "Preview mode · local scenario engine · Film ready still available.",
      ),
    });
  },
  setActor: (actor) => set({ actor }),
  resetDemo: () =>
    set({
      world: seedDemoNight(),
      actor: "ada.near",
      productMode: "preview",
      diligence: null,
      lastLab: null,
      lastSplit: null,
      judgeStamps: [],
      flash: flashOk("Nearnight seeded (Preview). Seat #3 suite pending. Ready for mid-payout."),
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

    const proof = labExplorerProof(kind === "wash" ? null : kind);
    set({
      world,
      lastLab,
      flash: {
        kind: "lab",
        text: `Lab · ${lastLab.attack}: ${lastLab.reason}`,
        href: proof?.href,
        hrefLabel: proof?.label,
        ms: proof ? 10000 : 5000,
      },
      diligence: kind === "wash" ? runDiligence(world, tokenId) : get().diligence,
    });
  },
  runMidPayoutScenario: () => {
    try {
      const world = seedDemoNight();
      const nonce = listSeat(world, "ada.near", "3", 100);
      const held = labHeldSig(world, "ada.near", "3");
      const { rebounded } = buySeat(world, "priya.near", "3", 100, nonce);
      const old = labOldOwnerWithdraw(world, "ada.near", "3");
      const diligence = runDiligence(world, "3");
      const mid = labExplorerProof("mid");
      set({
        world,
        actor: "priya.near",
        diligence,
        lastLab: old,
        flash: {
          kind: "lab",
          text: `Mid-payout OK · rebound ${rebounded} · held refused · old withdraw refused`,
          href: mid?.href,
          hrefLabel: mid?.label ?? "Open mid-payout tx →",
          ms: 12000,
        },
      });
    } catch (e) {
      set({ flash: flashErr(e instanceof Error ? e.message : String(e)) });
    }
  },
  runJudgePath: () => {
    try {
      // Film-ready seed — do NOT auto list/buy. Demo must click List @ 100.
      writeProductMode("preview");
      const world = seedDemoNight();
      const stamps: JudgeStamp[] = [
        {
          step: "01 ready",
          detail: "Seat #3 · ada · pending cut · FREE — List @ 100 is clickable",
          ok: true,
        },
        {
          step: "02 film",
          detail: "Diligence → List @ 100 → priya Buy mid-payout → Lab → Verify",
          ok: true,
        },
      ];
      const next = {
        world,
        actor: "ada.near" as const,
        productMode: "preview" as const,
        diligence: null,
        lastLab: null,
        judgeStamps: stamps,
        flash: flashOk(
          "Film ready (Preview) · Seat #3 · ada · pending · FREE. Click List @ 100 on the seat desk.",
        ),
      };
      set(next);
      writeJudgeState({
        world,
        diligence: null,
        lastLab: null,
        judgeStamps: stamps,
        actor: "ada.near",
      });

      if (typeof window !== "undefined") {
        // "film" = no auto-advance tour; user clicks List @ 100 live
        window.sessionStorage.setItem("cleartitle-judge", "film");
      }
    } catch (e) {
      set({
        judgeStamps: [],
        flash: flashErr(e instanceof Error ? e.message : String(e)),
      });
    }
  },
}));

/** Hydrate product mode from session after mount (avoids SSR mismatch). */
export function hydrateProductMode() {
  const mode = readProductMode();
  if (useApp.getState().productMode !== mode) {
    useApp.setState({ productMode: mode });
  }
}
