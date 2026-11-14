# QuitClaim

**Sell the seat. Keep nothing. Ticket money follows clear title.**

QuitClaim is on-chain title insurance for memberships that earn. Deploy the contract, create your venue, mint founding seat NFTs with keyless vaults that take a cut of every ticket, and sell seats mid-payout without the seller keeping a key, a pending cut, or a held signature.

| | |
| --- | --- |
| Tracks | `nfts` (primary) · `business` (organizer console + SDK) |
| Stack | NEAR · Rust contract · TypeScript SDK · Next.js |
| Repo | https://github.com/suyash101101/QuitClaim |
| Live | https://cleartitle-psi.vercel.app |
| Testnet contract | [`cleartitle562464.testnet`](https://explorer.testnet.near.org/accounts/cleartitle562464.testnet) |
| SDK | [`packages/sdk`](packages/sdk) · `@cleartitle/sdk` |

## Verify

1. `pnpm install && pnpm verify:all`
2. Open Live → **Club Console** (wallet + RPC). Create a venue or use the specimen.
3. Evaluate claims against [`/verify`](https://cleartitle-psi.vercel.app/verify) and explorer receipts in `apps/web/src/lib/evidence.ts`.

## Do X → see Y

| Do | See |
| --- | --- |
| Console (Live) → Create venue | Signed `create_club` + `mint_seats` |
| Box office → Buy ticket | Signed `buy_ticket` · deposit = on-chain price |
| Seat → List (owner) | Encumbrance LISTED · FREEZE · nonce |
| Diligence Re-read | **PROVABLY CLEAN** (or FIX) |
| Buyer → Buy mid-payout | Pending → REBOUND_TO_BUYER |
| Lab → Old owner withdraw | Expected fail · `not current owner` |
| `/verify` | Claim ↔ method ↔ test matrix |
| `/proof` | Live RPC + explorer evidence JSON |

## Architecture

**FossFLOW** (full E2E: people → Live UI → mid-payout → Lab → SDK/contract):

![QuitClaim E2E mid-payout flow](docs/diagrams/e2e-flow.png)

**Excalidraw** stack:

![QuitClaim complete architecture](docs/diagrams/quitclaim-architecture.png)

**Excalidraw** Ada / Priya (clear-title sale + mid-air attack fails):

![Ada and Priya demo flows](docs/diagrams/ada-priya-architecture.png)

Sources: [`fossflow-e2e.json`](docs/diagrams/fossflow-e2e.json) · [`quitclaim-architecture.excalidraw`](docs/diagrams/quitclaim-architecture.excalidraw) · [`ada-priya-architecture.excalidraw`](docs/diagrams/ada-priya-architecture.excalidraw) · [`quitclaim-claims.excalidraw`](docs/diagrams/quitclaim-claims.excalidraw)

## Contract

Deployed testnet: [`cleartitle562464.testnet`](https://explorer.testnet.near.org/accounts/cleartitle562464.testnet) · source [`contracts/cleartitle`](contracts/cleartitle).

One QuitClaim contract hosts many venues (`club_id`). Each venue has its own ticket price, BPS split, and founding seats. Seats are NEP-171 deeds bound to keyless vaults. Ticket revenue splits by BPS into those vaults plus club treasury. A seat can be listed and sold while a payout is still pending; pending cuts stay bound to `token_id` and rebound to the buyer.

| Method | Role |
| --- | --- |
| `create_club` / `mint_seats` / `set_paused` | Organizer setup · BPS must sum to 10000 |
| `buy_ticket` | Fan payment · treasury + per-seat cuts |
| `claim_payout` | Owner moves vault balance into PENDING |
| `list_seat` / `delist_seat` / `buy_seat` | LISTED freeze · sale with `sync_nonce` · REBOUND_TO_BUYER |
| `withdraw` / `request_raw_sign` | Owner-only · refused while LISTED/SETTLING or after ownership flip |
| `list_seats` / `list_clubs` / `diligence` | Views for inventory and CLEAN / FIX |

Seat encumbrance: `FREE → LISTED → SETTLING → FREE(buyer)`. Payout: `PENDING → SETTLED` or `REBOUND_TO_BUYER`.

## Why QuitClaim

- **Mid-payout clear title.** Pending cuts rebound to the buyer. Seller recall withdraw fails on chain.
- **Diligence stamp.** Named on-chain checks unlock buy. Same view for SDK and UI.
- **Keyless vaults.** `access_key_count === 0` after mint. Epoch freeze while listed blocks held raw sign.
- **Multi-venue ready.** Create any club_id, ticket price, and seat kinds without forking.
- **Shippable SDK.** `QuitClaimClient` binds your contract; encode wallet calls without the web UI.
- **Honest roadmap.** NEP-141 USDC tickets and intent-routed door fees are labeled roadmap.

## Real vs simulated

| Layer | Status |
| --- | --- |
| Domain engine (`packages/sdk`) | Real state machine · Vitest |
| `QuitClaimClient` | Real JSON-RPC views · wallet encode · env bind |
| Rust contract | near-sdk unit tests · multi-venue · testnet deploy |
| Web Live | Wallet create / buy_ticket / list / buy_seat · RPC diligence |
| Web Preview | Optional local scenario engine |
| Chain Signatures | Live derive on testnet · MPC tip spend is roadmap |
| Ticket denomination | On-chain deposit units · USDC NEP-141 roadmap |

## Use the SDK

```bash
pnpm --filter @cleartitle/sdk test
CLEARTITLE_CONTRACT_ID=your.contract.testnet QUITCLAIM_LIVE_RPC=1 pnpm --filter @cleartitle/sdk test
```

```ts
import { QuitClaimClient, createWorld, createVenue } from "@cleartitle/sdk";

const qc = new QuitClaimClient({
  contractId: "your-quitclaim.testnet", // required
  network: "testnet",
  clubId: "dayfest",
});

await qc.getClub();
await qc.listSeats();
const buyTicket = await qc.encodeBuyTicket(); // deposit = on-chain ticket_price

const world = createWorld(["you.near"]);
createVenue(world, {
  clubId: "dayfest",
  name: "Dayfest",
  organizer: "you.near",
  ticketPrice: 25,
  seatBps: [2500, 2500, 5000],
  treasuryBps: 0,
});
```

Full API: [`packages/sdk/README.md`](packages/sdk/README.md). Live console → **Create your venue** signs against `NEXT_PUBLIC_CONTRACT_ID`.

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
```

Copy [`apps/web/.env.example`](apps/web/.env.example) and set `NEXT_PUBLIC_CONTRACT_ID` to your deployment.

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
QuitClaim/
  packages/sdk     QuitClaimClient + engine + Vitest
  apps/web         Next.js Live + Preview UI
  contracts/       near-sdk Rust (multi-venue)
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
