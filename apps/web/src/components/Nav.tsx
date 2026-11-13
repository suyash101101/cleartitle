"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Club,
  FlaskConical,
  Home,
  LayoutGrid,
  ShieldCheck,
  Ticket,
  Waves,
} from "lucide-react";

import { Dock, DockIcon } from "@/components/ui/dock";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/night", label: "River", Icon: Waves },
  { href: "/box-office", label: "Tickets", Icon: Ticket },
  { href: "/inventory", label: "Seats", Icon: LayoutGrid },
  { href: "/seat/3", label: "Live", Icon: Award },
  { href: "/title/3", label: "Cert", Icon: ShieldCheck },
  { href: "/lab", label: "Lab", Icon: FlaskConical },
  { href: "/verify", label: "Verify", Icon: ShieldCheck },
  { href: "/console", label: "Club", Icon: Club },
];

/** MagicUI dock — whole icon is the hit target (padding used to miss the inner <a>). */
export function Nav() {
  const path = usePathname();

  return (
    <nav className="dock-wrap" aria-label="Primary">
      <Dock direction="middle" iconSize={36} iconMagnification={48} iconDistance={120}>
        {links.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <DockIcon
              key={href}
              className={cn("dock-icon-btn", active && "dock-icon-active")}
            >
              <Link
                href={href}
                prefetch
                aria-label={label}
                className="dock-link"
                title={label}
              >
                <Icon className="dock-glyph size-5" strokeWidth={active ? 2.35 : 1.75} aria-hidden />
              </Link>
            </DockIcon>
          );
        })}
      </Dock>
    </nav>
  );
}
