# Threat model — ClearTitle

Written before implementation. Each row maps to a Transfer Lab button and/or automated test.

| ID | Attack | Defense | Test |
| --- | --- | --- | --- |
| T1 | Keep full-access key on vault after sale | Vault never had FA keys (`access_key_count = 0`) | `keys_empty_after_mint` |
| T2 | Keep function-call key minted pre-sale | Sale bumps `key_epoch`; Lab old-owner fail | `old_owner_withdraw_fails_after_sale` |
| T3 | Drain during settlement | `SETTLING` / `LISTED` block withdraw | `list_blocks_claim_and_sig` |
| T4 | Front-run pending ticket cut | Pending bound to `token_id` → rebound to buyer | `sale_mid_payout_rebinds_pending` |
| T5 | Change chain-sig derivation | Fixed to vault account id | `continuity_hash_stable` |
| T6 | Hold pre-signed foreign tx, sell, broadcast | Epoch freeze refuses raw sign while listed | `held_sig_refused_while_listed` |
| T7 | Leave open raw sigs | Diligence FIX; listing blocked if open | diligence checks |
| T8 | Stale listing / double buy | `sync_nonce` | `stale_nonce_refunds` |
| T9 | Seller session on Member Room | Actor/RPC owner check every action | Member Room locked UI |
| T10 | Wash tickets | Flag → diligence FIX | wash lab |
| T11 | Registry reassign | Organizer-only mint; no reassign after mint | mint once |
| T12 | Indexer lag spoofs owner | UI uses in-engine / RPC owner | Member Room |
| T13 | Change seat BPS after sale | BPS set at mint, immutable on seat | create_club invariant |
| T14 | Reentrancy during ticket split | Credits applied synchronously in engine/contract | ticket split tests |

## Trust assumptions

- Organizer can pause ticket sales.
- Demo UI uses the shared SDK engine (same invariants as Vitest).
- Rust contract unit tests prove the on-chain state machine under near-sdk.
