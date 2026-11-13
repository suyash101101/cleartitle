"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export function HomeActions() {
  const resetDemo = useApp((s) => s.resetDemo);
  const router = useRouter();
  return (
    <div className="cta-row">
      <ShimmerButton
        type="button"
        background="#0A1628"
        shimmerColor="#93C5FD"
        onClick={() => {
          resetDemo();
          router.push("/seat/3");
        }}
      >
        Start demo night
      </ShimmerButton>
      <Link className="btn ghost" href="/verify">
        /verify proofs
      </Link>
    </div>
  );
}
