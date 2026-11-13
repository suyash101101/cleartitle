"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActorBar } from "@/components/ActorBar";
import { JudgeCheatSheet } from "@/components/JudgeCheatSheet";
import { JudgeStampPanel } from "@/components/JudgeStampPanel";
import { LiveClubPanel } from "@/components/LiveClubPanel";
import { ModeToggle } from "@/components/ModeToggle";
import { NinetySecondPath } from "@/components/NinetySecondPath";
import { OrganizerPath } from "@/components/OrganizerPath";
import { TestnetPanel } from "@/components/TestnetPanel";
import { TicketRoll3D } from "@/components/TicketRoll3D";
import { PageHeader } from "@/components/ui/page-header";
import { useApp } from "@/lib/store";

export default function ConsolePage() {
  const router = useRouter();
  const world = useApp((s) => s.world);
  const productMode = useApp((s) => s.productMode);
  const bootstrapClub = useApp((s) => s.bootstrapClub);
  const resetDemo = useApp((s) => s.resetDemo);
  const runJudgePath = useApp((s) => s.runJudgePath);
  const club = world.club;
  const seats = Object.values(world.seats);
  const seedNight = () => {
    resetDemo();
    router.push("/seat/3");
  };

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Club Console"
        lede="Organizer controls for Nearnight Live: BPS, mint, pause, treasury. Live mode talks to testnet; Preview is film-only."
      />
      <ModeToggle />
      {productMode === "live" && (
        <>
          <OrganizerPath />
          <div style={{ margin: "1.25rem 0" }}>
            <TestnetPanel />
          </div>
          <LiveClubPanel />
        </>
      )}
      {productMode === "preview" && (
        <div className="console-cast">
          <ActorBar />
        </div>
      )}
      <div className="cta-row console-actions">
        {productMode === "preview" && (
          <button
            type="button"
            className="judge-run-btn"
            onClick={() => {
              runJudgePath();
              router.push("/seat/3");
            }}
          >
            Film ready · Seat #3
          </button>
        )}
        {productMode === "preview" && (
          <>
            <button type="button" onClick={bootstrapClub}>
              Create club + mint 5 seats
            </button>
            <button type="button" className="ghost" onClick={seedNight}>
              Seed Nearnight
            </button>
          </>
        )}
        {productMode === "live" && (
          <Link className="btn" href="/seat/3">
            Open seat #3 (live)
          </Link>
        )}
        <Link className="btn ghost" href="/box-office">
          Box office
        </Link>
        <Link className="btn ghost" href="/inventory">
          Inventory
        </Link>
        <Link className="btn ghost" href="/night">
          Ticket river
        </Link>
      </div>

      {productMode === "preview" && <TicketRoll3D mode="mint" onMint={bootstrapClub} />}

      {productMode === "preview" && (
        <>
          <JudgeCheatSheet />
          <NinetySecondPath />
          <JudgeStampPanel />
          <div className="panel" style={{ marginBottom: "1.5rem" }}>
            <h3>Judge path · manual (Preview)</h3>
            <p className="meta" style={{ marginBottom: "0.85rem" }}>
              Film path: seed leaves Seat #3 FREE for Ada. You click List @ 100 and Buy in Preview.
            </p>
            <ol className="seat-timeline">
              <li className="hot">
                <span className="seat-timeline-kind">01 load</span>
                <span className="seat-timeline-body">
                  <button
                    type="button"
                    className="ghost"
                    style={{ padding: "0.2rem 0.65rem", fontSize: "0.8rem" }}
                    onClick={seedNight}
                  >
                    Load live night → Seat #3
                  </button>{" "}
                  · ada · pending cut
                </span>
              </li>
              <li className="hot">
                <span className="seat-timeline-kind">02 list</span>
                <span className="seat-timeline-body">
                  <Link href="/seat/3">Ada lists @ 100</Link> · FREEZE · diligence CLEAN
                </span>
              </li>
              <li className="hot">
                <span className="seat-timeline-kind">03 buy</span>
                <span className="seat-timeline-body">
                  <Link href="/seat/3">Priya buys mid-payout</Link> · REBOUND_TO_BUYER
                </span>
              </li>
              <li className="hot">
                <span className="seat-timeline-kind">04 attack</span>
                <span className="seat-timeline-body">
                  <Link href="/lab">Lab old owner withdraw</Link> · EXPECTED FAIL
                </span>
              </li>
              <li>
                <span className="seat-timeline-kind">05 prove</span>
                <span className="seat-timeline-body">
                  <Link href="/verify">/verify threat model</Link> + claim ↔ tx matrix
                </span>
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
                <h3>Founding seats (Preview)</h3>
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
        </>
      )}
      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
