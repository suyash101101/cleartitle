import type { ReactNode } from "react";

export function PageHeader({
  title,
  lede,
}: {
  title: string;
  lede?: ReactNode;
}) {
  return (
    <header className="page-header-block mb-6 max-w-3xl">
      <h2 className="page-title">{title}</h2>
      {lede && <p className="lede page-lede mt-2 text-base text-mute md:text-lg">{lede}</p>}
    </header>
  );
}
