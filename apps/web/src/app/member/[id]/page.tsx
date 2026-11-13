"use client";

import { useParams } from "next/navigation";
import { ActorBar } from "@/components/ActorBar";
import { useApp } from "@/lib/store";

export default function MemberRoomPage() {
  const params = useParams();
  const id = String(params.id ?? "3");
  const world = useApp((s) => s.world);
  const actor = useApp((s) => s.actor);
  const doClaim = useApp((s) => s.doClaim);
  const doList = useApp((s) => s.doList);
  const seat = world.seats[id];

  if (!seat) {
    return (
      <section className="section" style={{ borderTop: "none" }}>
        <h2>Member Room</h2>
        <p className="lede">Seat missing.</p>
      </section>
    );
  }

  const locked = actor !== seat.owner;

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <h2>Member Room · Seat #{id}</h2>
      <p className="lede">Gated by RPC ownership — switch actor to unlock.</p>
      <ActorBar />
      {locked ? (
        <div className="panel">
          <span className="badge warn">LOCKED</span>
          <p style={{ marginTop: "1rem" }}>
            You are {actor}. Owner is {seat.owner}. Claim and list stay hidden.
          </p>
        </div>
      ) : (
        <div className="panel">
          <span className="badge ok">UNLOCKED</span>
          <p className="meta" style={{ marginTop: "0.75rem" }}>
            Continuity {seat.continuityHash} · epoch {seat.keyEpoch}
          </p>
          <div className="cta-row" style={{ marginTop: "1rem" }}>
            <button type="button" onClick={() => doClaim(id)} disabled={seat.encumbrance !== "FREE"}>
              Claim payout
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => doList(id, 100)}
              disabled={seat.encumbrance !== "FREE"}
            >
              List seat @ 100
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
