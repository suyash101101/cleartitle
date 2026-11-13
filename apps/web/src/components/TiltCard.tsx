"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  glare = true,
  maxTilt = 10,
}: {
  children: ReactNode;
  className?: string;
  glare?: boolean;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x, { stiffness: 160, damping: 22, mass: 0.4 });
  const my = useSpring(y, { stiffness: 160, damping: 22, mass: 0.4 });
  const rotateX = useTransform(my, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-maxTilt - 2, maxTilt + 2]);
  const glareX = useTransform(mx, [-0.5, 0.5], [10, 90]);
  const glareY = useTransform(my, [-0.5, 0.5], [10, 90]);
  const glareBg = useMotionTemplate`radial-gradient(360px circle at ${glareX}% ${glareY}%, rgba(131,220,255,0.18), transparent 55%)`;
  const [hover, setHover] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function onMove(e: React.MouseEvent) {
    if (reduce) return;
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

  if (reduce) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div style={{ perspective: 1000 }} className={cn("relative", className)}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        <div style={{ transform: "translateZ(18px)", transformStyle: "preserve-3d" }} className="h-full">
          {children}
        </div>
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[1rem] mix-blend-screen"
            style={{
              opacity: hover ? 1 : 0,
              background: glareBg,
              transition: "opacity 0.2s ease",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
