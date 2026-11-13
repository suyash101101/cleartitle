"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-fog border-ink hover:bg-signal hover:border-signal hover:text-white",
  secondary:
    "bg-white text-ink border-line hover:border-signal hover:text-signal",
  ghost: "bg-transparent text-ink border-line hover:border-signal hover:text-signal",
  danger: "bg-transparent text-warn border-warn/50 hover:bg-warn hover:text-white",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 border px-4 py-2.5 text-sm font-semibold tracking-tight transition-colors disabled:pointer-events-none disabled:opacity-40",
        "rounded-[0.35rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
