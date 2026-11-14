# `@cleartitle/sdk`

QuitClaim client + domain engine for mid-payout seat NFTs on NEAR.

Plug this into your app: point at **your** contract, create **your** venue, sell tickets at **your** price, list/buy seats with diligence.

## Install

```bash
pnpm add @cleartitle/sdk
# workspace:
pnpm --filter @cleartitle/sdk test
```

Web app sync: `pnpm sync:sdk` copies sources into `apps/web/src/sdk`.

## Live client (production path)

```ts
import { QuitClaimClient } from "@cleartitle/sdk";

const ct = new QuitClaimClient({
  contractId: "your-quitclaim.testnet", // required — no silent demo fallback
  network: "testnet",
  clubId: "dayfest", // optional default venue
});

// Read
const club = await ct.getClub();
const seats = await ct.listSeats();
const dil = await ct.diligence("1");

// Encode wallet calls (sign with near-connect / wallet selector)
const create = ct.encodeCreateVenue({
  clubId: "dayfest",
  name: "Dayfest",
  organizer: "you.near",
  ticketPrice: 25, // on-chain deposit units
  seatBps: [2500, 2500, 5000],
  treasuryBps: 0,
  royaltyBps: 250,
  seatKinds: [
    { id: "ga", label: "GA", blurb: "General" },
    { id: "balcony", label: "Balcony", blurb: "Upper" },
    { id: "box", label: "Box", blurb: "Private" },
  ],
});
const mint = ct.encodeMintSeats("dayfest");
const buyTicket = await ct.encodeBuyTicket(); // deposit = on-chain ticket_price
const list = ct.encodeListSeat("1", "100");
const buy = ct.encodeBuySeat("1", ct.buyNonce(await ct.getSeat("1")), "100");
```

From env (Next / Node):

```ts
import { clientFromEnv } from "@cleartitle/sdk";

const ct = clientFromEnv(); // CLEARTITLE_CONTRACT_ID or NEXT_PUBLIC_CONTRACT_ID
```

| Env | Purpose |
| --- | --- |
| `CLEARTITLE_CONTRACT_ID` / `NEXT_PUBLIC_CONTRACT_ID` | Deployed contract (required) |
| `CLEARTITLE_NETWORK` / `NEXT_PUBLIC_NEAR_NETWORK` | `testnet` \| `mainnet` |
| `CLEARTITLE_CLUB_ID` / `NEXT_PUBLIC_CLUB_ID` | Default venue |
| `CLEARTITLE_RPC` / `NEXT_PUBLIC_NEAR_RPC` | RPC override |

`DEMO_TESTNET_CONTRACT` exists only as a named constant for the public specimen. The client never uses it unless you pass it yourself.

## Local engine (sim / tests)

```ts
import { createWorld, createVenue, listSeat, buySeat, runDiligence } from "@cleartitle/sdk";

const world = createWorld(["you.near", "buyer.near"]);
createVenue(world, {
  clubId: "dayfest",
  name: "Dayfest",
  organizer: "you.near",
  ticketPrice: 25,
  seatBps: [2500, 2500, 5000],
  treasuryBps: 0,
});
```

`seedDemoNight()` is an optional story preset for the film UI — not required for integration.

## Multi-venue

One contract hosts many `club_id`s. Each venue has its own ticket price, BPS split, and seats. Pass `clubId` on views/encodes or set it on the client with `withClub("dayfest")`.

## Chain-sig path previews

`deriveBtcAddress` / `deriveSolAddress` are deterministic SHA-256 → bech32/base58 path previews for continuity checks. They are not live MPC spends (roadmap).

## License

MIT
