"use client";

import { ActorBar } from "@/components/ActorBar";
import { OnchainActions } from "@/components/OnchainActions";
import { WalletBar } from "@/components/WalletBar";
import { PageHeader } from "@/components/ui/page-header";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useApp } from "@/lib/store";

export default function BoxOfficePage() {
  const world = useApp((s) => s.world);
  const lastSplit = useApp((s) => s.lastSplit);
  const doBuyTicket = useApp((s) => s.doBuyTicket);
  const club = world.club;

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader title="Box Office" lede="Buy a ticket. Watch the split hit treasury and every seat vault." />
      <WalletBar />
      <ActorBar />
      <OnchainActions />
      {!club ? (
        <p className="meta">Create a club first in Console.</p>
      ) : (
        <div className="grid-2">
          <BlurFade delay={0.08}>
            <div className="panel">
              <BorderBeam duration={9} size={60} colorFrom="#1B6EF3" colorTo="#60A5FA" />
              <h3>{club.name}</h3>
              <p className="font-display my-2 text-5xl font-bold tracking-tight">
                {club.ticketPrice}{" "}
                <span className="text-base font-semibold text-mute">USDC</span>
              </p>
              <ShimmerButton type="button" onClick={doBuyTicket} disabled={club.paused} background="#0A1628">
                Buy ticket
              </ShimmerButton>
              <p className="meta" style={{ marginTop: "1rem" }}>
                Sold tonight · <NumberTicker value={club.ticketsSold} />
              </p>
            </div>
          </BlurFade>
          <BlurFade delay={0.14}>
            <div className="panel">
              <h3>Live split</h3>
              {lastSplit ? (
                <div className="split-viz" key={lastSplit.txHash}>
                  <div className="split-row">
                    <span>Treasury</span>
                    <div className="split-bar">
                      <i style={{ width: `${(lastSplit.treasuryCut / lastSplit.price) * 100}%` }} />
                    </div>
                    <span className="mono">+{lastSplit.treasuryCut}</span>
                  </div>
                  {lastSplit.seatCuts.map((c) => (
                    <div className="split-row" key={c.tokenId}>
                      <span>Seat #{c.tokenId}</span>
                      <div className="split-bar">
                        <i style={{ width: `${(c.amount / lastSplit.price) * 100}%` }} />
                      </div>
                      <span className="mono">+{c.amount}</span>
                    </div>
                  ))}
                  <p className="meta mono" style={{ marginTop: "0.75rem" }}>
                    {lastSplit.txHash}
                  </p>
                </div>
              ) : (
                <p className="meta">Buy a ticket to see the river of cuts.</p>
              )}
            </div>
          </BlurFade>
        </div>
      )}
    </section>
  );
}
