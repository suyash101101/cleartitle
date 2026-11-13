"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#2a241c] text-[#f3eadc] border-[#2a241c] hover:bg-[#1c1814] hover:border-[#1c1814] hover:text-[#faf6ef]",
  secondary:
    "bg-transparent text-[#1c1814] border-[rgb(60_42_24_/_0.35)] hover:border-[#2a241c] hover:text-[#1c1814]",
  ghost:
    "bg-transparent text-[#1c1814] border-[rgb(60_42_24_/_0.35)] hover:border-[#2a241c] hover:text-[#1c1814]",
  danger: "bg-transparent text-[#a33] border-[#a33] hover:border-[#8a2222] hover:text-[#8a2222]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 border px-4 py-2.5 text-sm font-semibold tracking-tight transition-colors disabled:pointer-events-none disabled:cursor-not-allowed",
        "rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a241c]",
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
