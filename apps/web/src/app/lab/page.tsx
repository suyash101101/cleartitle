"use client";

import { ActorBar } from "@/components/ActorBar";
import { useApp } from "@/lib/store";

export default function LabPage() {
  const world = useApp((s) => s.world);
  const lastLab = useApp((s) => s.lastLab);
  const runLab = useApp((s) => s.runLab);
  const seat = world.seats["3"];

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <h2>Transfer Lab</h2>
      <p className="lede">
        Fire real failing paths. Every button expects failure — that is the product.
      </p>
      <ActorBar />

      {!seat ? (
        <p className="meta">Load demo night first.</p>
      ) : (
        <div className="grid-2">
          <div className="panel">
            <h3>Attacks on Seat #3</h3>
            <p className="meta" style={{ marginBottom: "1rem" }}>
              owner {seat.owner} · {seat.encumbrance} · pending{" "}
              {seat.pending.filter((p) => p.status === "PENDING" || p.status === "REBOUND_TO_BUYER").length}
            </p>
            <div className="cta-row">
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
            <h3>Last result</h3>
            {lastLab ? (
              <>
                <p>
                  <span className="badge ok">EXPECTED FAIL</span>
                </p>
                <p style={{ marginTop: "0.75rem" }}>
                  <strong>{lastLab.attack}</strong>
                </p>
                <p className="meta">{lastLab.reason}</p>
                <p className="mono" style={{ marginTop: "0.75rem", color: "var(--amber)" }}>
                  {lastLab.explorerHint}
                </p>
              </>
            ) : (
              <p className="meta">No attack run yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
