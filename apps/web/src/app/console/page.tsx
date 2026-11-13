"use client";

import { ActorBar } from "@/components/ActorBar";
import { PageHeader } from "@/components/ui/page-header";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
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
      <BlurFade delay={0.08}>
        <div className="cta-row" style={{ marginBottom: "1.5rem" }}>
          <button type="button" onClick={bootstrapClub}>
            Create club + mint 5 seats
          </button>
          <button type="button" className="ghost" onClick={resetDemo}>
            Load demo night
          </button>
        </div>
      </BlurFade>

      {club && (
        <div className="grid-2">
          <BlurFade delay={0.1}>
            <div className="panel">
              <BorderBeam duration={10} size={55} colorFrom="#1B6EF3" colorTo="#0C8C6E" />
              <h3>{club.name}</h3>
              <p className="meta">id · {club.clubId}</p>
              <p className="meta">organizer · {club.organizer}</p>
              <p className="meta">ticket · {club.ticketPrice} USDC</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="meta">Treasury</p>
                  <p className="font-display text-3xl font-bold">
                    <NumberTicker value={club.treasuryBalance} />
                  </p>
                </div>
                <div>
                  <p className="meta">Tickets sold</p>
                  <p className="font-display text-3xl font-bold">
                    <NumberTicker value={club.ticketsSold} />
                  </p>
                </div>
              </div>
              <p className="meta mt-3">
                BPS · seats [{club.seatBps.join(", ")}] + treasury {club.treasuryBps} = 10000
              </p>
              <p style={{ marginTop: "0.75rem" }}>
                <span className={`badge ${club.paused ? "warn" : "ok"}`}>
                  {club.paused ? "PAUSED" : "LIVE"}
                </span>
              </p>
            </div>
          </BlurFade>
          <BlurFade delay={0.16}>
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
          </BlurFade>
        </div>
      )}
    </section>
  );
}
