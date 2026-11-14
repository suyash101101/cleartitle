"use client";

import { AttackTimeline } from "@/components/AttackTimeline";
import { DoubleSellStrip } from "@/components/DoubleSellStrip";
import { DynamicQrStrip } from "@/components/DynamicQrStrip";
import { JudgeStampPanel } from "@/components/JudgeStampPanel";
import { KeyZeroStrip } from "@/components/KeyZeroStrip";
import { OffChainRoyalty } from "@/components/OffChainRoyalty";
import { ResaleClearance } from "@/components/ResaleClearance";
import { SessionBar } from "@/components/SessionBar";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { PageHeader } from "@/components/ui/page-header";
import { useApp } from "@/lib/store";
import { LAB_ATTACKS, ONCHAIN, txUrl } from "@/lib/evidence";
import { LayoutGrid, ShieldCheck, Ticket } from "lucide-react";

function proofForAttack(attack: string): string | null {
  if (attack.includes("old_owner")) return ONCHAIN.oldOwnerWithdrawRefuse;
  if (attack.includes("listed")) return ONCHAIN.listedWithdrawRefuse;
  if (attack.includes("held")) return ONCHAIN.heldSigRefuse;
  if (attack.includes("wash")) return null;
  return ONCHAIN.buySeatMidPayout;
}

export default function LabPage() {
  const world = useApp((s) => s.world);
  const lastLab = useApp((s) => s.lastLab);
  const runLab = useApp((s) => s.runLab);
  const runMidPayoutScenario = useApp((s) => s.runMidPayoutScenario);
  const seat = world.seats["3"];
  const lastTx = lastLab ? proofForAttack(lastLab.attack) : null;

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Transfer Lab"
        lede="Live explorer receipts for seller-recall, listed drain, and held-sig. One click arms each threat and shows the refuse."
      />
      <p className="lab-threat-rail meta" aria-label="Threat radar">
        <span className="badge warn">Threats</span>
        seller recall · listed drain · held-sig · wash. Each arms then refuses with explorer proof.
      </p>
      <SessionBar />

      <BentoGrid className="page-bento">
        <BentoCard
          name="Title certificate"
          Icon={ShieldCheck}
          description="PROVABLY CLEAN stamp after mid-payout."
          href="/title/3"
          cta="Open cert"
        />
        <BentoCard
          name="Seat inventory"
          Icon={LayoutGrid}
          description="Five founding NEP-171 seats."
          href="/inventory"
          cta="Browse"
        />
        <BentoCard
          name="Box office"
          Icon={Ticket}
          description="Buy a ticket · splits hit vaults."
          href="/box-office"
          cta="Buy"
        />
      </BentoGrid>

      <JudgeStampPanel />

      <div className="panel lab-receipt-wall" style={{ marginBottom: "1.25rem" }}>
        <h3>
          <span className="badge rpc">Testnet RPC</span> Receipt wall
        </h3>
        <p className="meta" style={{ marginBottom: "0.85rem" }}>
          Open these first. Toasts after each attack also keep the hash clickable for ~10s.
        </p>
        <ul className="lab-receipt-grid">
          {LAB_ATTACKS.map((a) => (
            <li key={a.id} className={a.success ? "pass" : "fail"}>
              <span className="lab-receipt-mark" aria-hidden>
                {a.success ? "✓" : "✕"}
              </span>
              <div>
                <strong>{a.title}</strong>
                <p className="meta">{a.reason}</p>
                <a className="mono" href={txUrl(a.tx)} target="_blank" rel="noreferrer">
                  {a.tx.slice(0, 18)}…
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {!seat ? (
        <p className="meta">Load live night from Club Console to unlock scenario attacks.</p>
      ) : (
        <div className="grid-2 lab-action-grid" style={{ marginBottom: "1.25rem" }}>
          <div className="panel">
            <h3>
              <span className="badge rpc">Live path</span> Transfer attacks
            </h3>
            <p className="meta" style={{ marginBottom: "1rem" }}>
              owner {seat.owner} · {seat.encumbrance} · {seat.kind}
            </p>
            <div className="cta-row">
              <button type="button" onClick={runMidPayoutScenario}>
                Run mid-payout scenario
              </button>
              <button type="button" className="danger" onClick={() => runLab("old", "3")}>
                Seller recall withdraw
              </button>
              <button type="button" className="danger" onClick={() => runLab("listed", "3")}>
                Listed withdraw
              </button>
              <button type="button" className="danger" onClick={() => runLab("held", "3")}>
                Held-sig raw sign
              </button>
              <button type="button" className="danger" onClick={() => runLab("wash", "3")}>
                Wash flag · fail a check
              </button>
            </div>
          </div>
          <div className="panel">
            <h3>Last scenario result</h3>
            {lastLab ? (
              <>
                <p>
                  <span className={`badge ${lastLab.reason.startsWith("UNEXPECTED") ? "warn" : "ok"}`}>
                    {lastLab.reason.startsWith("UNEXPECTED") ? "UNEXPECTED SUCCESS" : "EXPECTED FAIL"}
                  </span>
                </p>
                <p style={{ marginTop: "0.75rem" }}>
                  <strong>{lastLab.attack}</strong>
                </p>
                <p className="meta">{lastLab.reason}</p>
                {lastTx && (
                  <p style={{ marginTop: "0.75rem" }}>
                    <a className="mono pin-link" href={txUrl(lastTx)} target="_blank" rel="noreferrer">
                      {lastTx.slice(0, 22)}… → explorer
                    </a>
                  </p>
                )}
              </>
            ) : (
              <p className="meta">No attack run yet. Buttons arm the threat first, then refuse it.</p>
            )}
          </div>
        </div>
      )}

      <DoubleSellStrip />
      <AttackTimeline />
      <KeyZeroStrip />
      <OffChainRoyalty />
      <DynamicQrStrip />
      <ResaleClearance />
    </section>
  );
}
