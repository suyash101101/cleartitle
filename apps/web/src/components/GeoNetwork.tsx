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
        <g className="geo-lines" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.28">
          <line x1="32" y1="36" x2="928" y2="36" strokeDasharray="5 7" />
          <line x1="32" y1="384" x2="928" y2="384" strokeDasharray="5 7" />
          <line x1="48" y1="36" x2="48" y2="384" strokeDasharray="4 8" />
          <line x1="912" y1="36" x2="912" y2="384" strokeDasharray="4 8" />
          <line x1="32" y1="210" x2="128" y2="210" strokeDasharray="4 6" />
          <line x1="832" y1="210" x2="928" y2="210" strokeDasharray="4 6" />
          <line x1="348" y1="210" x2="370" y2="210" strokeDasharray="4 6" />
          <line x1="590" y1="210" x2="612" y2="210" strokeDasharray="4 6" />
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
        <g className="geo-card" transform="translate(128,88)">
          <rect width="220" height="224" rx="3" />
          <line x1="18" y1="40" x2="202" y2="40" />
          <text x="20" y="26" className="geo-label">
            01 · Refuse
          </text>
          <text x="20" y="72" className="geo-body">
            Old owner tries to
          </text>
          <text x="20" y="94" className="geo-body">
            withdraw after the
          </text>
          <text x="20" y="116" className="geo-body">
            seat is sold.
          </text>
          <text x="20" y="176" className="geo-big">
            FAIL
          </text>
          <text x="20" y="204" className="geo-em">
            explorer receipt
          </text>
        </g>

        {/* 02 REBOUND — taller center beat */}
        <g className="geo-card" transform="translate(370,54)">
          <rect width="220" height="292" rx="3" />
          <line x1="18" y1="40" x2="202" y2="40" />
          <text x="20" y="26" className="geo-label">
            02 · Rebound
          </text>
          <text x="20" y="72" className="geo-body">
            Buy mid-payout
          </text>
          <text x="20" y="112" className="geo-flow">
            Seller
          </text>
          <path
            className="geo-arrow-line"
            d="M32 124 L32 168"
            stroke="currentColor"
            strokeWidth="1.75"
            fill="none"
            strokeDasharray="3.5 4.5"
            strokeLinecap="round"
          />
          <polygon className="geo-arrow-head" points="32,180 25.5,166 38.5,166" fill="currentColor" />
          <text x="20" y="208" className="geo-flow geo-flow-buyer">
            Buyer
          </text>
          <text x="20" y="248" className="geo-big">
            CUT
          </text>
          <text x="20" y="276" className="geo-em">
            pending follows you
          </text>
        </g>

        {/* 03 GATE */}
        <g className="geo-card" transform="translate(612,88)">
          <rect width="220" height="224" rx="3" />
          <line x1="18" y1="40" x2="202" y2="40" />
          <text x="20" y="26" className="geo-label">
            03 · Gate
          </text>
          <text x="20" y="72" className="geo-body">
            Six named checks
          </text>
          <text x="20" y="94" className="geo-body">
            before buy unlocks.
          </text>
          <text x="20" y="176" className="geo-big">
            CLEAN
          </text>
          <text x="20" y="204" className="geo-em">
            or no sale
          </text>
        </g>
      </svg>
    </div>
  );
}
