import Link from "next/link";
import { FlaskConical, LayoutGrid, ShieldCheck, Ticket } from "lucide-react";
import { VERIFY_CLAIMS } from "@/sdk";
import { CONTRACT_ID, LAB_ATTACKS, txUrl } from "@/lib/evidence";
import { ClaimClock } from "@/components/ClaimClock";
import { JudgeStampPanel } from "@/components/JudgeStampPanel";
import { ProofShare } from "@/components/ProofShare";
import { WarrantyStrip } from "@/components/WarrantyStrip";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { PageHeader } from "@/components/ui/page-header";

/** Lean proof page — receipts first, then claims map. */
export default function VerifyPage() {
  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="/verify"
        lede={
          <>
            Start with live explorer receipts. The table below is only the promise → method →
            test map — not another hash list. Re-run <span className="mono">pnpm evidence</span>.
          </>
        }
      />

      <BentoGrid className="page-bento">
        <BentoCard
          name="Transfer Lab"
          Icon={FlaskConical}
          description="Arm seller-recall, listed drain, held-sig. Each refuses with receipts."
          href="/lab"
          cta="Open Lab"
        />
        <BentoCard
          name="Title certificate"
          Icon={ShieldCheck}
          description="PROVABLY CLEAN stamp. Six named checks."
          href="/title/3"
          cta="Open cert"
        />
        <BentoCard
          name="Seat inventory"
          Icon={LayoutGrid}
          description="Five NEP-171 founding seats on FastNear."
          href="/inventory"
          cta="Browse seats"
        />
        <BentoCard
          name="Box office"
          className="bento-span-2"
          Icon={Ticket}
          description="Buy a ticket. Splits hit seat vaults live."
          href="/box-office"
          cta="Buy ticket"
        />
      </BentoGrid>

      <JudgeStampPanel />

      <div className="panel lab-receipt-wall" style={{ marginBottom: "1.25rem" }}>
        <h3>
          <span className="badge rpc">Testnet RPC</span> Receipt wall
        </h3>
        <p className="meta" style={{ marginBottom: "0.85rem" }}>
          Click any hash → Nearblocks. These are the on-chain refuses (and one mid-payout
          success) judges should open in the demo.
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
        <p className="meta mono" style={{ marginTop: "1rem" }}>
          Contract · {CONTRACT_ID} ·{" "}
          <Link className="pin-link" href="/lab">
            re-run in Lab →
          </Link>
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: "1.25rem" }}>
        <ClaimClock />
        <ProofShare />
      </div>

      <WarrantyStrip />

      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h3>Transfer threat model</h3>
        <p className="meta" style={{ marginBottom: "0.85rem" }}>
          Same attacks as the receipt wall — in plain English.
        </p>
        <ul className="checklist">
          <li>
            <span className="fail">✕</span>
            <span>Old owner withdraw after sale · refused · not current owner</span>
          </li>
          <li>
            <span className="fail">✕</span>
            <span>Withdraw while listed · refused · encumbered</span>
          </li>
          <li>
            <span className="fail">✕</span>
            <span>Held raw sign while listed · refused · epoch freeze</span>
          </li>
          <li>
            <span className="pass">✓</span>
            <span>Mid-payout buy · pending rebound + ownership flip</span>
          </li>
        </ul>
      </div>

      <div className="panel" style={{ marginBottom: "2.5rem" }}>
        <h3>What each claim means</h3>
        <p className="meta" style={{ marginBottom: "0.85rem" }}>
          Not transactions. Each row = a promise we make · the contract method that enforces
          it · the automated test that checks it. Hashes stay in the receipt wall above.
        </p>
        <div className="claim-table claim-table-labeled">
          <div className="claim-row claim-row-head" aria-hidden>
            <span className="meta">Test</span>
            <span className="meta">Promise</span>
            <span className="meta">Contract method</span>
          </div>
          {VERIFY_CLAIMS.map((c) => (
            <div key={c.test} className="claim-row">
              <code className="mono">{c.test}</code>
              <p>{c.claim}</p>
              <p className="meta mono">{c.method}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
