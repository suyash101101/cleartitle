# Diagrams

Prefer Excalidraw for demo narration (skip FossFlow / architecture for now).

| File | Role |
| --- | --- |
| `mid-payout-attack.excalidraw` | Mid-air pending-cut attack — whiteboard this in the video |
| `quitclaim-claims.excalidraw` | Claim → freeze → clean → rebound → refuse strip |
| `e2e-flow.png` | Granular E2E FossFLOW (optional; not needed if Excalidraw is the flow) |
| `architecture.png` / `userflow.png` | README embeds (same E2E capture) |
| `quitclaim-claims.png` | Claims one-pager (Excalidraw) |
| `fossflow-e2e.json` | Full FossFLOW model (icons + rectangles + connectors) |
| `fossflow-architecture.json` | Compact companion (small architecture) |
| `fossflow-userflow.json` | Compact companion (6-step mid-payout) |
| `quitclaim-claims.excalidraw` | Excalidraw source |

## Regenerate E2E FossFLOW

```bash
# FossFLOW local on :3000
node scripts/generate-fossflow-e2e.mjs
cd apps/web && node scripts/capture-fossflow-e2e.mjs
```

Import `fossflow-e2e.json` in FossFLOW via **Import File** (full model with colored tiles). Compact JSON files open via Main menu → Open.
