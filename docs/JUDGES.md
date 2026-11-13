# Judges — ClearTitle

**One-liner:** Sell the seat. Keep nothing. Ticket money follows clear title.

**Live:** https://web-khaki-iota-17.vercel.app  
**Repo:** https://github.com/suyash101101/cleartitle

## What to click (3 minutes)

1. **Home** — brand + problem.  
2. **Console → Load demo night** — Nearnight Live seeded with Seat #3 pending.  
3. **Box Office → Buy ticket** — live BPS split animation.  
4. **Seat #3** — 0 keys · continuity BTC/SOL · Diligence **PROVABLY CLEAN**.  
5. Act as **ada** → List @ 100 → act as **priya** → **Buy mid-payout**.  
6. **Transfer Lab** — old owner withdraw / held-sig → expected fails.  
7. **/verify** — claim ↔ method ↔ test matrix.

## Proof commands

```bash
pnpm test:unit          # 13 SDK tests
cd contracts/cleartitle && cargo test   # 7 Rust tests
pnpm evidence
pnpm test:hostile
pnpm test:e2e:smoke
```

## Track

Declare **`nfts` only** (optional `social` only if named-club story is used).
