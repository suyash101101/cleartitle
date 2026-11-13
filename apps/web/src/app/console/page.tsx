"use client";

import { ActorBar } from "@/components/ActorBar";
import { PageHeader } from "@/components/ui/page-header";
import { useApp } from "@/lib/store";

export default function ConsolePage() {
  const world = useApp((s) => s.world);
  const bootstrapClub = useApp((s) => s.bootstrapClub);
  const resetDemo = useApp((s) => s.resetDemo);
  const club = world.club;
  const seats = Object.values(world.seats);

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Club Console"
        lede="Organizer controls for Nearnight Live — BPS, mint, pause, treasury."
      />
      <ActorBar />
      <div className="cta-row" style={{ marginBottom: "1.5rem" }}>
        <button type="button" onClick={bootstrapClub}>
          Create club + mint 5 seats
        </button>
        <button type="button" className="ghost" onClick={resetDemo}>
          Load demo night
        </button>
      </div>

      <div className="panel" style={{ marginBottom: "1.5rem" }}>
        <h3>Film cue card</h3>
        <p className="meta" style={{ marginBottom: "0.85rem" }}>
          90-second judge path — say the line, click the action.
        </p>
        <ol className="seat-timeline">
          <li className="hot">
            <span className="seat-timeline-kind">01 load</span>
            <span className="seat-timeline-body">Load demo night → Seat #3 · ada · pending cut</span>
          </li>
          <li className="hot">
            <span className="seat-timeline-kind">02 list</span>
            <span className="seat-timeline-body">Ada lists @ 100 · FREEZE · Run diligence → PROVABLY CLEAN</span>
          </li>
          <li className="hot">
            <span className="seat-timeline-kind">03 buy</span>
            <span className="seat-timeline-body">Priya buys mid-payout → REBOUND_TO_BUYER · epoch bump</span>
          </li>
          <li className="hot">
            <span className="seat-timeline-kind">04 attack</span>
            <span className="seat-timeline-body">Lab → old owner withdraw → EXPECTED FAIL + explorer</span>
          </li>
          <li>
            <span className="seat-timeline-kind">05 prove</span>
            <span className="seat-timeline-body">/verify threat model + claim ↔ tx matrix</span>
          </li>
        </ol>
      </div>

      {club && (
        <div className="grid-2">
          <div className="panel">
            <h3>{club.name}</h3>
            <p className="meta">id · {club.clubId}</p>
            <p className="meta">organizer · {club.organizer}</p>
            <p className="meta">ticket · {club.ticketPrice} USDC</p>
            <p className="meta">treasury · {club.treasuryBalance}</p>
            <p className="meta">tickets sold · {club.ticketsSold}</p>
            <p className="meta">
              BPS · seats [{club.seatBps.join(", ")}] + treasury {club.treasuryBps} = 10000
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <span className={`badge ${club.paused ? "warn" : "ok"}`}>
                {club.paused ? "PAUSED" : "LIVE"}
              </span>
            </p>
          </div>
          <div className="panel">
            <h3>Founding seats</h3>
            {seats.length === 0 ? (
              <p className="meta">No seats yet.</p>
            ) : (
              <ul className="checklist">
                {seats.map((s) => (
                  <li key={s.tokenId}>
                    <span className="pass">○</span>
                    <span>
                      #{s.tokenId} · {s.vaultAccountId} ·{" "}
                      <span className="badge ok">0 keys</span> · owner {s.owner}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
