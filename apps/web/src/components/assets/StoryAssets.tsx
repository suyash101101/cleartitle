"use client";

/** Dimensional story props — seat deed, night ticket, diligence stamp, fail slip */

export function SeatDeedCard({ owner = "ada.near", epoch = 1 }: { owner?: string; epoch?: number }) {
  return (
    <div className="asset-card seat-deed">
      <div className="asset-card-inner">
        <p className="asset-kicker">NEP-171 · suite deed</p>
        <h3>Seat #3</h3>
        <p className="asset-line">vault · seat-3.cleartitle…</p>
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
        <p className="asset-kicker">Nearnight Live</p>
        <h3>Door ticket</h3>
        <p className="asset-price">10 <small>USDC</small></p>
        <ul className="asset-split">
          <li>
            <span>Treasury</span>
            <b>20%</b>
          </li>
          <li>
            <span>Five seats</span>
            <b>80%</b>
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
  title = "Old owner withdraw",
  reason = "not current owner",
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
      <div className="flip-row">
        <div>
          <p className="asset-kicker">Seller</p>
          <p className="flip-name">ada.near</p>
          <p className="asset-line">loses claim path</p>
        </div>
        <div className="flip-arrow" aria-hidden>
          →
        </div>
        <div>
          <p className="asset-kicker">Buyer</p>
          <p className="flip-name">priya.near</p>
          <p className="asset-line">pending rebounds</p>
        </div>
      </div>
      <p className="asset-line highlight" style={{ marginTop: "1rem" }}>
        Mid-payout · one breath · clear title
      </p>
    </div>
  );
}
