# ClearTitle

**Sell the seat. Keep nothing. Ticket money follows clear title.**

On-chain **title insurance** for memberships that earn. Demo world: **Nearnight Live** — a club that sells tickets; founding seat NFTs each own a keyless vault that receives a cut of every ticket, and can be sold mid-payout without the seller keeping a key, a dime of pending cut, or a held signature.

| | |
| --- | --- |
| Track | `nfts` |
| Stack | NEAR · Rust contract · TypeScript SDK · Next.js |
| Repo | https://github.com/suyash101101/cleartitle |

## Quick start

```bash
export PATH="$PWD/.tools/bin:$PATH"   # or: npm i -g pnpm
pnpm install
pnpm --filter @cleartitle/sdk test
pnpm --filter @cleartitle/web dev
```

Open http://localhost:3000

```bash
# Rust contract unit tests
cd contracts/cleartitle && cargo test

# Evidence + build gate
pnpm verify:all
```

## Do X → see Y

| Do | See |
| --- | --- |
| Console → Load demo night | Seat #3 owned by ada · pending payout ready |
| Box Office → Buy ticket | Live split into treasury + five seats |
| Seat #3 → List @ 100 (as ada) | Encumbrance LISTED · FREEZE |
| Diligence → Run | **PROVABLY CLEAN** stamp |
| Act as priya → Buy mid-payout | Pending → REBOUND_TO_BUYER · ada loses control |
| Transfer Lab → Old owner withdraw | Expected fail + explorer hint |
| /verify | Claim ↔ method ↔ test matrix |

## Real vs simulated

| Layer | Status |
| --- | --- |
| Domain engine (`packages/sdk`) | Real state machine — powers UI + Vitest |
| Rust contract (`contracts/cleartitle`) | Real near-sdk unit tests (ticket split, mid-payout, epoch freeze) |
| Web UI | Demo network using the shared SDK (same logic as tests) |
| Chain Signatures mainnet spend | Not in P0 — continuity hash + refuse-while-listed are proven in engine/contract |
| USDC NEP-141 | Demo uses numeric USDC units; contract uses attached deposit as stand-in |

## Architecture

```
cleartitle/
  packages/sdk     shared engine + VERIFY_CLAIMS
  apps/web         Next.js UI
  contracts/       near-sdk Rust
  scripts/         evidence, demo-night, hostile-mid-payout
  docs/            threat model, demo script, economics
```

## License

MIT
