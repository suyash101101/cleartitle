"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CONTRACT_ID } from "@/lib/near";

const NEED = [
  {
    title: "Memberships that earn",
    body: "Clubs, DAOs, and venues sell seats that take a cut of every ticket. Buyers need CleanDeed when money is still in flight.",
  },
  {
    title: "Mid-payout transfers",
    body: "Secondary markets today leave held signatures, stale keys, and seller recall. CleanDeed freezes the epoch and rebounds pending cuts to the buyer.",
  },
  {
    title: "Diligence you can cite",
    body: "A PROVABLY CLEAN stamp from on-chain checks beats a PDF warranty. Integrators call the same diligence view the UI uses.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Contract truth",
    body: "Ship list_seat / buy_seat / diligence on NEAR with zero access keys and epoch freeze.",
  },
  {
    n: "02",
    title: "SDK surface",
    body: "Publish @quitclaim/sdk so organizers and agents run the mid-payout path without forking the demo UI.",
  },
  {
    n: "03",
    title: "Merchant console",
    body: "Live Club Console + Box Office against a bound contract id. Five-minute organizer path.",
  },
  {
    n: "04",
    title: "Continuity tips",
    body: "Chain Signatures derive BTC/SOL tip addresses from the vault id so tips survive ownership flips.",
  },
  {
    n: "05",
    title: "Any-token tickets",
    body: "Roadmap: NEP-141 USDC and intent-routed door fees. Seat title stays NEAR-native; payments can widen later.",
  },
] as const;

const RISKS = [
  {
    title: "Indexer lag",
    body: "Explorer links can trail RPC. Always re-view get_seat after a signed tx before buy_seat.",
  },
  {
    title: "Wallet UX",
    body: "Two wallets for seller and buyer is real life. Preview mode exists only for film; Live is the product.",
  },
  {
    title: "MPC spend",
    body: "Derive is live on testnet. Cross-chain tip spend via MPC is labeled stretch until signed end to end.",
  },
] as const;

export default function ScalePage() {
  return (
    <section className="section scale-page" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="CleanDeed beyond the night"
        lede="How CleanDeed for earning seats becomes a product: market need, GTM steps, technical scale, and honest risks."
      />

      <div className="panel" style={{ marginBottom: "1.75rem" }}>
        <p className="chapter-kicker">Product</p>
        <h2 className="page-title" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
          Sell the seat. Keep nothing.
        </h2>
        <p className="lede" style={{ maxWidth: "38rem" }}>
          Ticket money follows CleanDeed. The Live path already binds to{" "}
          <span className="mono">{CONTRACT_ID}</span>. This page is the post-hackathon plan, not a mockup of fake metrics.
        </p>
        <div className="cta-row" style={{ marginTop: "1rem" }}>
          <Link className="btn" href="/console">
            Open Club Console
          </Link>
          <Link className="btn ghost" href="/verify">
            Claim matrix
          </Link>
          <Link className="btn ghost" href="https://github.com/suyash101101/QuitClaim">
            Repository
          </Link>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1.75rem" }}>
        <h3>Where the NFT field sits</h3>
        <p className="meta" style={{ marginBottom: "1rem" }}>
          Category map only. No project names. CleanDeed owns the mid-payout title-insurance wedge.
        </p>
        <div className="grid-2" style={{ gap: "1.25rem" }}>
          <div>
            <strong>Keyless vault + governance</strong>
            <p className="meta" style={{ marginTop: "0.35rem" }}>
              NFT is a vault and sometimes a vote. Strong on factory and settle. Weak on ticket-cut rebound while pending.
            </p>
          </div>
          <div>
            <strong>Account / membership SDK</strong>
            <p className="meta" style={{ marginTop: "0.35rem" }}>
              Membership is an account with transfer lock-out and agent budgets. Strong SDK story. Weak on earning-seat diligence UI.
            </p>
          </div>
          <div>
            <strong>Merchant / inventory vault</strong>
            <p className="meta" style={{ marginTop: "0.35rem" }}>
              Business-in-a-box NFT with inventory. Broad multi-track surface. Dilutes the transfer-threat demo.
            </p>
          </div>
          <div>
            <strong>CleanDeed wedge</strong>
            <p className="meta" style={{ marginTop: "0.35rem" }}>
              CleanDeed mid-payout: FREEZE, diligence CLEAN, REBOUND_TO_BUYER, explorer refuse, shippable SDK, Live organizer path.
            </p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1.75rem" }}>
        <h3>Market need</h3>
        <p className="meta" style={{ marginBottom: "1rem" }}>
          One job: make earning membership NFTs transferable while payouts are pending.
        </p>
        <div className="grid-2" style={{ gap: "1.25rem" }}>
          {NEED.map((item) => (
            <div key={item.title}>
              <strong>{item.title}</strong>
              <p className="meta" style={{ marginTop: "0.35rem" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1.75rem" }}>
        <h3>GTM and technical scale</h3>
        <ol className="seat-timeline">
          {STEPS.map((s) => (
            <li key={s.n} className="hot">
              <span className="seat-timeline-kind">{s.n}</span>
              <span className="seat-timeline-body">
                <strong>{s.title}</strong>
                {" · "}
                {s.body}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="panel" style={{ marginBottom: "1.75rem" }}>
        <h3>Shipped vs roadmap</h3>
        <ul className="checklist">
          <li>
            <span className="pass">✓</span>
            <span>
              <strong>Shipped</strong> · Rust contract · SDK engine + NEAR views · Live wallet list/buy ·
              diligence RPC · Chain Signatures derive · evidence gate
            </span>
          </li>
          <li>
            <span className="fail">·</span>
            <span>
              <strong>Roadmap</strong> · NEP-141 USDC ticket price · intent-routed any-token door fees · MPC tip
              spend (not just derive) · mainnet club factory
            </span>
          </li>
        </ul>
        <p className="meta" style={{ marginTop: "0.85rem" }}>
          Unshipped items stay labeled. No fake UI pretending they already settle on-chain.
        </p>
      </div>

      <div className="panel" style={{ marginBottom: "1.75rem" }}>
        <h3>Risks and mitigations</h3>
        <div className="grid-2" style={{ gap: "1.25rem" }}>
          {RISKS.map((r) => (
            <div key={r.title}>
              <strong>{r.title}</strong>
              <p className="meta" style={{ marginTop: "0.35rem" }}>
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Try the live path</h3>
        <p className="meta">
          Console (Live) → Box office buy_ticket → Seat #3 list/buy with fresh nonce → Lab → /verify.
        </p>
        <div className="cta-row" style={{ marginTop: "0.85rem" }}>
          <Link className="btn" href="/box-office">
            Box office
          </Link>
          <Link className="btn ghost" href="/seat/3">
            Seat desk
          </Link>
          <Link className="btn ghost" href="/lab">
            Transfer Lab
          </Link>
        </div>
      </div>
      <div className="console-end-spacer" aria-hidden />
    </section>
  );
}
