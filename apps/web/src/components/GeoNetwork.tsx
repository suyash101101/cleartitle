"use client";

import { motion } from "framer-motion";

/**
 * Large X Ads–style network. Three readable product beats.
 * Nodes travel outer rails only — never over card copy.
 */
export function GeoNetwork() {
  return (
    <div className="geo-network geo-network-lg" aria-hidden>
      <svg viewBox="0 0 960 420" className="geo-network-svg" preserveAspectRatio="xMidYMid meet">
        <g className="geo-lines" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35">
          <line x1="32" y1="36" x2="928" y2="36" strokeDasharray="5 7" />
          <line x1="32" y1="384" x2="928" y2="384" strokeDasharray="5 7" />
          <line x1="48" y1="36" x2="48" y2="384" strokeDasharray="4 8" />
          <line x1="912" y1="36" x2="912" y2="384" strokeDasharray="4 8" />
          <line x1="32" y1="210" x2="120" y2="210" strokeDasharray="4 6" />
          <line x1="840" y1="210" x2="928" y2="210" strokeDasharray="4 6" />
          <line x1="320" y1="210" x2="380" y2="210" strokeDasharray="4 6" />
          <line x1="580" y1="210" x2="640" y2="210" strokeDasharray="4 6" />
        </g>

        <g className="geo-nodes-layer">
          <motion.circle
            r="5"
            className="geo-node"
            animate={{ cx: [48, 912, 48], cy: 36 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            r="5"
            className="geo-node"
            animate={{ cx: [912, 48, 912], cy: 384 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            r="5"
            className="geo-node"
            animate={{ cx: 48, cy: [56, 364, 56] }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            r="5"
            className="geo-node"
            animate={{ cx: 912, cy: [364, 56, 364] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </g>

        {/* 01 REFUSE */}
        <g className="geo-card" transform="translate(120,95)">
          <rect width="200" height="210" rx="2" />
          <line x1="0" y1="36" x2="200" y2="36" />
          <text x="16" y="24" className="geo-label">
            01 · Refuse
          </text>
          <text x="18" y="78" className="geo-body">
            Old owner tries
          </text>
          <text x="18" y="102" className="geo-body">
            to withdraw after
          </text>
          <text x="18" y="126" className="geo-body">
            the seat is sold.
          </text>
          <text x="18" y="168" className="geo-big">
            FAIL
          </text>
          <text x="18" y="196" className="geo-body geo-em">
            explorer receipt
          </text>
        </g>

        {/* 02 REBOUND — clear flow, no chart clutter */}
        <g className="geo-card" transform="translate(380,70)">
          <rect width="200" height="260" rx="2" />
          <line x1="0" y1="36" x2="200" y2="36" />
          <text x="16" y="24" className="geo-label">
            02 · Rebound
          </text>
          <text x="18" y="72" className="geo-body">
            Buy mid-payout
          </text>
          <text x="18" y="110" className="geo-flow">
            seller
          </text>
          <path
            d="M100 118 L100 150"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="3 4"
          />
          <polygon points="100,158 94,146 106,146" fill="currentColor" />
          <text x="18" y="186" className="geo-flow">
            buyer
          </text>
          <text x="18" y="222" className="geo-big">
            CUT
          </text>
          <text x="18" y="248" className="geo-body geo-em">
            pending follows you
          </text>
        </g>

        {/* 03 GATE */}
        <g className="geo-card" transform="translate(640,95)">
          <rect width="200" height="210" rx="2" />
          <line x1="0" y1="36" x2="200" y2="36" />
          <text x="16" y="24" className="geo-label">
            03 · Gate
          </text>
          <text x="18" y="78" className="geo-body">
            Six named checks
          </text>
          <text x="18" y="102" className="geo-body">
            before buy unlocks.
          </text>
          <text x="18" y="160" className="geo-big">
            CLEAN
          </text>
          <text x="18" y="188" className="geo-body geo-em">
            or no sale
          </text>
        </g>
      </svg>
    </div>
  );
}
