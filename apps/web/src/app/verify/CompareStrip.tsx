export function CompareStrip() {
  return (
    <div className="compare-strip" aria-label="ClearTitle vs escrow">
      <h3>ClearTitle vs ticket escrow</h3>
      <table className="verify">
        <thead>
          <tr>
            <th>Layer</th>
            <th>Escrow (door ticket)</th>
            <th>ClearTitle (earning seat)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>What is protected</td>
            <td>Buyer payment until show night</td>
            <td>Seat NFT title + pending cuts + tip continuity</td>
          </tr>
          <tr>
            <td>Seller recall</td>
            <td>Off-platform recall still possible</td>
            <td>Owner check · 0 keys · epoch bump · expected fail</td>
          </tr>
          <tr>
            <td>Mid-transfer money</td>
            <td>Held by operator or contract until release</td>
            <td>Pending rebounds to buyer on buy_seat</td>
          </tr>
          <tr>
            <td>Proof before buy</td>
            <td>Listing / PDF check</td>
            <td>Diligence packet · PROVABLY CLEAN</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
