"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@/lib/wallet";
import { getQuitClaimClient } from "@/lib/client";
import type { VenueSpec } from "@/sdk";

function parseBps(raw: string): number[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s));
}

/** Live organizer: create a venue + mint seats on the bound contract. */
export function VenueBootstrap() {
  const { accountId, createVenue, mintSeats } = useWallet();
  const client = useMemo(() => getQuitClaimClient(), []);
  const [clubId, setClubId] = useState("");
  const [name, setName] = useState("");
  const [ticketPrice, setTicketPrice] = useState("10");
  const [seatBps, setSeatBps] = useState("2000,2000,2000,2000,2000");
  const [treasuryBps, setTreasuryBps] = useState("0");
  const [royaltyBps, setRoyaltyBps] = useState("500");
  const [kinds, setKinds] = useState("ga,lounge,box,vip,press");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!accountId) {
      setStatus("Connect an organizer wallet first");
      return;
    }
    setBusy(true);
    setStatus("Creating venue…");
    try {
      const bps = parseBps(seatBps);
      const kindIds = kinds
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const spec: VenueSpec = {
        clubId: clubId.trim().toLowerCase(),
        name: name.trim(),
        organizer: accountId,
        ticketPrice: Number(ticketPrice),
        seatBps: bps,
        treasuryBps: Number(treasuryBps),
        royaltyBps: Number(royaltyBps),
        seatKinds: kindIds.map((id) => ({ id, label: id, blurb: "" })),
      };
      const createHash = await createVenue(spec);
      setStatus(`create_club ok · ${createHash} · minting…`);
      const mintHash = await mintSeats(spec.clubId);
      setStatus(`Venue live · mint ${mintHash} · ${client.accountUrl()}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel" aria-label="Create venue">
      <h3>
        <span className="badge rpc">Live</span> Create your venue
      </h3>
      <p className="meta" style={{ marginBottom: "0.85rem" }}>
        Deploys a club on <span className="mono">{client.contractId}</span>. Ticket price is the
        on-chain deposit (smallest unit). BPS must sum to 10000.
      </p>
      <div className="grid-2" style={{ gap: "0.75rem" }}>
        <label className="meta">
          club_id
          <input
            className="mono"
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            placeholder="my-venue"
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <label className="meta">
          name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Venue"
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <label className="meta">
          ticket_price
          <input
            className="mono"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <label className="meta">
          seat_bps (csv)
          <input
            className="mono"
            value={seatBps}
            onChange={(e) => setSeatBps(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <label className="meta">
          treasury_bps
          <input
            className="mono"
            value={treasuryBps}
            onChange={(e) => setTreasuryBps(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <label className="meta">
          royalty_bps
          <input
            className="mono"
            value={royaltyBps}
            onChange={(e) => setRoyaltyBps(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <label className="meta" style={{ gridColumn: "1 / -1" }}>
          seat_kinds (csv ids)
          <input
            className="mono"
            value={kinds}
            onChange={(e) => setKinds(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
      </div>
      <div className="cta-row" style={{ marginTop: "0.85rem" }}>
        <button type="button" disabled={busy || !accountId} onClick={() => void run()}>
          {busy ? "Working…" : "Create club + mint seats"}
        </button>
      </div>
      {status && (
        <p className="meta mono" style={{ marginTop: "0.65rem" }}>
          {status}
        </p>
      )}
    </div>
  );
}
