# AGENTS.md — QuitClaim

- Product: title insurance for ticket-earning seat NFTs. Nearnight is one specimen venue; the SDK/contract are multi-venue.
- Do **not** name competitor projects in code, UI, README, commits, or demos.
- Live path binds `NEXT_PUBLIC_CONTRACT_ID` via `QuitClaimClient` — never hardcode the demo account in new call sites.
- Do **not** use em dashes in user-facing copy or README.
- Shared logic lives in `packages/sdk`. Sync to `apps/web/src/sdk` via `pnpm sync:sdk`.
- **Live** mode (default): wallet + RPC. **Preview**: scenario engine / Film ready only.
- Every `/verify` claim needs a Vitest name under `packages/sdk/tests`.
- Evidence hashes in `apps/web/src/lib/evidence.ts` must be real base58 txs (gate in `scripts/evidence.mjs`).
- Visual direction: parchment desk-grid, ink black, stage amber. No purple-on-white, no Inter default, no competitor name-drops.
- Prefer red→green tests before UI polish. `pnpm verify:all` before calling a wave done.
