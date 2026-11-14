# QuitClaim

**Sell the seat. Keep nothing. Ticket money follows clear title.**

On-chain title insurance for memberships that earn. Demo world: **Nearnight Live**. Founding seat NFTs each own a keyless vault that receives a cut of every ticket, and can be sold mid-payout without the seller keeping a key, a dime of pending cut, or a held signature.

| | |
| --- | --- |
| Tracks | `nfts` (primary) · `business` (organizer console + SDK) |
| Stack | NEAR · Rust contract · TypeScript SDK · Next.js |
| Repo | https://github.com/suyash101101/QuitClaim |
| Live | https://web-khaki-iota-17.vercel.app |
| Testnet contract | [`cleartitle562464.testnet`](https://explorer.testnet.near.org/accounts/cleartitle562464.testnet) |
| SDK | [`packages/sdk`](packages/sdk) · [`@cleartitle/sdk`](packages/sdk/README.md) |

## Verify

1. `pnpm install && pnpm verify:all`
2. Open Live app → **Club Console** (wallet + RPC). Preview is for local scenario clicks only.
3. Evaluate claims against `/verify` and explorer receipts in `apps/web/src/lib/evidence.ts`.

## Do X → see Y

| Do | See |
| --- | --- |
| Console (Live) | RPC club + founding seats |
| Box office → Buy ticket | Signed `buy_ticket` · explorer hash |
| Seat #3 → List (owner) | Encumbrance LISTED · FREEZE · nonce |
| Diligence Re-read | **PROVABLY CLEAN** (or FIX) |
| Buyer → Buy mid-payout | Pending → REBOUND_TO_BUYER |
| Lab → Old owner withdraw | Expected fail · `not current owner` |
| `/verify` | Claim ↔ method ↔ test matrix |
| `/proof` | Live RPC + explorer evidence JSON |

## Architecture

**FossFLOW** (full E2E):

![QuitClaim E2E mid-payout flow](docs/diagrams/e2e-flow.png)

**Excalidraw** stack:

![QuitClaim complete architecture](docs/diagrams/quitclaim-architecture.png)

**Excalidraw** Ada / Priya:

![Ada and Priya demo flows](docs/diagrams/ada-priya-architecture.png)

Sources: [`fossflow-e2e.json`](docs/diagrams/fossflow-e2e.json) · [`quitclaim-architecture.excalidraw`](docs/diagrams/quitclaim-architecture.excalidraw) · [`ada-priya-architecture.excalidraw`](docs/diagrams/ada-priya-architecture.excalidraw)

## Contract

Deployed testnet: [`cleartitle562464.testnet`](https://explorer.testnet.near.org/accounts/cleartitle562464.testnet) · source [`contracts/cleartitle`](contracts/cleartitle).

Nearnight Live seats are NEP-171 deeds bound to keyless vaults (`seat-N.<contract>`). Ticket revenue splits by BPS into those vaults plus club treasury. A seat can be listed and sold while a payout is still pending; pending cuts stay bound to `token_id` and rebound to the buyer.

| Method | Role |
| --- | --- |
| `create_club` / `mint_seats` / `set_paused` | Organizer setup · BPS must sum to 10000 |
| `buy_ticket` | Fan payment · treasury + per-seat cuts |
| `claim_payout` | Owner moves vault balance into PENDING |
| `list_seat` / `buy_seat` | LISTED freeze · sale with `sync_nonce` · REBOUND_TO_BUYER |
| `withdraw` / `request_raw_sign` | Owner-only · refused while LISTED/SETTLING or after ownership flip |
| `diligence` | View: keys=0 · epoch · continuity · raw sigs · pending · wash · nonce → CLEAN or FIX |

Seat encumbrance: `FREE → LISTED → SETTLING → FREE(buyer)`. Payout: `PENDING → SETTLED` or `REBOUND_TO_BUYER`.

## Why QuitClaim

- **Mid-payout clear title:** Pending cuts rebound to the buyer. Seller recall withdraw fails on chain.
- **Diligence stamp:** Six named checks unlock buy. Same view for SDK and UI.
- **Keyless vaults:** `access_key_count === 0` after mint. Epoch freeze while listed blocks held raw sign.
- **Shippable SDK:** `createClub → list → buy → diligence CLEAN` without the web UI.
- **Honest roadmap:** NEP-141 USDC tickets and intent-routed door fees are labeled roadmap.

## Real vs simulated

| Layer | Status |
| --- | --- |
| Domain engine (`packages/sdk`) | Real state machine · Vitest · Preview UI |
| NEAR helpers (`packages/sdk` near.ts) | Real JSON-RPC views · wallet encode |
| Rust contract | near-sdk unit tests · deployed testnet |
| Web Live | Wallet buy_ticket / list_seat / buy_seat · RPC diligence |
| Web Preview | Local scenario engine |
| Chain Signatures | Live derive on testnet · MPC tip spend is roadmap |
| Ticket denomination | Testnet yocto stand-in · USDC NEP-141 roadmap |

## Use the SDK

```bash
pnpm --filter @cleartitle/sdk test
QUITCLAIM_LIVE_RPC=1 pnpm --filter @cleartitle/sdk test
```

```ts
import {
  seedDemoNight,
  listSeat,
  buySeat,
  runDiligence,
  viewDiligence,
  encodeListSeat,
} from "@cleartitle/sdk";

const world = seedDemoNight();
const nonce = listSeat(world, "ada.near", "3", 100);
buySeat(world, "priya.near", "3", 100, nonce);
console.log(runDiligence(world, "3").verdict); // PROVABLY CLEAN

await viewDiligence("3");
encodeListSeat("3", "100");
```

Full API: [`packages/sdk/README.md`](packages/sdk/README.md).

## Quick start

```bash
export PATH="$PWD/.tools/bin:$PATH"
pnpm install
pnpm --filter @cleartitle/sdk test
pnpm --filter @cleartitle/web dev
```

Open http://localhost:3456 (or the port Next prints).

```bash
cd contracts/cleartitle && cargo test
pnpm verify:all
pnpm evidence:refresh
```

Copy [`apps/web/.env.example`](apps/web/.env.example) to bind `NEXT_PUBLIC_CONTRACT_ID`.

## Proof commands

```bash
pnpm test:unit
pnpm evidence
pnpm test:hostile
pnpm test:e2e:smoke
cd contracts/cleartitle && cargo test
```

## Repository layout

```
cleartitle/
  packages/sdk     engine + NEAR view/encode + Vitest
  apps/web         Next.js Live + Preview UI
  contracts/       near-sdk Rust
  scripts/         evidence, hostile, diagram export
  docs/            threat model, economics, diagrams
```

## Non-goals

- Mainnet club factory
- Intent-routed any-token tickets (roadmap)
- MPC tip spend beyond derive (roadmap)
- Naming or ranking other NFT-track submissions

## License

MIT
