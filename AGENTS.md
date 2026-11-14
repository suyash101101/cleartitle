# AGENTS.md — CleanDeed

- Product: title insurance for ticket-earning seat NFTs. Any venue shape via `club_id`.
- Do **not** name competitor projects in code, UI, README, commits, or demos.
- Live path binds `NEXT_PUBLIC_CONTRACT_ID` via `CleanDeedClient`. Prefer `QUITCLAIM_*` env names.
- Shared logic lives in `packages/sdk`. Sync to `apps/web/src/sdk` via `pnpm sync:sdk`.
