# ClearTitle — PLAN.md

**One-line:** Sell the seat. Keep nothing. Ticket money follows clear title.

**Product category:** On-chain **title insurance** for memberships that earn.  
**Specimen (demo world):** A live club that sells tickets; founding **seat NFTs** each own a keyless wallet that automatically receives a cut of every ticket — and can be sold mid-payout without the seller keeping a dime, a key, or a held signature.

| | |
| --- | --- |
| **Primary track** | `nfts` — [NFTs That Do Something](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/10-nfts.md) |
| **Secondary** | `social` only if named-club + shared treasury story is real; else **`nfts` alone** |
| **Never declare** | `business` / `agents` / `security` / `open` stack (field leader `track_spam` trap) |
| **Deadline** | 2026-11-14T23:59:00Z |
| **Field** | ~739 submissions · ~63 `nfts` · podium ~81.5 · top ~84.9 field leader |
| **This file** | Sole plan. No staffing split. |
| **Status** | Plan only — **do not implement until explicitly told to build**. |

**Strategy:** Proof depth > feature sprawl.  
**Novelty:** Prompt’s *membership + tickets* example + **clear title as the product** (not field leader-lite AI company).  
**Build leverage:** Official NEAR agent skills + near-kit universal pattern + layered E2E tests + Impeccable/Taste/Vercel design skills + shadcn primitives (Astryx optional). Every P0 step has a failing test first.

---

## 1. The idea — comprehensive product vision

### 1.1 What ClearTitle is

ClearTitle is two layers:

1. **Club Night (the world you feel)** — create a club, mint founding seats, sell tickets, watch money split live into seat wallets and a club treasury.  
2. **Clear Title (the product you prove)** — Diligence Packet, Transfer Lab, Sign Record, mid-payout atomic sale, `/verify` — so a seat sale is *provably clean*.

Judges should leave saying:  
> “They didn’t just make an NFT wallet. They made **selling an earning membership** safe enough to watch someone attack it live.”

### 1.2 Why it exists (real use case)

**Problem:** Creator clubs, fan clubs, and event collectives sell memberships and tickets off-chain. When a founding seat is resold, the buyer cannot know if the seller kept admin access, a payout in flight, or a pre-signed drain.

**ClearTitle answer:** The seat *is* the wallet. Ticket cuts land in that wallet by contract. Sale moves ownership + pending money + Chain Sig control. Attacks fail on chain.

**Concrete world — “Nearnight Live”**
- Club sells **10 USDC** tickets to a show.  
- **5 founding seats** (NEP-171). Seat policy: each seat gets **10% of ticket revenue** into its own vault; club treasury keeps **50%**.  
- Seat #3 has BTC/SOL tip addresses for patrons who tip the seat holder cross-chain.  
- Ada lists Seat #3 while a **0.50 USDC ticket-cut payout is pending**.  
- Priya buys after Diligence shows **PROVABLY CLEAN**.  
- Pending cut settles to Priya. Ada’s withdraw fails in Transfer Lab. BTC address unchanged.

### 1.3 Full lifecycle (robust end-to-end)

```text
ORGANIZER                FANS                 SEAT HOLDER              BUYER                 ATTACKER/JUDGE
   |                       |                        |                     |                        |
 create_club               |                        |                     |                        |
 mint_seats (0 keys)       |                        |                     |                        |
 set ticket + BPS          |                        |                     |                        |
   |---- buy_ticket ------>|                        |                     |                        |
   |   split: treasury + seat cuts (events)         |                     |                        |
   |                       |                        | claim_payout        |                        |
   |                       |                        | (pending)           |                        |
   |                       |                        | list_seat (FREEZE)  |                        |
   |                       |                        |                     | open Diligence         |
   |                       |                        |                     | buy_seat mid-payout    |
   |                       |                        | X old controls      | owns seat+pending      |
   |                       |                        |                     |                        | Transfer Lab fails
   |                       |                        |                     |                        | /verify re-checks
```

### 1.4 Economic model (on-chain, readable)

| Knob | Meaning | Demo default |
| --- | --- | --- |
| `ticket_price` | USDC per ticket | 10 |
| `seat_bps[]` | Per-seat cut of each ticket in basis points | 5 seats × 1000 bps (10%) = 50% to seats |
| `treasury_bps` | Remainder to club treasury | 5000 bps (50%) |
| `max_seats` | Cap founding seats | 5 |
| `royalty_bps` | Optional cut to club on **seat resale** | 500 bps (5%) |
| `min_ticket` / pause | Safety | pause flag as kill switch |

**Invariants**
- `sum(seat_bps) + treasury_bps = 10000`.  
- Ticket booking only inside `ft_on_transfer` (no fake revenue).  
- Seat cut credited to **seat vault / pending queue bound to `token_id`**, never to seller’s personal account.  
- Seat resale does **not** change `seat_bps` (economics travel with the seat identity).

### 1.5 State machines (robustness)

**Seat encumbrance:** `FREE` → `LISTED` → `SETTLING` → `FREE` (new owner)  
While `LISTED` / `SETTLING`: no claims, no raw Chain Sig for shareholder drains, no NFT transfer outside sale path.

**Payout:** `NONE` → `PENDING` → `SETTLED` | `REBOUND_TO_BUYER` on mid-sale  
Pending always references `token_id`.

**Sign epoch:** increments on sale and/or when raw foreign-chain sign is requested under policy; listing blocked if unexpired dangerous raw sigs exist (field leader-class rule).

### 1.6 Wow moments (demo must hit ≥5)

1. **Live ticket split** — one ticket buy; UI animates USDC into treasury + each seat vault with event hashes.  
2. **0 keys badge** — explorer/`view_access_key_list` empty on seat vault.  
3. **Address continuity** — BTC/SOL shown before sale; identical after sale; control flipped.  
4. **Held-signature refuse** — attempt pre-sign drain while listed → on-chain error + explorer.  
5. **Mid-payout purchase** — pending cut flips to buyer in one breath.  
6. **Transfer Lab kill-shot** — old owner withdraw fails live.  
7. **PROVABLY CLEAN stamp** — full-screen diligence before buy.  
8. **`/verify` wall** — claim ↔ method ↔ test ↔ tx (field leader-grade judge candy).  
9. **Dynamic seat charter SVG** — metadata shows tickets accrued, owner, encumbrance (NEP-177 `media_hash`).  
10. **Optional P1:** pay for ticket with any token via Intents 1Click (`dry:true` or real test path — label honestly).

### 1.7 What we are not

- Not an AI company OS (field leader).  
- Not a 16-chain wallet NFT only (field leader).  
- Not DAO governance seats only (membership/field leader).  
- Not JPEG membership.  
- Not regenerating addresses on sale.  
- Not loans / Agent Market / TEE jailbreak main stage.

---

## 2. Prompt fidelity + novelty (aligned)

### 2.1 Official NFT prompt map

| Prompt piece | ClearTitle |
| --- | --- |
| Membership NFT + own wallet | Seat NFT → `seat-<id>.<club>.near` keyless vault |
| Club treasury share | `treasury_bps` + treasury account/balance |
| Event ticket sales cut | `buy_ticket` → per-seat `ticket_cut` |
| Sell moves wallet/balance/rights | Atomic `list_seat` / `buy_seat` |
| Gated holder page | Member Room (RPC `nft_token`) |
| History earned/paid/holders | Per-seat ledger + holder epochs |
| Sale mid-payout tests | Hero demo + workspaces + hostile script |
| Threat model first | `THREAT_MODEL.md` before code |
| Dynamic NFTs | SVG charter |
| TLA note | Named club P1 · TLA rental P2 |

### 2.2 Novelty statement (non-average)

Average AI idea: “NFT company with a vault.”  
**Our idea:** “**Title insurance** for **ticket-earning memberships** — with a live attack lab.”

We keep the prompt’s specimen (club/tickets) so we don’t look like we ignored the example, and we add a product category the field under-ships as a *hero*: clear title.

---

## 3. Competitive stance

| Rival | They own | We beat them by |
| --- | --- | --- |
| **field leader** | AI company OS, mainnet evidence mountain | Leaving AI lane; prompt-faithful seats+tickets; transfer-as-product; no track spam |
| **field leader** | Hostile mid-flight sale on service vaults | Mid-payout **as filmed climax** + Chain Sig CLEAN + Diligence + `/verify` |
| **field leader** | PROVABLY CLEAN multichain wallets | CLEAN for a **seat that earns tickets** + mid-payout + gated history |
| **field leader** | Playful NFT-as-account | Adversarial title + ticket economics |
| **field leader** | Membership governance | Per-seat money + tickets + Transfer Lab |

**Honest:** Contender if P0+P1 proof bar ships. Not a guaranteed 1st vs field leader’s mainnet wall.

---

## 4. Why NEAR (organizer-hero)

| Primitive | Role |
| --- | --- |
| Keyless accounts | Seat vaults with 0 access keys |
| NEP-171 | Seat deed |
| Sub-accounts | `seat-<id>.<club>.near` |
| NEP-141 `ft_transfer_call` | Tickets + seat buys |
| NEP-297 | Ticket/cut/sale history |
| NEP-177 | Living seat charter |
| Chain Signatures `v1.signer` / `v1.signer-prod.testnet` | Stable BTC/SOL/(EVM) per seat vault; distinct paths per chain |
| Sign Record + epoch freeze | Held-sig drain defense |
| Intents / 1Click | Any-token tickets (P1) |
| NEP-413 | Gated Member Room |
| TLA (stretch) | `nearnight.near` club name as NFT account |
| near-kit Sandbox / near-workspaces | Mid-payout must be green |

Delete NEAR → product dies. Good.

---

## 5. Threat model (T1–T14) — write `docs/THREAT_MODEL.md` first

| ID | Attack | Defense / demo | Automated test gate |
| --- | --- | --- | --- |
| T1 | Keep FA key on vault after sale | Vault never had FA keys | `keys_empty_after_mint` · Lab “0 keys” |
| T2 | Keep FC key minted pre-sale | Sale deletes/rotates; Lab fail | `old_owner_fc_key_gone` |
| T3 | Drain during settlement | Lock / transit; refund buyer on fail | `settling_blocks_withdraw` |
| T4 | Front-run pending ticket cut | Pending bound to `token_id` → buyer | **`sale_mid_payout_rebounds`** (hero) |
| T5 | Change Chain Sig derivation | Fixed to vault account id | `continuity_hash_stable` |
| T6 | Hold pre-signed BTC/SOL, sell, broadcast | Epoch freeze + CLEAN fail | `held_sig_refused_while_listed` |
| T7 | Leave approvals / open intents | Diligence FIX; clear/freeze on sale | `diligence_flags_open_intent` |
| T8 | Stale listing / double buy | sync_nonce; refund | `stale_nonce_refunds` |
| T9 | Seller session on Member Room | RPC owner every request | Playwright `member_room_locked` |
| T10 | Wash tickets from owner-funded accounts | Flag; exclude from CLEAN earnings | `wash_flag_excludes_earnings` |
| T11 | Registry deployer reassigns seats | Minimize powers; disclose trust | Doc + `no_reassign_after_mint` |
| T12 | Indexer lag spoofs owner | Prefer RPC | UI always RPC for ownership |
| T13 | Change seat_bps after sale to starve buyer | bps immutable per seat after mint | `bps_immutable_after_mint` |
| T14 | Sell seat while ticket split mid-callback | Reentrancy-safe credits; tests | `ticket_reentrancy_safe` |

Each T-row → Transfer Lab button and/or sandbox/workspaces test **before** UI polish for that surface.

---

## 6. Product surfaces (detailed)

### A. Club Console (organizer)
Create club · set ticket price + BPS · mint N seats · pause · view treasury · share club page.

### B. Box Office (fans)
Buy ticket (USDC; P1 any-token) · see live split visualization · ticket receipt event.

### C. Seat Page (public)
Charter SVG · 0-keys badge · BTC/SOL addresses · ledger · holders timeline · Diligence panel.

### D. Member Room (gated)
Claim payout · list/delist · continuity panel · policy view. Locked card if not owner.

### E. Transfer Lab (hero)
Buttons fire **real** failing txs: old withdraw · listed withdraw · held-sig · wash · mid-payout scenario runner. Explorer links mandatory.

### F. Diligence Packet
`PROVABLY CLEAN` | `FIX BEFORE BUY` with checklist: keys=0, epoch, continuity hash, open raw sigs, pending payouts, wash flags, listing sync_nonce.

### G. `/verify` + `evidence.mjs`
Homepage claims → contract method → test name → explorer. Script re-reads RPC.

---

## 7. Architecture

```text
cleartitle/
  contracts/
    club/         config, buy_ticket, treasury, pause, BPS invariants
    registry/     NEP-171 seats, mint→vault, list/buy, encumbrance, royalty
    vault/        ledger, pending payouts, claim, chain-sig, sign record, epoch
  apps/web/       Next.js App Router — club, box-office, seat, lab, diligence, verify, member-room
  packages/
    sdk/          typed near-kit Contract<> wrappers (shared by web + tests + scripts)
    ui/           design tokens + shared components (shadcn-based)
  scripts/        evidence.mjs, demo-night.mjs, hostile-mid-payout.mjs
  tests/
    unit/         Rust contract unit tests
    sandbox/      Vitest + near-kit Sandbox (primary integration)
    e2e/          Playwright journeys against next start + sandbox/testnet fixture
  docs/           THREAT_MODEL.md, DEMO_SCRIPT.md, JUDGES.md, EVIDENCE.md, ECONOMICS.md, DESIGN.md, PRODUCT.md
  .cursor/skills/ OR project skills via `npx skills add …`
  AGENTS.md       Cursor/Claude grounding (Astryx CLI / Vercel guidelines hooks)
  PLAN.md
```

### 7.1 Ticket buy (sequence)

```text
Fan ft_transfer_call(club, ticket_price, {action:"ticket"})
  → club ft_on_transfer
  → assert not paused; price match
  → credit treasury_bps
  → for each seat: credit seat vault or enqueue ticket_cut(token_id, amount)
  → emit NEP-297 TicketSold + SeatCut
```

### 7.2 Seat sale mid-payout (sequence)

```text
Holder list_seat(ask) → LISTED freeze
Buyer ft_transfer_call(registry, ask, {acquire, sync_nonce})
  → SETTLING lock
  → rebind all PENDING cuts/payouts to buyer ownership epoch
  → bump key_epoch; wipe seller authorities
  → nft to buyer; royalty to club; pay seller
  → FREE(buyer)
  → failure ⇒ full refund + resync path
```

### 7.3 Chain Signatures
Derivation on **seat vault id**; paths per chain (`bitcoin`, `solana`, `ethereum`); Sign Record before `sign`; continuity hash in Diligence/Lab; mainnet spend = P2 only.  
SDK: [`chainsig.js`](https://github.com/NearDeFi/ChainsigSDK) · MPC `v1.signer` / `v1.signer-prod.testnet`.

### 7.4 Universal code pattern (near-kit)

One feature function, three runners — **same logic**, different signer:

| Environment | Signer | Used by |
| --- | --- | --- |
| Sandbox tests | `Near({ network: sandbox })` | Vitest integration |
| Scripts / evidence | `privateKey` / FileKeyStore | `evidence.mjs`, demo |
| Browser | `fromHotConnect(NearConnector)` | apps/web |

```ts
// packages/sdk — write once
export async function buyTicket(near: Near, clubId: string, fanId: string) { … }
export async function listSeat(near: Near, …) { … }
export async function buySeatMidPayout(near: Near, …) { … }
```

Do **not** fork business logic between UI and tests. That is how mid-payout bugs hide.

---

## 8. Ecosystem use / skip

| Use | Skip |
| --- | --- |
| Intents/1Click (ticket any-token / dry quotes) | Agent Market |
| Chain Signatures + chainsig.js | NEAR AI Cloud / TEE main stage |
| NEP-171/141/177/297/413 | OutLayer (keyless vault instead) |
| TLA stretch for club name | Loans, PingPay, meme.cooking |
| Optional near.social club post (social secondary) | Track spam |
| near-kit + @hot-labs/near-connect | Deprecated `@near-wallet-selector/*` |
| Official `near/agent-skills` (minus AI Cloud) | Shade Agent Framework (deprecated) |

---

## 9. Demo script (≤100s — denser wow)

Human voice. No AI VO.

| t | Beat |
| --- | ---: |
| 0–12s | Problem: selling earning memberships is fakeable |
| 12–25s | Create Nearnight + mint seats · show **0 keys** |
| 25–40s | Buy ticket · **live split** into treasury + seats |
| 40–50s | Start seat payout · status **pending** |
| 50–60s | List · held-sign **refused** + explorer |
| 60–75s | Diligence CLEAN · **buy mid-payout** · pending → buyer |
| 75–90s | Lab: old withdraw **fails** · addresses **unchanged** |
| 90–100s | `/verify` flash · “Clear title.” |

X post: problem first · `@NEARProtocol` `#NEARHackathon` · video + repo.

---

## 10. Agent skills, repos, and workflow leverage

Research sources (Nov 2026): [docs.near.org/getting-started/tools-for-ai](https://docs.near.org/getting-started/tools-for-ai), [near/agent-skills](https://github.com/near/agent-skills), [agentskills.io](https://agentskills.io) / [agentskills/agentskills](https://github.com/agentskills/agentskills), [anthropics/skills](https://github.com/anthropics/skills), [skills.sh](https://www.skills.sh) / [aiticker.site/skills](https://aiticker.site/skills/), [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills), [pbakaus/impeccable](https://github.com/pbakaus/impeccable), [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [emilkowalski/skills](https://github.com/emilkowalski/skills), [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), [meta/astryx](https://github.com/facebook/astryx), [r-near/near-kit](https://github.com/r-near/near-kit), [kit.near.tools](https://kit.near.tools/dapp-workflow/testing).

### 10.1 Install block (run once at project root when building)

```bash
# NEAR official agent skills (organizer-aligned)
npx skills add near/agent-skills --skill near-smart-contracts
npx skills add near/agent-skills --skill near-kit
npx skills add near/agent-skills --skill near-dapp
npx skills add near/agent-skills --skill near-api-js
npx skills add near/agent-skills --skill near-intents
npx skills add near/agent-skills --skill near-cli-rs          # if present in pack
npx skills add near/agent-skills --skill near-contract-audit # if present in pack
# SKIP: near-ai-cloud (cut — not our track)

# Design / anti-slop (pick ONE primary art director; stack polish only)
npx impeccable install --providers=cursor --scope=project
npx skills add anthropics/skills --skill frontend-design
npx skills add anthropics/skills --skill webapp-testing
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add emilkowalski/skills                         # motion / interaction polish
# Optional landing-only (do NOT run alongside conflicting taste rules on app screens):
# npx skills add Leonxlnx/taste-skill --skill design-taste-frontend
# Optional design-system picker if stuck on palette/fonts:
# npx skills add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max

# Docs grounding for agents
# Cursor: add https://docs.near.org/llms.txt as a Docs source
# Optional: Docs MCP https://docs.near.org/mcp
# Optional NEAR MCP (local only — handles keys): nearai/near-mcp
```

### 10.2 Skill → ClearTitle job map

| Skill | When the agent must load it | ClearTitle use |
| --- | --- | --- |
| **near-smart-contracts** | Writing/editing Rust contracts | club/registry/vault, BPS invariants, reentrancy |
| **near-contract-audit** | After each contract milestone | Threat T1–T14 review + findings → tests |
| **near-kit** | Any TS chain I/O or sandbox test | Universal pattern, typed `Contract<>`, Sandbox |
| **near-dapp** | Next.js scaffold, wallet, RPC patterns | Club Console / Box Office / Member Room |
| **near-api-js** | Low-level txs if near-kit gap | Fallback; prefer near-kit |
| **near-cli-rs** | Deploy, view keys, faucet ops | Demo prep, 0-keys proof via CLI |
| **near-intents** | P1 any-token ticket | 1Click `dry:true` quotes first |
| **frontend-design** (Anthropic) | First visual pass / hero | Avoid Inter/purple-slop; subject-driven craft |
| **impeccable** | After UI exists | `/impeccable shape` → `critique` → `audit` → `polish` → `animate` → `harden` |
| **emilkowalski/skills** | Live split + Lab feedback | Easing, springs, when *not* to animate |
| **web-design-guidelines** (Vercel) | Pre-submit UI review | a11y, focus, forms, reduced-motion |
| **vercel-react-best-practices** | Perf / RSC / data fetching | Kill waterfalls on seat/ledger pages |
| **webapp-testing** (Anthropic) | Agent-driven Playwright checks | Screenshot recon → assert journeys |
| **design-taste-frontend** (optional) | Marketing landing only | Art-directed home; browser checker |
| **ui-ux-pro-max** (optional) | Picking palette/fonts once | Write into `DESIGN.md`, then stop |

**Rule:** One taste skill at a time. Impeccable + Taste conflict if both set art direction. Use **Taste (or frontend-design) once for landing**, then **Impeccable for product UI** (console, lab, diligence).

### 10.3 Repos & packages we will use

#### Must-use (P0)

| Repo / package | Why |
| --- | --- |
| [near/near-sdk-rs](https://github.com/near/near-sdk-rs) | Rust contracts |
| [cargo-near](https://github.com/near/cargo-near) | Build/ABI |
| [r-near/near-kit](https://github.com/r-near/near-kit) + `@near-kit/react` | Universal TS client + Sandbox + React hooks |
| [@hot-labs/near-connect](https://github.com/hot-dao/near-connect) | Wallet (Wallet Selector is **deprecated**) |
| [near/near-api-js](https://github.com/near/near-api-js) / `@near-js/*` | Crypto, types, NEP-413 as needed |
| Next.js 15/16 App Router + React 19 + TypeScript | Web app |
| Tailwind CSS v4 + **shadcn/ui** + Radix | Fast, accessible product UI |
| Vitest | Unit + sandbox runner |
| Playwright (`@playwright/test`) | Browser E2E journeys |
| Zod + React Hook Form | Forms (club create, list ask) |
| `motion` (Framer Motion) | Live split + Lab feedback |
| Lucide | Icons (sparse) |
| sonner / vaul (Emil) | Toasts / drawers for Lab results |

#### Should-use (P1)

| Repo / package | Why |
| --- | --- |
| [NearDeFi/ChainsigSDK](https://github.com/NearDeFi/ChainsigSDK) (`chainsig.js`) | BTC/SOL derive + sign |
| [@defuse-protocol/one-click-sdk-typescript](https://github.com/defuse-protocol/one-click-sdk-typescript) | Intents quotes (`dry: true`) |
| near-workspaces (JS or RS) | Alternate/hostile mid-payout harness if near-kit Sandbox gaps |
| [near/near-sandbox-rs](https://github.com/near/near-sandbox-rs) + near-api-rs | If Rust-side integration preferred for some tests |

#### Optional / evaluate (do not block P0)

| Repo | Why / caution |
| --- | --- |
| [meta/astryx](https://github.com/facebook/astryx) (`@astryxdesign/core`) | 150+ agent-friendly components + `npx @astryxdesign/cli init` → AGENTS.md. **Heavy** (StyleX, React 19). Prefer **shadcn first**; adopt Astryx only if CLI docs accelerate Lab/Console layouts without fighting Tailwind. |
| near-social-js | Only if `social` secondary track is real |
| Remotion / ffmpeg | Demo video polish (human VO still required) |

#### Explicitly do not use

| Thing | Reason |
| --- | --- |
| `@near-wallet-selector/*` | Deprecated per NEAR docs |
| Shade Agent Framework | Deprecated (docs warn: not for new projects) |
| NEAR AI Cloud / TEE as hero | Wrong track; cut |
| Random “awesome AI skills” mega-packs | Noise; install only mapped skills above |

### 10.4 Agent workflow (how we ship faster without bugs)

```text
THREAT_MODEL.md
   ↓
RED: write sandbox test for next invariant (fails)
   ↓
GREEN: implement contract/SDK until test passes
   ↓
WIRE: thin UI calling packages/sdk (no business logic in components)
   ↓
PLAYWRIGHT: journey for that surface (user-facing selectors)
   ↓
IMPECCABLE: critique → audit → polish (UI only)
   ↓
EVIDENCE: evidence.mjs /verify row for claim
   ↓
next P0 item
```

**Hard rules for the coding agent**
1. No contract feature without a sandbox test named after a T-row or prompt piece.  
2. No UI that invents chain state — only `packages/sdk` + RPC.  
3. Transfer Lab buttons must call the same fail paths as tests (shared helpers).  
4. After each surface: `pnpm test:sandbox` green before moving on.  
5. Before submit: `pnpm test:e2e:smoke` + `pnpm evidence` + impeccable `audit` + Vercel `web-design-guidelines` pass on hero routes.

### 10.5 Docs / MCP grounding

| Resource | Use |
| --- | --- |
| `https://docs.near.org/llms.txt` | Static high-signal NEAR docs for Cursor |
| Docs MCP `https://docs.near.org/mcp` | Live narrower lookups |
| `https://kit.near.tools/llms.txt` | near-kit sandbox/universal pattern |
| Chain Signatures docs | Derive/sign/continuity |
| Intents 1Click docs | P1 dry quotes |
| NFT track prompt (local `data/prompts/tracks/10-nfts.md`) | Prompt fidelity checklist |

---

## 11. Frontend / UI / UX system (clean, real, wow)

### 11.1 Design decisions (hackathon-optimal)

| Decision | Choice | Rationale |
| --- | --- | --- |
| Component base | **shadcn/ui + Radix + Tailwind v4** | Speed, a11y, hackathon-proven; copy-in ownership |
| Agent design skill | **Impeccable** (product) + **frontend-design** (direction) | Critique/audit/polish + anti-slop |
| Motion | **Emil Kowalski skills** + `motion` | Live split + Lab need purposeful motion, not noise |
| Landing art direction | Optional **Taste Skill** once | Marketing home only |
| Design system dump | Optional **UI UX Pro Max** → `DESIGN.md` | Palette/fonts once, then freeze |
| Meta Astryx | Optional later | Agent-native, but StyleX cost; not P0 |
| Visual direction | Nightclub title-insurance — ink black, stage amber/white, **no purple-on-white**, no cream+terracotta AI default, no Inter/Roboto | Matches user frontend rules + frontend-design anti-slop |

### 11.2 UX principles (product, not dashboard soup)

1. **One composition first viewport** — brand **ClearTitle** / world **Nearnight Live**, one headline, one sentence, one CTA group, one dominant visual (live split or seat charter). No stats strip in the hero.  
2. **Brand first** — product name is hero-level, not nav crumb.  
3. **One job per section** — Console ≠ Lab ≠ Diligence.  
4. **Proof is the UI** — explorer links, 0-keys badge, CLEAN stamp are first-class, not footnotes.  
5. **No card sprawl** — cards only where interaction needs a container (Lab attack buttons, Diligence checklist).  
6. **Motion with job** — ticket money animates into vaults; Lab fail shakes once; prefer `transform`/`opacity`; honor `prefers-reduced-motion`.  
7. **RPC-truthful** — ownership, keys, pending always from chain; never optimistic “you own it” without re-read.  
8. **Error honesty** — Lab expects failure; show receipt + panic log, not toast-only.  
9. **Mobile** — Box Office + Diligence usable on phone; Lab can be desktop-first.  
10. **Accessibility** — focus rings, labels on icon buttons, keyboard Lab triggers, contrast AA on CLEAN/FIX.

### 11.3 Surface → component map

| Surface | Building blocks | Motion / delight |
| --- | --- | --- |
| Landing | Full-bleed atmosphere, brand lockup, CTA → create club / watch Lab | Hero entrance only |
| Club Console | Form (Zod), BPS editor with live sum=10000, mint progress | BPS bar fill |
| Box Office | Price, buy button, **split river** animation | Coins → treasury + seats |
| Seat Page | SVG charter, continuity panel, ledger table | Charter state morph |
| Member Room | Locked vs unlocked states, list drawer (vaul) | Lock → unlock |
| Diligence | Full-screen CLEAN/FIX stamp, checklist | Stamp slam |
| Transfer Lab | Attack buttons, expected-fail panel, explorer outs | Fail pulse |
| `/verify` | Claim matrix table | Row highlight on pass |

### 11.4 Design docs to write when building

- `docs/PRODUCT.md` — from `/impeccable init`  
- `docs/DESIGN.md` — tokens, type, color, motion budget (freeze after first good pass)  
- Run `impeccable critique` + `audit` on Lab + Diligence before demo film  

---

## 12. Testing framework — end-to-end per step (bug-fast)

### 12.1 Pyramid (mandatory)

```text
           ┌──────────────────────────┐
           │  Playwright E2E smoke    │  few journeys, production build
           │  + agent webapp-testing  │
           ├──────────────────────────┤
           │  near-kit Sandbox /      │  EVERY contract invariant + T-row
           │  Vitest integration      │  mid-payout hero test ALWAYS green
           ├──────────────────────────┤
           │  Rust unit tests         │  BPS math, state machine transitions
           ├──────────────────────────┤
           │  Static gates            │  tsc, eslint, next build, cargo clippy
           └──────────────────────────┘
```

**Philosophy:** Sandbox catches title bugs. Playwright catches “UI lied.” Lab + evidence catch “demo can’t prove it.” Fix at the lowest layer that fails.

### 12.2 Tooling versions / commands (target)

```json
{
  "scripts": {
    "test:unit": "cargo test --workspace",
    "test:sandbox": "vitest run tests/sandbox",
    "test:sandbox:watch": "vitest tests/sandbox",
    "test:e2e": "playwright test",
    "test:e2e:smoke": "playwright test --grep @smoke",
    "test:hostile": "tsx scripts/hostile-mid-payout.mjs",
    "evidence": "tsx scripts/evidence.mjs",
    "demo:night": "tsx scripts/demo-night.mjs",
    "verify:all": "pnpm test:unit && pnpm test:sandbox && pnpm test:e2e:smoke && pnpm evidence"
  }
}
```

CI (when repo exists): `verify:all` on PR. Cache near-sandbox binary via `NEAR_SANDBOX_BIN_PATH`.

### 12.3 Sandbox harness pattern (near-kit)

```ts
// tests/sandbox/setup.ts
import { Near } from "near-kit"
import { Sandbox } from "near-kit/sandbox"

export async function withFreshClub(fn) {
  const sandbox = await Sandbox.start()
  const near = new Near({ network: sandbox })
  // deploy FT mock, club, registry, vault WASM
  // mint seats, set BPS
  const snapshot = await sandbox.dumpState() // optional reuse
  try {
    await fn({ sandbox, near, …accounts })
  } finally {
    await sandbox.stop()
  }
}
```

Use `patchState` for pending payout fixtures; `fastForward` if time locks appear; `restart(snapshot)` between hostile scenarios for isolation.

### 12.4 Step-by-step test matrix (build order = test order)

| Step ID | Feature | Unit | Sandbox (must) | Playwright | Lab / evidence |
| --- | --- | --- | --- | --- | --- |
| **S0** | Threat model docs | — | — | — | Doc review gate |
| **S1** | BPS invariants + pause | `bps_sum_10000`, pause blocks buy | `reject_bad_bps`, `pause_stops_ticket` | Console shows invalid BPS | — |
| **S2** | Mint seats → keyless vault | vault account created | `mint_creates_subaccount`, **`keys_empty_after_mint`** | Seat page 0-keys badge | Lab “show keys” |
| **S3** | `buy_ticket` split | math helpers | **`ticket_splits_treasury_and_seats`**, events emitted | Box Office split animation + receipt | verify row |
| **S4** | Pending payout on `token_id` | pending state machine | `claim_enqueues_pending`, pending refs token | Member Room pending chip | — |
| **S5** | `list_seat` freeze | encumbrance enum | `list_blocks_claim_and_sig` | List → UI locked | Lab listed-withdraw fail |
| **S6** | **`buy_seat` mid-payout** | rebound logic | **`sale_mid_payout_rebinds_pending`** (hero) | Diligence → buy → pending owner flip | Lab mid-payout runner |
| **S7** | Sale refund / stale nonce | — | `stale_nonce_refunds`, `settling_failure_refunds` | Error banner + balances | — |
| **S8** | Transfer Lab ≥4 fails | — | each fail path unitized | Lab buttons show explorer fail | filmed |
| **S9** | Diligence CLEAN/FIX | checklist pure fn | fixture CLEAN vs FIX states | Stamp + checklist | `/verify` |
| **S10** | Member Room gate | — | owner-only claim | non-owner locked @smoke | — |
| **S11** | History / holders | — | ledger epochs after sale | Seat timeline | — |
| **P1a** | Chain Sig derive continuity | — | `continuity_hash_stable` | Continuity panel | Lab |
| **P1b** | Sign Record + epoch | — | **`held_sig_refused_while_listed`** | Lab held-sig button | — |
| **P1c** | Wash flags | — | `wash_flag_excludes_earnings` | Diligence FIX | — |
| **P1d** | SVG charter + media_hash | SVG snapshot | metadata updates on ticket | Charter visual | — |
| **P1e** | Intents dry quote | — | mock/dry client test | Box Office “any token” labeled dry | honest README |
| **P1f** | Full evidence.mjs | — | — | — | all `/verify` rows green |

### 12.5 Playwright journeys (user-facing, isolated)

Tag `@smoke` for CI; full suite local/pre-submit.

| ID | Journey | Assert |
| --- | --- | --- |
| E1 | Organizer creates Nearnight + mints 5 seats | Seats listed; each vault 0 keys copy visible |
| E2 | Fan buys ticket | Split UI shows treasury + 5 seat credits; tx link |
| E3 | Holder claims → pending | Status pending on seat |
| E4 | Holder lists seat | Encumbrance LISTED; claim disabled |
| E5 | Buyer opens Diligence | CLEAN or FIX explicit |
| E6 | Buyer buys mid-payout | Pending → buyer; seller withdraw Lab fail |
| E7 | `/verify` page | All linked tests show pass |
| E8 | Non-owner Member Room | Locked; no claim CTA |

**Playwright rules (from Playwright + Next.js docs):** isolate storage per test; prefer `getByRole` / text; run against `next build && next start`; no `waitForTimeout` sleeps; use web-first assertions; traces on failure.

### 12.6 Hostile + evidence scripts

| Script | Role |
| --- | --- |
| `hostile-mid-payout.mjs` | Scripted attacker: list with pending, attempt seller drain, assert fail, buyer acquires, assert pending rebound |
| `demo-night.mjs` | Deterministic seed for filming (club, seats, ticket, pending) |
| `evidence.mjs` | Re-read RPC for every `/verify` claim; exit non-zero on drift |

### 12.7 Bug triage loop (fast rectify)

```text
Failing test name → maps to Step ID / T-row
  → fix packages/sdk or contracts only
  → re-run that single vitest file
  → re-run matching Playwright if UI surface
  → update evidence row if claim text changed
  → do NOT “fix” by relaxing Lab expected fail
```

Flaky sandbox? Prefer `restart(snapshot)` over shared mutable worker. Flaky E2E? Fix selectors / await RPC, don’t add sleeps.

### 12.8 Definition of done per step

A step is done only when:
1. Named sandbox test(s) green  
2. SDK helper used by UI + test  
3. UI wired without duplicated logic  
4. Matching Lab or `/verify` hook if it’s a proof claim  
5. No new tsc/clippy errors  

---

## 13. Build order (aligned with test steps)

### P0 — submit floor
- [ ] Install skills (§10.1) + `AGENTS.md` / `PRODUCT.md` / `DESIGN.md` stubs  
- [ ] `THREAT_MODEL.md` + `ECONOMICS.md` + `DEMO_SCRIPT.md` + `JUDGES.md`  
- [ ] Scaffold monorepo: contracts + apps/web + packages/sdk + tests  
- [ ] S1–S11 green in §12.4  
- [ ] Transfer Lab ≥4 live fails  
- [ ] Diligence CLEAN/FIX  
- [ ] Member Room + history  
- [ ] `/verify` stubs  
- [ ] Impeccable audit on Lab + Diligence; Vercel web-design-guidelines pass  
- [ ] README hygiene · public repo · X demo · submit  

### P1 — contender bar
- [ ] P1a–P1f in §12.4  
- [ ] `hostile-mid-payout.mjs`  
- [ ] Full `/verify` + `evidence.mjs`  
- [ ] Live split visualization polish (Emil motion)  
- [ ] Intents any-token ticket or dry quote (honest labeling)  
- [ ] Named club/seat slugs  

### P2 — stretch
- [ ] EVM address + tiny mainnet receipt  
- [ ] TLA club name  
- [ ] Social login / meta-tx for box office  
- [ ] near.social club announcement (if `social`)  
- [ ] Evaluate Astryx only if shadcn becomes the bottleneck  

### Cuts
AI company OS · loans · Agent Market · TEE jailbreak stage · 16 chains · tx-count racing · business/agents tracks · Wallet Selector · Shade framework · near-ai-cloud skill as dependency.

---

## 14. NEAR feature matrix

| Feature | Priority |
| --- | --- |
| NEP-171/177/181/297, sub-accounts, 0 keys, ticket FT path, mid-payout tests, Lab, Diligence, gated room | **P0 must** |
| `/verify` stubs→full, Chain Sig+continuity, Sign Record+epoch, wash, evidence.mjs, SVG, Intents, named slugs | **P1 contender must/should** |
| EVM mainnet flex, TLA, meta-tx/social login | P2 |
| Agent Market / TEE / loans | **Cut** |

---

## 15. Submission hygiene

- Tracks: `["nfts"]` or `["nfts","social"]` only  
- README: do-X-see-Y for club, ticket, mid-payout, Lab, Diligence, verify  
- Real vs simulated table · limits · baseline/AI/libs  
- Acknowledge patterns extended from field leader / field leader / field leader verify UX  
- List skills/libs: near-kit, near-connect, chainsig.js, shadcn, Playwright, Vitest  
- No secrets · LICENSE · `.env.example`  

---

## 16. Success bar

- [ ] Ticket split visibly correct on chain  
- [ ] Mid-payout sale filmed + tested (`sale_mid_payout_rebinds_pending` green)  
- [ ] Lab ≥4 explorer-linked fails  
- [ ] CLEAN/FIX + continuity  
- [ ] Sign Record + epoch freeze  
- [ ] `/verify` + evidence.mjs  
- [ ] `pnpm verify:all` green  
- [ ] Impeccable audit + web-design-guidelines clean on hero routes  
- [ ] ≤100s human demo  
- [ ] Prompt example pieces all evidenced (membership, treasury share, tickets)  
- [ ] No track_spam / no secrets  

---

## 17. Positioning

- **Prompt AI clones:** They stop at “NFT + wallet.” We ship **tickets → seat cuts → clear title lab**.  
- **field leader:** AI company OS vs **club seats that earn + title insurance**.  
- **field leader:** Mid-flight service sale vs **mid-payout seat sale as the show** + Chain Sig CLEAN.  
- **field leader:** Clean wallet vs **clean earning membership**.  
- **field leader:** Vote toy vs **money + tickets + attacks**.  

---

## 18. Implementation gate

When told to build:
1. Skills install + docs stubs  
2. Threat model  
3. Scaffold + test harness  
4. S1→S11 red/green loop (club+seats+tickets → mid-payout → Lab)  
5. P1 Sign Record / continuity / verify  
6. Design polish pass (Impeccable + Emil)  
7. Film + submit  

**Until then: plan only.**

---

## Appendix A — Sources

### Product / hackathon
- NFT prompt: [`data/prompts/tracks/10-nfts.md`](data/prompts/tracks/10-nfts.md)  
- Social prompt (optional secondary): [`data/prompts/tracks/12-social.md`](data/prompts/tracks/12-social.md)  
- HACKATHON.md · gap intel · field leader / field leader / field leader / field leader / Seats  
- Parth/Fahim: organizer tech as hero · demoable · don’t ship generic AI ideas  

### NEAR docs & skills
- [Tools for AI Agents](https://docs.near.org/getting-started/tools-for-ai)  
- [near/agent-skills](https://github.com/near/agent-skills)  
- [Sandbox testing (NEAR docs)](https://docs.near.org/smart-contracts/testing/integration-test)  
- [near-kit testing](https://kit.near.tools/dapp-workflow/testing) · [universal pattern](https://kit.near.tools/dapp-workflow/universal-pattern)  
- [Wallet login / near-connect](https://docs.near.org/web3-apps/tutorials/wallet-login)  
- [Chain Signatures implementation](https://docs.near.org/chain-abstraction/chain-signatures/implementation)  
- Intents / 1Click · Access keys · TLA  

### Agent skills ecosystem
- [anthropics/skills](https://github.com/anthropics/skills) (frontend-design, webapp-testing, skill-creator)  
- [agentskills/agentskills](https://github.com/agentskills/agentskills) · [skills.sh](https://www.skills.sh) · [aiticker.site/skills](https://aiticker.site/skills/)  
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)  
- [pbakaus/impeccable](https://github.com/pbakaus/impeccable)  
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)  
- [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)  
- [emilkowalski/skills](https://github.com/emilkowalski/skills)  
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) · [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)  
- [meta/astryx](https://github.com/facebook/astryx) (optional)  
- [Playwright best practices](https://playwright.dev/docs/best-practices) · [Next.js Playwright guide](https://nextjs.org/docs/app/guides/testing/playwright)  

## Appendix B — Name / brand

**ClearTitle** (SeatTitle / ClubClear).  
World name for demo: **Nearnight Live**.  
Taglines: “Sell the seat. Keep nothing.” · “Ticket money follows clear title.” · “The transfer is the product.”

## Appendix C — Skill conflict cheat-sheet

| Want | Use | Avoid stacking with |
| --- | --- | --- |
| New marketing landing | Taste Skill **or** frontend-design | Impeccable art-direction commands on same pass |
| Fix existing product UI | Impeccable `critique`/`polish`/`audit` | Taste Skill full rebuild |
| Motion polish | Emil skills | Random heavy scroll-hijack libs |
| Palette stuck | UI UX Pro Max → freeze DESIGN.md | Re-rolling taste every screen |
| NEAR contract/test | near-smart-contracts + near-kit | Inventing RPC helpers ad hoc in components |
| a11y/UX gate | Vercel web-design-guidelines | Ignoring Lab keyboard access |
