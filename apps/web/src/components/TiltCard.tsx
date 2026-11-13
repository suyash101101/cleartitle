"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x, { stiffness: 180, damping: 18 });
  const my = useSpring(y, { stiffness: 180, damping: 18 });
  const rotateX = useTransform(my, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-14, 14]);
  const glareX = useTransform(mx, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(my, [-0.5, 0.5], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgba(255,220,140,0.22), transparent 55%)`;
  const [hover, setHover] = useState(false);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
    setHover(false);
  }

  return (
    <div style={{ perspective: 1100 }} className={cn("relative", className)}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full will-change-transform"
      >
        <div style={{ transform: "translateZ(24px)", transformStyle: "preserve-3d" }} className="h-full">
          {children}
        </div>
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen"
            style={{
              opacity: hover ? 1 : 0,
              background: glareBg,
              transition: "opacity 0.25s ease",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
