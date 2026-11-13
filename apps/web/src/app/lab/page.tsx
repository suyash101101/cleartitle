"use client";

import { ActorBar } from "@/components/ActorBar";
import { WalletBar } from "@/components/WalletBar";
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
      <h2>Transfer Lab</h2>
      <p className="lede">
        Real testnet failures with explorer receipts — plus local scenario runner for the filmed mid-payout.
      </p>
      <WalletBar />
      <ActorBar />

      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h3>On-chain attack receipts</h3>
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
        <p className="meta">Load demo night for local scenario buttons.</p>
      ) : (
        <div className="grid-2">
          <div className="panel">
            <h3>Local scenario (demo engine)</h3>
            <p className="meta" style={{ marginBottom: "1rem" }}>
              owner {seat.owner} · {seat.encumbrance}
            </p>
            <div className="cta-row">
              <button type="button" onClick={runMidPayoutScenario}>
                Run mid-payout scenario
              </button>
              <button type="button" className="danger" onClick={() => runLab("old", "3")}>
                Old owner withdraw
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
            <h3>Last local result</h3>
            {lastLab ? (
              <>
                <p>
                  <span className="badge ok">EXPECTED FAIL</span>
                </p>
                <p style={{ marginTop: "0.75rem" }}>
                  <strong>{lastLab.attack}</strong>
                </p>
                <p className="meta">{lastLab.reason}</p>
              </>
            ) : (
              <p className="meta">No local attack run yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
