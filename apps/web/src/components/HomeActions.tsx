"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export function HomeActions() {
  const resetDemo = useApp((s) => s.resetDemo);
  const router = useRouter();
  return (
    <div className="cta-row">
      <button
        type="button"
        onClick={() => {
          resetDemo();
          router.push("/seat/3");
        }}
      >
        Start demo night
      </button>
      <Link className="btn ghost" href="/verify">
        /verify proofs
      </Link>
    </div>
  );
}
