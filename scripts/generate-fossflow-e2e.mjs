#!/usr/bin/env node
/**
 * CleanDeed E2E FossFLOW:
 * clustered islands (gaps between colors), every node ≥1 edge,
 * essential story edges, short labels, FossFLOW PNG export.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs/diagrams/fossflow-e2e.json");
const nearSvgPath = join(root, "docs/diagrams/icons/near.svg");

function svgDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg.trim()).toString("base64")}`;
}

let nearMark = readFileSync(nearSvgPath, "utf8");
if (!/fill=/.test(nearMark.split("<path")[1]?.slice(0, 60) || "")) {
  nearMark = nearMark.replace("<path ", '<path fill="#00EC97" ');
}

function brandTile(inner, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B1220"/>
      <stop offset="100%" stop-color="#14302a"/>
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="18" fill="url(#g)"/>
  <rect x="4" y="4" width="88" height="88" rx="14" fill="none" stroke="#00EC97" stroke-width="3" opacity="0.85"/>
  <g transform="translate(24 14) scale(2)">${inner}</g>
  <text x="48" y="86" text-anchor="middle" font-size="9" fill="#9AE6C5" font-family="ui-sans-serif,system-ui">${label}</text>
</svg>`;
}

const BRAND_SVGS = {
  "logo-near": brandTile(
    `<g transform="translate(0 2) scale(0.75)">${nearMark.replace(/<\/?svg[^>]*>/g, "").replace(/<title>[^<]*<\/title>/, "")}</g>`,
    "NEAR",
  ),
  "logo-near-connect": brandTile(
    `<circle cx="24" cy="18" r="9" fill="none" stroke="#00EC97" stroke-width="3"/>
     <path d="M8 38c5-11 27-11 32 0" fill="none" stroke="#00EC97" stroke-width="3" stroke-linecap="round"/>`,
    "near-connect",
  ),
  "logo-chain-sigs": brandTile(
    `<circle cx="14" cy="24" r="10" fill="none" stroke="#00EC97" stroke-width="3"/>
     <circle cx="34" cy="24" r="10" fill="none" stroke="#7CFFCB" stroke-width="3"/>
     <path d="M20 24h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
    "Chain Sigs",
  ),
  "logo-nearblocks": brandTile(
    `<rect x="6" y="10" width="36" height="28" rx="4" fill="none" stroke="#00EC97" stroke-width="3"/>
     <path d="M12 18h24M12 24h16M12 30h20" stroke="#7CFFCB" stroke-width="2.5" stroke-linecap="round"/>`,
    "Nearblocks",
  ),
  "logo-near-sdk": brandTile(
    `<path d="M8 12l12 12-12 12M28 36h16" fill="none" stroke="#00EC97" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    "near-sdk",
  ),
  "logo-nep171": brandTile(
    `<rect x="10" y="8" width="28" height="34" rx="4" fill="none" stroke="#00EC97" stroke-width="3"/>
     <circle cx="24" cy="22" r="6" fill="#00EC97"/>`,
    "NEP-171",
  ),
};

/** Short names avoid label collisions in a tight pack. */
const NODES = [
  // 0–5 NEAR tools
  ["NEAR", "logo-near", "testnet RPC"],
  ["near-connect", "logo-near-connect", "Live wallet"],
  ["near-sdk", "logo-near-sdk", "Rust contract"],
  ["NEP-171", "logo-nep171", "Seat NFTs"],
  ["Chain Sigs", "logo-chain-sigs", "MPC tips"],
  ["Nearblocks", "logo-nearblocks", "Explorer"],

  // 6–10 people
  ["Organizer", "user", "Mints + BPS"],
  ["Fan", "mobiledevice", "Buys ticket"],
  ["Ada", "user", "Seller"],
  ["Priya", "user", "Buyer"],
  ["Judge", "firewall", "Hostile Lab"],

  // 11–17 Live routes
  ["Console", "desktop", "/console"],
  ["Box office", "cardterminal", "/box-office"],
  ["Night", "sphere", "/night"],
  ["Seat #3", "laptop", "/seat/3"],
  ["Diligence UI", "document", "/title/3"],
  ["Lab", "block", "/lab"],
  ["Verify", "lock", "/verify · /proof"],

  // 18–26 story
  ["Mint seats", "cube", "create_club"],
  ["Set BPS", "document", "ticket + cuts"],
  ["buy_ticket", "paymentcard", "split vaults"],
  ["PENDING", "cronjob", "claim cut"],
  ["FREEZE list", "lock", "list_seat"],
  ["CLEAN gate", "firewall", "diligence"],
  ["buy_seat", "truck", "rebound"],
  ["Lab refuse", "block", "expected fail"],
  ["Evidence", "package-module", "tx hashes"],

  // 27–32 stack
  ["SDK", "package-module", "@cleartitle/sdk"],
  ["Contract", "server", "testnet"],
  ["Vault #3", "storage", "0 keys"],
  ["Live mode", "switch-module", "vs Preview"],
  ["Tests", "desktop", "Vitest · e2e"],
  ["Scale", "pyramid", "/scale"],
];

/**
 * Tight clusters (step 3). Mix of:
 *   - multiline blocks (brand, stack, story)
 *   - sleeping horizontal rows (people, Live)
 *   - vertical Lab·evidence stack on the right
 *
 * Title text kept far from section labels (no isometric overlap).
 */
const POS = [
  // brand — tight 3×2 multiline
  [0, 0, -11],
  [1, 3, -11],
  [2, 6, -11],
  [3, 0, -8],
  [4, 3, -8],
  [5, 6, -8],

  // people — sleeping horizontal (tighter to Live)
  [6, 0, -4],
  [7, 3, -4],
  [8, 6, -4],
  [9, 9, -4],
  [10, 12, -4],

  // Live — sleeping row + vertical Lab/Verify
  [11, 0, -1],
  [12, 3, -1],
  [14, 6, -1],
  [13, 9, -1],
  [15, 12, -1],
  [16, 15, -1],
  [17, 15, 2],

  // story — multiline (4+3), same step-3 grid (no half-step stagger)
  [18, 0, 4],
  [19, 3, 4],
  [20, 6, 4],
  [21, 9, 4],
  [22, 0, 6],
  [23, 3, 6],
  [24, 6, 6],

  // Lab·evidence — vertical, right of story
  [25, 12, 4],
  [26, 12, 6],

  // stack — multiline under story
  [27, 0, 9],
  [28, 3, 9],
  [29, 6, 9],
  [30, 0, 11],
  [31, 3, 11],
  [32, 6, 11],
];

const posMap = Object.fromEntries(POS.map(([i, x, y]) => [i, { x, y }]));

function edge(from, to, color = "ink", width = 9, style = "SOLID", via = []) {
  return { from, to, color, width, style, via };
}

function link(from, to, color, width = 9, style = "SOLID") {
  const a = posMap[from];
  const b = posMap[to];
  if (a.x === b.x || a.y === b.y) {
    return edge(from, to, color, width, style);
  }
  const wx = Math.round((a.x + b.x) / 2);
  const wy = Math.round((a.y + b.y) / 2);
  return edge(from, to, color, width, style, [{ x: wx, y: wy }]);
}

const LINKS = [
  // NEAR tools — ring + one drop per role (no full mesh)
  edge(0, 1, "near", 8),
  edge(1, 2, "near", 8),
  edge(2, 5, "near", 8),
  edge(5, 4, "near", 8),
  edge(4, 3, "near", 8),
  edge(3, 0, "near", 8),
  link(0, 28, "near", 8), // NEAR → contract
  link(1, 11, "near", 7), // near-connect → Console
  link(3, 18, "near", 7), // NEP-171 → mint
  link(4, 29, "near", 7), // Chain Sigs → vault
  link(5, 26, "near", 8), // Nearblocks → evidence

  // people → Live
  edge(6, 11, "ink", 8),
  edge(7, 12, "ink", 8),
  edge(8, 14, "ink", 8),
  edge(9, 13, "ink", 8),
  edge(10, 15, "ink", 8),

  // Live → story (one each) + Lab tower → evidence
  edge(11, 18, "c_ui", 9),
  edge(12, 19, "c_ui", 8),
  edge(14, 20, "c_ui", 8),
  edge(13, 21, "c_ui", 8),
  edge(15, 22, "c_ui", 8),
  edge(16, 17, "c_proof", 8),
  link(17, 26, "c_proof", 8),

  // story path (snake, not lattice) → evidence
  edge(18, 19, "c_sell", 12),
  edge(19, 20, "c_sell", 12),
  edge(20, 21, "c_sell", 12),
  edge(21, 24, "c_sell", 11),
  edge(24, 23, "c_sell", 11),
  edge(23, 22, "c_sell", 11),
  edge(24, 25, "c_proof", 11),
  edge(25, 26, "c_proof", 11),

  // stack — grid + three anchors
  edge(27, 28, "c_stack", 9),
  edge(28, 29, "c_stack", 9),
  edge(27, 30, "c_stack", 8),
  edge(28, 31, "c_stack", 8),
  edge(29, 32, "c_stack", 8),
  link(27, 23, "c_stack", 8),
  link(30, 11, "ink", 7),
  link(32, 17, "c_stack", 7),
];

const COLORS = [
  { id: "ink", value: "#5a6577" },
  { id: "near", value: "#00EC97" },
  { id: "c_brand", value: "#d2f5e4" },
  { id: "c_people", value: "#e6e6e6" },
  { id: "c_ui", value: "#c5e9ec" },
  { id: "c_story", value: "#f3e2bb" },
  { id: "c_proof", value: "#efc6c1" },
  { id: "c_stack", value: "#cdd6f5" },
  { id: "c_sell", value: "#c4a8e8" },
];

/**
 * One pad per color (merge adjacent same-color tiles).
 * Gaps between different colors so islands never touch.
 */
const RECTS = [
  // Brand pad: NEAR tools (x≤6) + open front strip for CleanDeed (Y).
  { id: "r_brand", color: "c_brand", from: { x: -1, y: -12 }, to: { x: 11, y: -7 } },
  { id: "r_people", color: "c_people", from: { x: -1, y: -5 }, to: { x: 15, y: -3 } },
  { id: "r_ui", color: "c_ui", from: { x: -1, y: -2 }, to: { x: 17, y: 2 } },
  { id: "r_story", color: "c_story", from: { x: -1, y: 3 }, to: { x: 10, y: 7 } },
  { id: "r_proof", color: "c_proof", from: { x: 11, y: 3 }, to: { x: 15, y: 7 } },
  { id: "r_stack", color: "c_stack", from: { x: -1, y: 8 }, to: { x: 9, y: 12 } },
];

/**
 * CleanDeed on the front brand face — orientation Y (same as earlier),
 * centered in the open strip between NEAR icons (x≤6) and pad edge (x=11).
 * Block labels only in empty corners — never on node coords.
 */
const TEXT = [
  {
    // Anchor left of open strip so Y-run text mass sits mid-pad (not edge).
    id: "t_title",
    tile: { x: 7, y: -10.5 },
    content: "CleanDeed",
    fontSize: 1.7,
    orientation: "Y",
  },
  {
    id: "t_sub",
    tile: { x: 9, y: -10.5 },
    content: "mid-payout title insurance on NEAR",
    fontSize: 0.42,
    orientation: "Y",
  },
  // empty corners (no node at these tiles)
  { id: "t_people", tile: { x: 13.5, y: -4.5 }, content: "People", fontSize: 0.38, orientation: "X" },
  { id: "t_ui", tile: { x: 13.5, y: 1.3 }, content: "Live UI", fontSize: 0.38, orientation: "X" },
  { id: "t_story", tile: { x: 9.2, y: 3.4 }, content: "Story", fontSize: 0.38, orientation: "X" },
  { id: "t_lab", tile: { x: 13.5, y: 3.4 }, content: "Lab", fontSize: 0.38, orientation: "X" },
];

// --- validate coverage + island gaps ---
const degree = Array(NODES.length).fill(0);
for (const { from, to } of LINKS) {
  degree[from]++;
  degree[to]++;
}
const orphans = degree
  .map((d, i) => (d === 0 ? NODES[i][0] : null))
  .filter(Boolean);
if (orphans.length) {
  throw new Error(`nodes with zero edges: ${orphans.join(", ")}`);
}

function rectsTouch(a, b) {
  const ax1 = Math.min(a.from.x, a.to.x);
  const ax2 = Math.max(a.from.x, a.to.x);
  const ay1 = Math.min(a.from.y, a.to.y);
  const ay2 = Math.max(a.from.y, a.to.y);
  const bx1 = Math.min(b.from.x, b.to.x);
  const bx2 = Math.max(b.from.x, b.to.x);
  const by1 = Math.min(b.from.y, b.to.y);
  const by2 = Math.max(b.from.y, b.to.y);
  // touch or overlap if expanded by 0 (strict: gap < 1)
  return ax1 <= bx2 && ax2 >= bx1 && ay1 <= by2 && ay2 >= by1;
}
for (let i = 0; i < RECTS.length; i++) {
  for (let j = i + 1; j < RECTS.length; j++) {
    if (rectsTouch(RECTS[i], RECTS[j])) {
      throw new Error(`color islands touch: ${RECTS[i].id} ↔ ${RECTS[j].id}`);
    }
  }
}

const items = NODES.map(([name, icon, description], index) => ({
  id: `item_${index}`,
  name,
  icon,
  description,
}));

const importedIcons = Object.entries(BRAND_SVGS).map(([id, svg]) => ({
  id,
  name: id.replace(/^logo-/, ""),
  url: svgDataUrl(svg),
  collection: "imported",
  isIsometric: false,
}));

const stockIconIds = [
  ...new Set(NODES.map(([, icon]) => icon).filter((id) => !id.startsWith("logo-"))),
];
const stockIcons = stockIconIds.map((id) => ({
  id,
  name: id,
  url: "",
  isIsometric: true,
}));

const viewItems = POS.map(([itemIndex, x, y]) => ({
  id: `item_${itemIndex}`,
  tile: { x, y },
  labelHeight: 72,
}));

const connectors = LINKS.map((link, i) => {
  const anchors = [
    { id: `a_${i}_0`, ref: { item: `item_${link.from}` } },
    ...link.via.map((tile, vi) => ({
      id: `a_${i}_v${vi}`,
      ref: { tile },
    })),
    { id: `a_${i}_1`, ref: { item: `item_${link.to}` } },
  ];
  return {
    id: `conn_${i}`,
    color: link.color,
    width: link.width,
    style: link.style,
    description: "",
    anchors,
  };
});

if (POS.length !== NODES.length) {
  throw new Error(`POS ${POS.length} != NODES ${NODES.length}`);
}

const model = {
  title: "CleanDeed E2E mid-payout title insurance",
  version: "1.0",
  description:
    "Clustered CleanDeed E2E: every node linked, island gaps, essential edges",
  icons: [...stockIcons, ...importedIcons],
  colors: COLORS,
  items,
  views: [
    {
      id: "view_0",
      name: "E2E mid-payout",
      items: viewItems,
      connectors,
      rectangles: RECTS,
      textBoxes: TEXT,
    },
  ],
  fitToScreen: true,
};

writeFileSync(out, JSON.stringify(model, null, 2));
console.log(
  `wrote ${out} (${NODES.length} nodes, ${LINKS.length} edges, minDegree=${Math.min(...degree)}, ${RECTS.length} islands)`,
);
