# Judges — CleanDeed

**One-liner:** Sell the seat. Keep nothing. Pending ticket money follows clean title on NEAR.

**Submit name:** CleanDeed · track **`nfts` only**  
**Live:** https://quitclaim.vercel.app  
**Repo:** https://github.com/suyash101101/QuitClaim  
**Contract:** [`cleartitle562464.testnet`](https://explorer.testnet.near.org/accounts/cleartitle562464.testnet) · venues `nearnight` + `dayfest`  
**Scale:** https://quitclaim.vercel.app/scale

## What to click (3 minutes)

1. **Home** — brand + refuse / rebound / gate.
2. **Club Console** — defaults to **Live** · RPC club · five-minute organizer path.
3. **Box Office** — signed `buy_ticket` (or Preview buy for film).
4. **Seat #3** — Live diligence RPC · List / Buy with fresh nonce (or Preview Film ready → List @ 100).
5. **Transfer Lab** — old owner withdraw / held-sig → expected fails with explorer receipts.
6. **/verify** — claim ↔ method ↔ test matrix + explorer receipts.
7. **/scale** — product path beyond the night.

## Proof commands

```bash
pnpm test:unit
cd contracts/cleartitle && cargo test
pnpm heist          # SDK story + live hash re-check
pnpm heist:live     # explorer refuses only (no wallet)
pnpm evidence
pnpm test:e2e:smoke
```

## Track

**`nfts` only** — title insurance for earning seat NFTs. Do not declare a second track.

## Why this wins the transfer threat

| Differentiator | What you see |
| --- | --- |
| Mid-payout rebound | Pending cut rebinds to buyer |
| Transfer Lab | Expected-fail explorer receipts |
| Diligence stamp | PROVABLY CLEAN before buy |
| Multi-venue | `list_clubs` → nearnight + dayfest |
| SDK | Same path in Vitest without the UI |
| Chain Signatures derive | BTC/SOL tips stable across sale |

Do not compare named rival projects. Score the threat model and receipts.
