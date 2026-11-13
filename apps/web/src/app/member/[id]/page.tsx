"use client";

import { useParams } from "next/navigation";
import { SessionBar } from "@/components/SessionBar";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        title={`Member Room · Seat #${id}`}
        lede="Gated by RPC ownership — switch actor to unlock."
      />
      <SessionBar />
      {locked ? (
        <div className="panel">
          <span className="badge warn">LOCKED</span>
          <p style={{ marginTop: "1rem", fontSize: "1.15rem" }}>
            You are <strong>{actor}</strong>. Owner is <strong>{seat.owner}</strong>.
          </p>
          <p className="meta" style={{ marginTop: "0.5rem" }}>
            Claim, list, and vault control stay hidden until clear title lands with you.
          </p>
        </div>
      ) : (
        <div className="panel">
          <span className="badge ok">UNLOCKED</span>
          <p style={{ marginTop: "1rem", fontSize: "1.15rem" }}>
            You hold Seat #{id}. Ticket cuts and vault control follow this deed.
          </p>
          <p className="meta" style={{ marginTop: "0.5rem" }}>
            Continuity {seat.continuityHash} · epoch {seat.keyEpoch} · {seat.encumbrance}
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
