"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/console", label: "Console" },
  { href: "/box-office", label: "Box Office" },
  { href: "/seat/3", label: "Seat #3" },
  { href: "/lab", label: "Transfer Lab" },
  { href: "/verify", label: "Verify" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Primary">
      <Link href="/" className="nav-brand">
        Clear<span>Title</span>
      </Link>
      <div className="nav-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={path === l.href ? "active" : undefined}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
