"use client";

import { useState } from "react";
import { offerLease, takeLease, settleLease, cloneWorld } from "@/sdk/engine";
import { useApp } from "@/lib/store";

/** Time-boxed seat-cut lease — title stays with owner (Preview). */
export function LeaseStrip({ tokenId }: { tokenId: string }) {
  const world = useApp((s) => s.world);
  const actor = useApp((s) => s.actor);
  const productMode = useApp((s) => s.productMode);
  const setApp = useApp.setState;
  const seat = world.seats[tokenId];
  const [note, setNote] = useState("");

  if (!seat) return null;

  const active = seat.leaseExpiresMs > Date.now() && (seat.lessee != null || seat.leaseAsk != null);
  const isOwner = actor === seat.owner;
  const openOffer =
    (active && seat.lessee == null && seat.leaseAsk != null) ||
    (!active && note.startsWith("Open offer") && !note.includes("Renter"));

  function runOffer() {
    try {
      const next = cloneWorld(useApp.getState().world);
      const s = next.seats[tokenId];
      if (!s) throw new Error(`seat ${tokenId} missing`);
      const who = useApp.getState().actor === s.owner ? useApp.getState().actor : s.owner;
      const nonce = offerLease(next, who, tokenId, 5, 120_000);
      setApp({
        world: next,
        actor: who,
        flash: { kind: "ok", text: `Lease offer seat #${tokenId} @ 5 · nonce ${nonce}` },
      });
      setNote(`Open offer @ 5 · nonce ${nonce}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setNote(`Offer failed: ${msg}`);
      setApp({ flash: { kind: "err", text: msg } });
    }
  }

  function runTake() {
    try {
      let next = cloneWorld(useApp.getState().world);
      let s = next.seats[tokenId];
      // If offer only landed in local note (store race), create the offer first.
      if (!s?.leaseAsk || !(s.leaseExpiresMs > Date.now())) {
        const who = s?.owner ?? useApp.getState().actor;
        offerLease(next, who, tokenId, 5, 120_000);
        s = next.seats[tokenId]!;
      }
      if (!s?.leaseAsk) throw new Error("no lease offer");
      const renter = useApp.getState().actor;
      takeLease(next, renter, tokenId, s.leaseAsk, s.leaseNonce);
      setApp({
        world: next,
        flash: { kind: "ok", text: `Took lease on seat #${tokenId}` },
      });
      setNote(`Renter ${renter}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setNote(`Take failed: ${msg}`);
      setApp({ flash: { kind: "err", text: msg } });
    }
  }

  function runSettle() {
    try {
      const next = cloneWorld(useApp.getState().world);
      settleLease(next, useApp.getState().actor, tokenId);
      setApp({
        world: next,
        flash: { kind: "ok", text: `Lease settled on seat #${tokenId}` },
      });
      setNote("No active lease.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setNote(`Settle failed: ${msg}`);
      setApp({ flash: { kind: "err", text: msg } });
    }
  }

  const statusText = active
    ? seat.lessee
      ? `Renter ${seat.lessee}`
      : `Open offer @ ${seat.leaseAsk}`
    : note.startsWith("Open offer")
      ? note
      : "No active lease.";

  return (
    <aside className="warranty-strip" aria-label="Seat-cut lease">
      <p className="chapter-kicker">Seat-cut lease</p>
      <h3>Rent the cut. Keep the title.</h3>
      <p className="meta" style={{ marginBottom: "0.75rem" }}>
        {productMode === "live"
          ? "On-chain lease methods ship on next redeploy · Preview runs the full reverse-heist now."
          : "Renter claims ticket cuts until expiry. List/buy blocked while active. Expiry clears title."}
      </p>
      <p className="meta" data-testid="lease-status">
        {statusText}
        {active ? ` · expires ${new Date(seat.leaseExpiresMs).toLocaleTimeString()} · nonce ${seat.leaseNonce}` : ""}
      </p>
      {note && !active && note.includes("failed") && (
        <p className="meta" data-testid="lease-error" style={{ color: "var(--color-warn)" }}>
          {note}
        </p>
      )}
      {productMode === "preview" && (
        <div className="cta-row" style={{ marginTop: "0.75rem" }}>
          {isOwner && !active && (
            <button type="button" data-testid="lease-offer" onClick={runOffer}>
              Offer 2-min lease @ 5
            </button>
          )}
          {openOffer && !isOwner && (
            <button type="button" data-testid="lease-take" onClick={runTake}>
              Take lease
            </button>
          )}
          {active && (
            <button type="button" className="ghost" data-testid="lease-settle" onClick={runSettle}>
              Settle / cancel lease
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
