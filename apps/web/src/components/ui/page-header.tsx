import type { ReactNode } from "react";

export function PageHeader({
  title,
  lede,
}: {
  title: string;
  lede?: ReactNode;
}) {
  return (
    <header className="mb-8 max-w-2xl">
      <h2 className="font-display text-4xl tracking-tight text-ink md:text-[2.6rem]">{title}</h2>
      {lede && <p className="lede mt-3 text-base text-mute md:text-lg">{lede}</p>}
    </header>
  );
}
