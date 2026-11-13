# `@cleartitle/sdk`

QuitClaim domain engine + thin NEAR helpers.

Use this package to model mid-payout seat sales locally, assert diligence, and call the same view methods the Live UI uses on testnet.

## Install (workspace)

```bash
pnpm install
pnpm --filter @cleartitle/sdk test
```

From the monorepo web app, sources sync into `apps/web/src/sdk` via `pnpm sync:sdk`.

## Quick start (engine)

```ts
import {
  seedDemoNight,
  listSeat,
  buySeat,
  runDiligence,
  labOldOwnerWithdraw,
} from "@cleartitle/sdk";

const world = seedDemoNight();
const nonce = listSeat(world, "ada.near", "3", 100);
buySeat(world, "priya.near", "3", 100, nonce);
console.log(runDiligence(world, "3").verdict); // PROVABLY CLEAN
console.log(labOldOwnerWithdraw(world, "ada.near", "3").reason);
```

## NEAR views (no wallet)

```ts
import { viewClub, viewSeat, viewDiligence, seatBuyNonce } from "@cleartitle/sdk";

const club = await viewClub();
const seat = await viewSeat("3");
const dil = await viewDiligence("3");
const nonce = seatBuyNonce(seat);
```

Optional live check (skipped in CI unless set):

```bash
QUITCLAIM_LIVE_RPC=1 pnpm --filter @cleartitle/sdk test
```

## Call encoding (wallet)

```ts
import { encodeBuyTicket, encodeListSeat, encodeBuySeat } from "@cleartitle/sdk";

encodeBuyTicket(); // buy_ticket + 10 yocto
encodeListSeat("3", "100");
encodeBuySeat("3", nonce, "100");
```

## Claims covered by Vitest

| Claim | Test |
| --- | --- |
| BPS sum 10000 | `bps_sum_10000_and_immutable` |
| Keys empty after mint | `keys_empty_after_mint` |
| Ticket split | `ticket_splits_treasury_and_seats` |
| Mid-payout rebound | `sale_mid_payout_rebinds_pending` |
| Old owner withdraw fails | `old_owner_withdraw_fails_after_sale` |
| Diligence CLEAN | `diligence_clean_when_healthy` |
| Continuity stable | `continuity_hash_stable` |
| Held-sig refused | `held_sig_refused_while_listed` |

## License

MIT
