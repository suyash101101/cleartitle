import { VERIFY_CLAIMS } from "@/sdk";
import { LAB_ATTACKS, ONCHAIN, txUrl } from "@/lib/evidence";
import { PageHeader } from "@/components/ui/page-header";

export default function VerifyPage() {
  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <PageHeader
        title="/verify"
        lede={
          <>
            Claims map to tests and live testnet transactions. Re-run{" "}
            <span className="mono">pnpm evidence</span>.
          </>
        }
      />

      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h3>Transfer threat model</h3>
        <p className="meta" style={{ marginBottom: "0.85rem" }}>
          Every way a seller tries to keep the money, and how ClearTitle refuses it.
        </p>
        <ul className="checklist">
          <li>
            <span className="fail">✕</span>
            <span>
              Old owner withdraws after sale
              <br />
              <span className="meta">Access keys = 0 · owner check on withdraw · epoch bump</span>
            </span>
          </li>
          <li>
            <span className="fail">✕</span>
            <span>
              Drain vault while listed
              <br />
              <span className="meta">Encumbrance freeze · listing nonce · withdraw refused</span>
            </span>
          </li>
          <li>
            <span className="fail">✕</span>
            <span>
              Held raw Chain Signature while listed
              <br />
              <span className="meta">Epoch freeze · raw sign refused while encumbered</span>
            </span>
          </li>
          <li>
            <span className="pass">✓</span>
            <span>
              Mid-payout sale keeps pending cut
              <br />
              <span className="meta">Pending rebinds to buyer · seller claim path dies</span>
            </span>
          </li>
        </ul>
      </div>

      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h3>On-chain receipts</h3>
        <table className="verify">
          <thead>
            <tr>
              <th>Event</th>
              <th>Explorer</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(ONCHAIN).map(([k, id]) => (
              <tr key={k}>
                <td className="mono">{k}</td>
                <td>
                  <a className="mono" href={txUrl(id)} target="_blank" rel="noreferrer">
                    {id}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h3>Lab attack proofs</h3>
        <ul className="checklist">
          {LAB_ATTACKS.map((a) => (
            <li key={a.id}>
              <span className={a.success ? "pass" : "fail"}>{a.success ? "✓" : "✕"}</span>
              <span>
                {a.title}: {a.reason}
                <br />
                <a className="mono" href={txUrl(a.tx)} target="_blank" rel="noreferrer">
                  {a.tx}
                </a>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h3>Automated tests</h3>
        <table className="verify">
          <thead>
            <tr>
              <th>Claim</th>
              <th>Method</th>
              <th>Test</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {VERIFY_CLAIMS.map((row) => (
              <tr key={row.test}>
                <td>{row.claim}</td>
                <td className="mono">{row.method}</td>
                <td className="mono">{row.test}</td>
                <td>
                  <span className="badge ok">wired</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
