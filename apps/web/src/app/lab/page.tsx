"use client";

import { JudgeStampPanel } from "@/components/JudgeStampPanel";
import { SessionBar } from "@/components/SessionBar";
import { PageHeader } from "@/components/ui/page-header";
import { useApp } from "@/lib/store";
import { LAB_ATTACKS, txUrl } from "@/lib/evidence";

export default function LabPage() {
  const world = useApp((s) => s.world);
  const lastLab = useApp((s) => s.lastLab);
  const runLab = useApp((s) => s.runLab);
  const runMidPayoutScenario = useApp((s) => s.runMidPayoutScenario);
  const seat = world.seats["3"];

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="Transfer Lab"
        lede="Live explorer receipts for seller-recall, listed drain, and held-sig. Scenario engine arms the same threats in one click."
      />
      <SessionBar />
      <JudgeStampPanel />

      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h3>
          <span className="badge rpc">Testnet RPC</span> On-chain attack receipts
        </h3>
        <ul className="checklist">
          {LAB_ATTACKS.map((a) => (
            <li key={a.id}>
              <span className={a.success ? "pass" : "fail"}>{a.success ? "✓" : "✕"}</span>
              <span>
                <strong>{a.title}</strong>
                <br />
                <span className="meta">{a.reason}</span>
                <br />
                <a className="mono" href={txUrl(a.tx)} target="_blank" rel="noreferrer">
                  {a.tx}
                </a>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {!seat ? (
        <p className="meta">Load live night from Club Console to unlock scenario attacks.</p>
      ) : (
        <div className="grid-2">
          <div className="panel">
            <h3>
              <span className="badge scenario">Scenario engine</span> Transfer attacks
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
                Wash flag
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
              </>
            ) : (
              <p className="meta">No attack run yet. Buttons arm the threat first, then refuse it.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
