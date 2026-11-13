import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-label="ClearTitle">
        <div className="hero-inner">
          <p className="badge amber" style={{ marginBottom: "1rem" }}>
            Nearnight Live · NEAR
          </p>
          <h1>
            Clear<em>Title</em>
          </h1>
          <p>
            Sell the seat. Keep nothing. Ticket money follows clear title — founding memberships that
            earn, with a live attack lab that proves the transfer is clean.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/box-office">
              Buy a ticket
            </Link>
            <Link className="btn ghost" href="/lab">
              Open Transfer Lab
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>One product. One proof.</h2>
        <p className="lede">
          Club seats are NEP-171 deeds over keyless vaults. Every ticket splits on-chain. Sale moves
          ownership, pending payouts, and chain-sig control — mid-payout, under attack.
        </p>
        <div className="grid-2">
          <div className="panel">
            <h3>Club Night</h3>
            <p className="meta">
              Create Nearnight · mint five seats · sell tickets · watch USDC-shaped cuts land in seat
              vaults and the treasury.
            </p>
            <p style={{ marginTop: "1rem" }}>
              <Link href="/console">Club Console →</Link>
            </p>
          </div>
          <div className="panel">
            <h3>Clear Title</h3>
            <p className="meta">
              Diligence Packet · Transfer Lab · Sign epoch freeze · mid-payout buy · /verify wall for
              every claim.
            </p>
            <p style={{ marginTop: "1rem" }}>
              <Link href="/seat/3">Inspect Seat #3 →</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
