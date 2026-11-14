# `@quitclaim/sdk`

QuitClaim client + domain engine for mid-payout seat NFTs on NEAR.

Point at your contract, create your venue, sell tickets at your price, list/buy seats with diligence.

## Install

```bash
pnpm add @quitclaim/sdk
# workspace:
pnpm --filter @quitclaim/sdk test
```

Web sync: `pnpm sync:sdk` copies sources into `apps/web/src/sdk`.

## Live client

```ts
import { QuitClaimClient } from "@quitclaim/sdk";

const qc = new QuitClaimClient({
  contractId: "your-quitclaim.testnet",
  network: "testnet",
  clubId: "dayfest",
});

const club = await qc.getClub();
const seats = await qc.listSeats();
const dil = await qc.diligence(seats[0].token_id);

const create = qc.encodeCreateVenue({
  clubId: "dayfest",
  name: "Dayfest",
  organizer: "you.near",
  ticketPrice: 25,
  seatBps: [2500, 2500, 5000],
  treasuryBps: 0,
  royaltyBps: 250,
  seatKinds: [
    { id: "ga", label: "GA", blurb: "General" },
    { id: "balcony", label: "Balcony", blurb: "Upper" },
    { id: "box", label: "Box", blurb: "Private" },
  ],
});
const mint = qc.encodeMintSeats("dayfest");
const buyTicket = await qc.encodeBuyTicket();
```

From env:

```ts
import { clientFromEnv } from "@quitclaim/sdk";
const qc = clientFromEnv(); // QUITCLAIM_CONTRACT_ID or NEXT_PUBLIC_CONTRACT_ID
```

## Local engine

```ts
import { createWorld, createVenue, listSeat, buySeat, runDiligence } from "@quitclaim/sdk";

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

`seedPreviewWorld()` is an optional local walkthrough helper. Live apps should start empty and load from chain.

## Multi-venue

One contract hosts many `club_id`s. Pass `clubId` on views/encodes or use `withClub("dayfest")`.

## License

MIT
