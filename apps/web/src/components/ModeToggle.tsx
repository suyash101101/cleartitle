"use client";

import { useApp, type ProductMode } from "@/lib/store";

const MODES: { id: ProductMode; label: string; hint: string }[] = [
  {
    id: "live",
    label: "Live",
    hint: "Wallet + testnet RPC. Real list / buy / diligence.",
  },
  {
    id: "preview",
    label: "Preview",
    hint: "Local scenario engine for film and judge walkthroughs.",
  },
];

export function ModeToggle() {
  const mode = useApp((s) => s.productMode);
  const setMode = useApp((s) => s.setProductMode);

  return (
    <div className="panel mode-toggle" role="group" aria-label="Product mode">
      <div className="mode-toggle-row">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={mode === m.id ? undefined : "ghost"}
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="meta" style={{ marginTop: "0.55rem" }}>
        {MODES.find((m) => m.id === mode)?.hint}
      </p>
    </div>
  );
}
