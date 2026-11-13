# Evidence map

| Claim | Test | Runner |
| --- | --- | --- |
| Ticket BPS split | `ticket_splits_treasury_and_seats` | `pnpm test:unit` + Rust `ticket_splits_treasury_and_seats` |
| 0 access keys | `keys_empty_after_mint` | SDK + Rust |
| Mid-payout rebound | `sale_mid_payout_rebinds_pending` | SDK + Rust + Lab scenario |
| Held-sig refuse | `held_sig_refused_while_listed` | SDK + Rust + Lab |
| Old owner blocked | `old_owner_withdraw_fails_after_sale` | SDK + Rust + Lab |
| Diligence CLEAN | `diligence_clean_when_healthy` | SDK + Rust + UI stamp |
| Continuity hash | `continuity_hash_stable` | SDK |
| BPS invariant | `bps_sum_10000_and_immutable` | SDK + Rust |

Re-check: `pnpm evidence` · `pnpm test:hostile` · `pnpm test:e2e:smoke`
