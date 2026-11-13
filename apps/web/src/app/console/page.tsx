"use client";

import { ActorBar } from "@/components/ActorBar";
import { useApp } from "@/lib/store";

export default function ConsolePage() {
  const world = useApp((s) => s.world);
  const bootstrapClub = useApp((s) => s.bootstrapClub);
  const resetDemo = useApp((s) => s.resetDemo);
  const club = world.club;
  const seats = Object.values(world.seats);

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <h2>Club Console</h2>
      <p className="lede">Organizer controls for Nearnight Live — BPS, mint, pause, treasury.</p>
      <ActorBar />
      <div className="cta-row" style={{ marginBottom: "1.5rem" }}>
        <button type="button" onClick={bootstrapClub}>
          Create club + mint 5 seats
        </button>
        <button type="button" className="ghost" onClick={resetDemo}>
          Load demo night
        </button>
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
