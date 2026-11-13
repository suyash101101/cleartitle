"use client";

import { useEffect, useState } from "react";
import { CONTRACT_ID, EXPLORER, viewMethod } from "@/lib/near";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BlurFade } from "@/components/magicui/blur-fade";

type Club = {
  name: string;
  tickets_sold: number;
  treasury_balance: number;
  organizer: string;
};

type Diligence = {
  verdict: string;
  checks: { id: string; pass: boolean; detail: string }[];
};

export function TestnetPanel() {
  const [club, setClub] = useState<Club | null>(null);
  const [diligence, setDiligence] = useState<Diligence | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const c = await viewMethod<Club>("get_club", {});
      const d = await viewMethod<Diligence>("diligence", { token_id: "3" });
      setClub(c);
      setDiligence(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <BlurFade delay={0.1}>
      <div className="panel" style={{ marginTop: "1.5rem" }}>
        <BorderBeam duration={12} size={70} colorFrom="#1B6EF3" colorTo="#0C8C6E" />
        <h3>Live testnet</h3>
        <p className="meta mono">
          {CONTRACT_ID} ·{" "}
          <a href={`${EXPLORER}/accounts/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
            explorer
          </a>
        </p>
        <button type="button" className="ghost" onClick={refresh} disabled={loading} style={{ marginTop: "0.75rem" }}>
          {loading ? "Reading…" : "Refresh RPC"}
        </button>
        {err && <p className="meta" style={{ color: "var(--color-warn)" }}>{err}</p>}
        {club && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="meta">Tickets sold</p>
              <p className="font-display text-3xl font-bold">
                <NumberTicker value={club.tickets_sold} />
              </p>
            </div>
            <div>
              <p className="meta">Treasury</p>
              <p className="font-display text-3xl font-bold">
                <NumberTicker value={club.treasury_balance} />
              </p>
            </div>
            <div>
              <p className="meta">{club.name}</p>
              <p className="meta mono mt-1">{club.organizer}</p>
            </div>
          </div>
        )}
        {diligence && (
          <p style={{ marginTop: "0.85rem" }}>
            Seat #3 ·{" "}
            <span className={`badge ${diligence.verdict.includes("CLEAN") ? "ok" : "warn"}`}>
              {diligence.verdict}
            </span>
          </p>
        )}
      </div>
    </BlurFade>
  );
}
