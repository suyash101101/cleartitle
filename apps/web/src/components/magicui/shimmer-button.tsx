"use client";

import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.08em",
      shimmerDuration = "2.4s",
      borderRadius = "0.35rem",
      background = "#0A1628",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-sm font-semibold text-white [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="absolute inset-0 -z-30 overflow-visible blur-[2px]">
          <div className="absolute inset-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
        {children}
        <div className="absolute inset-0 size-full rounded-[inherit] px-4 py-1.5 shadow-[inset_0_-6px_10px_#ffffff14] transition-all duration-300 group-hover:shadow-[inset_0_-4px_10px_#ffffff22]" />
        <div className="absolute inset-[var(--cut)] -z-20 [background:var(--bg)] [border-radius:var(--radius)]" />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";
