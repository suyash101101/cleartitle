import { VERIFY_CLAIMS } from "@cleartitle/sdk";

export default function VerifyPage() {
  return (
    <section className="section" style={{ borderTop: "none", paddingTop: 0 }}>
      <h2>/verify</h2>
      <p className="lede">
        Every homepage claim maps to a contract method and an automated test. Re-run{" "}
        <span className="mono">pnpm test:unit</span> and <span className="mono">pnpm evidence</span>.
      </p>
      <div className="panel">
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
