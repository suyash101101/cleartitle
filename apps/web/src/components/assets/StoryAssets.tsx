"use client";

/** Dimensional story props — seat deed, diligence stamp, fail slip, title score */

export function SeatDeedCard({ owner = "ada.near", epoch = 1 }: { owner?: string; epoch?: number }) {
  return (
    <div className="asset-card seat-deed">
      <div className="asset-card-inner">
        <p className="asset-kicker">NEP-171 · suite deed</p>
        <h3>Seat #3</h3>
        <p className="asset-line">vault · seat vault · QuitClaim</p>
        <p className="asset-line highlight">0 access keys · epoch {epoch}</p>
        <p className="asset-line">owner · {owner}</p>
        <div className="asset-footer">
          <span>BTC tip stable</span>
          <span>SOL tip stable</span>
        </div>
      </div>
      <div className="asset-edge" aria-hidden />
    </div>
  );
}

export function NightTicketCard() {
  return (
    <div className="asset-card night-ticket">
      <div className="asset-card-inner">
        <p className="asset-kicker">QuitClaim</p>
        <h3>Door ticket</h3>
        <p className="asset-price">
          10 <small>USDC</small>
        </p>
        <ul className="asset-split">
          <li>
            <span>Treasury</span>
            <b>50%</b>
          </li>
          <li>
            <span>Five seats</span>
            <b>50%</b>
          </li>
        </ul>
        <p className="asset-line mute">ft_transfer_call → ticket_cut events</p>
      </div>
    </div>
  );
}

export function DiligenceStampCard({ verdict = "PROVABLY CLEAN" }: { verdict?: string }) {
  return (
    <div className="asset-card stamp-card">
      <div className={`stamp-face ${verdict.includes("CLEAN") ? "clean" : "fix"}`}>
        <p className="asset-kicker">Diligence packet</p>
        <p className="stamp-text">{verdict}</p>
        <p className="asset-line">keys · continuity · pending · wash</p>
      </div>
    </div>
  );
}

export function FailSlipCard({
  title = "Seller recall",
  reason = "old holder still controls access",
}: {
  title?: string;
  reason?: string;
}) {
  return (
    <div className="asset-card fail-slip">
      <div className="asset-card-inner">
        <p className="asset-kicker warn">Transfer Lab · expected fail</p>
        <h3>{title}</h3>
        <p className="asset-line">{reason}</p>
        <p className="asset-line mono">explorer receipt linked</p>
      </div>
    </div>
  );
}

export function OwnershipFlipCard() {
  return (
    <div className="asset-card flip-card">
      <div className="asset-card-inner">
        <p className="asset-kicker">Mid-payout · one breath · QuitClaim</p>
        <div className="flip-row">
          <div>
            <span className="meta">Seller</span>
            <strong>ada.near</strong>
            <p className="meta">loses claim path</p>
          </div>
          <div className="flip-arrow" aria-hidden>
            →
          </div>
          <div>
            <span className="meta">Buyer</span>
            <strong>priya.near</strong>
            <p className="meta">pending rebounds</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TitleScoreCard() {
  return (
    <div className="asset-card title-score-card">
      <div className="asset-card-inner">
        <p className="asset-kicker">Title clarity</p>
        <p className="title-score-card-num">
          100 <span>A</span>
        </p>
        <p className="asset-line highlight">0 keys · wash clean · no raw sigs</p>
        <p className="asset-line mute">Owner alone is not enough. We score the title.</p>
      </div>
    </div>
  );
}

export function ClaimClockCard() {
  return (
    <div className="asset-card claim-clock-card">
      <div className="asset-card-inner">
        <p className="asset-kicker">After the door</p>
        <div className="claim-clock-card-row">
          <div>
            <span className="meta">Escrow</span>
            <strong>48h</strong>
          </div>
          <div className="flip-arrow" aria-hidden>
            →
          </div>
          <div>
            <span className="meta">QuitClaim</span>
            <strong>∞</strong>
          </div>
        </div>
        <p className="asset-line mute">Door fee ends. Seat earnings do not.</p>
      </div>
    </div>
  );
}

export function DiligenceCard() {
  return (
    <div className="asset-card fanpass-card">
      <div className="asset-card-inner">
        <p className="asset-kicker">Explainable diligence</p>
        <p className="asset-line">Six named checks · RPC replay</p>
        <p className="asset-line highlight">CLEAN gate before buy_seat</p>
        <p className="asset-line mute">0 keys · wash · held-sig · continuity</p>
      </div>
    </div>
  );
}
