import Link from "next/link";

/** 30-second judge cheat sheet — what to click, what to expect. */
export function JudgeCheatSheet() {
  return (
    <aside className="judge-cheat" aria-label="Judge cheat sheet">
      <p className="chapter-kicker">Judge cheat sheet · 30s</p>
      <ol className="judge-cheat-list">
        <li>
          <strong>Club → Judge Run</strong>
          <span className="meta"> auto seat → lab → verify · 6/6 stamps</span>
        </li>
        <li>
          <strong>Lab · Seller recall</strong>
          <span className="meta"> EXPECTED FAIL · explorer receipt</span>
        </li>
        <li>
          <strong>Title #3</strong>
          <span className="meta"> PROVABLY CLEAN · 0 keys · tip continuity</span>
        </li>
        <li>
          <strong>Member #3</strong>
          <span className="meta"> LOCKED until cast = RPC owner</span>
        </li>
      </ol>
      <div className="judge-cheat-ctas">
        <Link className="pin-link" href="/console">
          Start Judge Run →
        </Link>
        <Link className="pin-link" href="/verify">
          /verify matrix →
        </Link>
      </div>
    </aside>
  );
}
