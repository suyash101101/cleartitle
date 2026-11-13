"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/box-office", label: "Tickets" },
  { href: "/seat/3", label: "Seat" },
  { href: "/lab", label: "Lab" },
  { href: "/verify", label: "Verify" },
  { href: "/console", label: "Club" },
];

export function Nav() {
  const path = usePathname();
  return (
    <>
      <header className="top-brand">
        <Link href="/" className="nav-brand">
          Clear<span>Title</span>
        </Link>
        <p className="top-brand-live">
          <span className="badge ok">LIVE TESTNET</span>
          <span className="meta mono">cleartitle562464.testnet</span>
        </p>
      </header>
      <nav className="dock" aria-label="Primary">
        {links.map((l) => {
          const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={active ? "active" : undefined}>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
