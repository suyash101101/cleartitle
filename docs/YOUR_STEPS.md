# What you need to do (minimal)

I’ve already done the heavy lifting on-chain. Here’s what **only you** still need:

## Required for hackathon submit

1. **Film ≤100s demo** (your voice) — use https://web-khaki-iota-17.vercel.app or local `pnpm dev`.  
   Flow: Start demo night → ticket split → Seat #3 diligence → mid-payout buy → Transfer Lab fails → `/verify`.  
   Also open the **Live testnet** panel on the home page (real RPC).
2. **Submit** on the hackathon form: repo + video + track `["nfts"]`.  
3. **Optional:** X post with `@NEARProtocol` `#NEARHackathon`.

## Optional (only if we add wallet signing in the UI)

4. Install a **testnet** wallet (Meteor / HOT / MyNearWallet), open the app, click Connect, Approve txs.  
   - No mainnet money.  
   - Deployer/faucet account already exists for scripts.

## You do NOT need

- Fund anything from mainnet  
- Create API keys for the current demo  
- Deploy the contract (already live)  
- Paste private keys into chat or Vercel  

## Already done from my side

| Item | Detail |
| --- | --- |
| Testnet account | `cleartitle562464.testnet` (faucet) |
| Contract deploy + `new` | https://explorer.testnet.near.org/transactions/WXRUUPjAtyKuUGFkDy54QxYmF2NxbHLnfkqpcpPmE1q |
| `create_club` | https://explorer.testnet.near.org/transactions/28d8GWcvGXBmKt9QznaNYzKJroKyrez5heDVTvAG6PBo |
| `mint_seats` | https://explorer.testnet.near.org/transactions/BWYsnQvo3tNikB88uJHQN4LVBPbPhWKmjHKtjvQdN8J5 |
| `buy_ticket` (split on-chain) | https://explorer.testnet.near.org/transactions/G93TQ94JjFC99wkXh4uXhvkkGkXbRXztRL6YjTxwVAd6 |
| Diligence on-chain | Seat #3 → **PROVABLY CLEAN** via RPC |

## Still on me (continuing)

- Wire `@hot-labs/near-connect` so *you* can click Approve in a browser wallet  
- Point Lab buttons at real explorer fails (not only `lab://` demo hints)  
- Chain Sig derive continuity against `v1.signer-prod.testnet`  
- Redeploy UI with testnet panel + env `NEXT_PUBLIC_CONTRACT_ID`
