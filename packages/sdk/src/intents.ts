/**
 * NEAR Intents / 1Click ticket-pay dry path.
 * Labeled honestly: dry:true never moves funds; live path is optional later.
 */

export type IntentTicketDryQuote = {
  dry: true;
  clubId: string;
  ticketPriceYocto: string;
  /** Human label for UI / demo. */
  label: string;
  /** What a real 1Click request would look like (not submitted). */
  requestPreview: {
    dry: true;
    amountIn: string;
    amountInAsset: "NEAR" | "USDC";
    recipientHint: string;
    note: string;
  };
  disclaimer: string;
};

export type QuoteTicketIntentOpts = {
  clubId: string;
  ticketPriceYocto: string | number | bigint;
  /** Deposit asset the fan would pay with (dry preview only). */
  amountInAsset?: "NEAR" | "USDC";
  contractId?: string;
};

/**
 * Build a dry:true Intents ticket quote for demo / box-office strip.
 * Does not call any network — safe for Preview and CI.
 */
export function quoteTicketIntentDry(opts: QuoteTicketIntentOpts): IntentTicketDryQuote {
  const ticketPriceYocto = String(opts.ticketPriceYocto);
  const asset = opts.amountInAsset ?? "NEAR";
  return {
    dry: true,
    clubId: opts.clubId,
    ticketPriceYocto,
    label: `Intents dry ticket · ${opts.clubId}`,
    requestPreview: {
      dry: true,
      amountIn: ticketPriceYocto,
      amountInAsset: asset,
      recipientHint: opts.contractId ?? "quitclaim-venue.near",
      note: "Seat title still settles only after NEAR buy_ticket + diligence on buy_seat",
    },
    disclaimer:
      "dry:true — no funds move. Live Intents settlement is optional; QuitClaim title stays on NEAR.",
  };
}

/**
 * Optional live probe against a 1Click-compatible endpoint.
 * Always returns dry:true unless QUIITCLAIM_INTENTS_LIVE=1 and fetch succeeds.
 */
export async function probeTicketIntent(
  opts: QuoteTicketIntentOpts & { endpoint?: string; fetchFn?: typeof fetch },
): Promise<IntentTicketDryQuote & { probed?: boolean; probeOk?: boolean }> {
  const base = quoteTicketIntentDry(opts);
  if (typeof process !== "undefined" && process.env.QUITCLAIM_INTENTS_LIVE !== "1") {
    return { ...base, probed: false };
  }
  const endpoint = opts.endpoint ?? "https://1click.chaindefuser.com/v0/quote";
  const fetchFn = opts.fetchFn ?? globalThis.fetch;
  try {
    const res = await fetchFn(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        dry: true,
        amountIn: base.requestPreview.amountIn,
        // Probe only — never submit a live swap from the SDK.
      }),
    });
    return { ...base, probed: true, probeOk: res.ok };
  } catch {
    return { ...base, probed: true, probeOk: false };
  }
}
