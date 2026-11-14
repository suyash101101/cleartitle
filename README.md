# CleanDeed

**Sell the seat. Keep nothing. Ticket money follows the buyer.**

CleanDeed is on-chain **title insurance** for memberships that earn — the policy layer any venue attaches. Deploy once, create any club, mint founding seat NFTs with keyless vaults that take a cut of every ticket, and sell seats mid-payout without the seller keeping a key, a pending cut, or a held signature.

| | |
| --- | --- |
| Track | `nfts` only — title insurance for earning seat NFTs |
| Stack | NEAR · Rust contract · TypeScript SDK · Next.js |
| Repo | https://github.com/suyash101101/QuitClaim |
| Live | https://quitclaim.vercel.app |
| Specimen contract | [`cleartitle562464.testnet`](https://explorer.testnet.near.org/accounts/cleartitle562464.testnet) |
| SDK | [`packages/sdk`](packages/sdk) · `@quitclaim/sdk` |

## Verify

1. `pnpm install && pnpm verify:hostile` — SDK heist + **live explorer hash re-check**
2. Open Live → **Club Console** → create your venue (any club id, price, BPS, seat kinds).
3. Evaluate claims against [`/verify`](https://quitclaim.vercel.app/verify) and explorer receipts in `apps/web/src/lib/evidence.ts`.

## Do X → see Y

| Do | See |
| --- | --- |
| Console (Live) → Create venue | Signed `create_club` + `mint_seats` |
| Box office → Buy ticket | Signed `buy_ticket` · deposit = on-chain price |
| Inventory → seat → List | Encumbrance LISTED · FREEZE · nonce |
| Diligence Re-read | **PROVABLY CLEAN** (or FIX) |
| Buyer → Buy mid-payout | Pending → REBOUND_TO_BUYER |
| Lab → Old owner withdraw | Expected fail · `not current owner` |
| `pnpm heist` | SDK mid-payout heist + live RPC hash verify |
| `/verify` | Claim ↔ method ↔ test matrix |
| `/proof` | Live RPC + explorer evidence JSON |

## Specimen venues (testnet)

`list_clubs` returns **nearnight** + **dayfest** on [`cleartitle562464.testnet`](https://explorer.testnet.near.org/accounts/cleartitle562464.testnet).

## Architecture

**FossFLOW** (full E2E):

![CleanDeed E2E mid-payout flow](docs/diagrams/e2e-flow.png)

**Excalidraw** stack:

![CleanDeed complete architecture](docs/diagrams/quitclaim-architecture.png)

**Excalidraw** Ada / Priya:

![Ada and Priya demo flows](docs/diagrams/ada-priya-architecture.png)

Sources: [`fossflow-e2e.json`](docs/diagrams/fossflow-e2e.json) · [`quitclaim-architecture.excalidraw`](docs/diagrams/quitclaim-architecture.excalidraw) · [`ada-priya-architecture.excalidraw`](docs/diagrams/ada-priya-architecture.excalidraw)

## Contract

Source [`contracts/cleartitle`](contracts/cleartitle). One CleanDeed contract hosts many venues (`club_id`). Each venue has its own ticket price, BPS split, seat kinds, and founding seats.

| Method | Role |
| --- | --- |
| `create_club` / `mint_seats` / `set_paused` | Organizer setup · BPS must sum to 10000 |
| `buy_ticket` | Fan payment · treasury + per-seat cuts |
| `claim_payout` | Owner moves vault balance into PENDING |
| `list_seat` / `delist_seat` / `buy_seat` | LISTED freeze · sign-epoch bump · CLEAN gate · REBOUND_TO_BUYER |
| `offer_lease` / `take_lease` / `settle_lease` | Time-boxed seat-cut lease |
| `withdraw` / `request_raw_sign` | Owner-only · refused while LISTED/SETTLING or after ownership flip |
| `list_seats` / `list_clubs` / `diligence` / `get_lease` | Views for inventory, CLEAN / FIX, lease |

## Why CleanDeed

- **Mid-payout ownership.** Pending cuts rebound to the buyer. Seller recall withdraw fails on chain.
- **Diligence stamp.** Named on-chain checks unlock buy. Same view for SDK and UI.
- **Keyless vaults.** `access_key_count === 0` after mint. Epoch freeze while listed blocks held raw sign.
- **Any venue.** Create any club_id, ticket price, and seat kinds without forking.
- **Shippable SDK.** `QuitClaimClient` binds your contract; encode wallet calls without the web UI.

## Use the SDK

```bash
pnpm --filter @quitclaim/sdk test
QUITCLAIM_CONTRACT_ID=your.contract.testnet QUITCLAIM_LIVE_RPC=1 pnpm --filter @quitclaim/sdk test
```

```ts
import { QuitClaimClient, createWorld, createVenue } from "@quitclaim/sdk";

const qc = new QuitClaimClient({
  contractId: "your-cleandeed.testnet",
  network: "testnet",
  clubId: "dayfest",
});
await qc.listSeats();
const buyTicket = await qc.encodeBuyTicket();

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

## Quick start

```bash
export PATH="$PWD/.tools/bin:$PATH"
pnpm install
pnpm --filter @quitclaim/sdk test
pnpm --filter @quitclaim/web dev
```

Copy [`apps/web/.env.example`](apps/web/.env.example) and set `NEXT_PUBLIC_CONTRACT_ID`.

## License

MIT
