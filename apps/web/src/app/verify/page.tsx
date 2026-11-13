import { VERIFY_CLAIMS } from "@/sdk";
import { LAB_ATTACKS, ONCHAIN, txUrl } from "@/lib/evidence";

export default function VerifyPage() {
  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <h2>/verify</h2>
      <p className="lede">
        Claims map to tests and live testnet transactions. Re-run{" "}
        <span className="mono">pnpm evidence</span>.
      </p>

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
                {a.title} — {a.reason}
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
