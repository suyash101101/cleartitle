"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

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
    <motion.nav
      className="nav"
      aria-label="Primary"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
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
    </motion.nav>
  );
}
