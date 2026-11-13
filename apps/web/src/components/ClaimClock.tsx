/** Claim windows expire. Clear title does not. */
export function ClaimClock() {
  return (
    <aside className="claim-clock" aria-label="Claim window">
      <p className="chapter-kicker">After the door</p>
      <div className="claim-clock-grid">
        <div className="claim-clock-col theirs">
          <p className="meta">Timed escrow</p>
          <strong className="claim-clock-time">48h</strong>
          <p>Claim window. Then money releases. Door fee only.</p>
        </div>
        <div className="claim-clock-col ours">
          <p className="meta">QuietTitle</p>
          <strong className="claim-clock-time forever">∞</strong>
          <p>Title stays clear on every future cut. Pending rebounds. No expiry.</p>
        </div>
      </div>
      <p className="meta claim-clock-foot">
        Escrow ends when the show ends. An earning seat still gets paid next week.
      </p>
    </aside>
  );
}
