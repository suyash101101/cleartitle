"use client";

import type { ReactNode } from "react";
import { BlurFade } from "@/components/magicui/blur-fade";

export function PageHeader({
  title,
  lede,
}: {
  title: string;
  lede?: ReactNode;
}) {
  return (
    <header className="mb-8 max-w-2xl">
      <BlurFade delay={0.05}>
        <h2 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          {title}
        </h2>
      </BlurFade>
      {lede && (
        <BlurFade delay={0.12}>
          <p className="lede mt-3 text-base text-mute md:text-lg">{lede}</p>
        </BlurFade>
      )}
    </header>
  );
}
