"use client";

import { useParams } from "next/navigation";
import { ActorBar } from "@/components/ActorBar";
import { PageHeader } from "@/components/ui/page-header";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
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
      <ActorBar />
      <BlurFade delay={0.1}>
        {locked ? (
          <div className="panel">
            <BorderBeam duration={10} size={55} colorFrom="#D64545" colorTo="#94A3B8" />
            <span className="badge warn">LOCKED</span>
            <p style={{ marginTop: "1rem" }}>
              You are {actor}. Owner is {seat.owner}. Claim and list stay hidden.
            </p>
          </div>
        ) : (
          <div className="panel">
            <BorderBeam duration={10} size={55} colorFrom="#0C8C6E" colorTo="#1B6EF3" />
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
      </BlurFade>
    </section>
  );
}
