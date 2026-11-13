# ClearTitle

**Sell the seat. Keep nothing. Ticket money follows clear title.**

On-chain **title insurance** for memberships that earn. Demo world: **Nearnight Live** — a club that sells tickets; founding seat NFTs each own a keyless vault that receives a cut of every ticket, and can be sold mid-payout without the seller keeping a key, a dime of pending cut, or a held signature.

| | |
| --- | --- |
| Track | `nfts` |
| Stack | NEAR · Rust contract · TypeScript SDK · Next.js |
| Repo | https://github.com/suyash101101/cleartitle |
| Live | https://web-khaki-iota-17.vercel.app |
| Testnet contract | [`cleartitle562464.testnet`](https://explorer.testnet.near.org/accounts/cleartitle562464.testnet) |

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
| Web UI | Demo engine for interactive story + **live RPC panel** reading testnet |
| Testnet contract | Deployed · club minted · ticket bought · diligence CLEAN on-chain |
| Wallet connect (near-connect) | Not wired yet — scripted txs signed with local faucet key |
| Chain Signatures MPC spend | Not yet — continuity hash proven in contract/engine |
| USDC NEP-141 | Numeric / yocto stand-in (ticket_price = 10 yocto on testnet) |

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
