import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "signal";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[0.68rem] font-semibold tracking-[0.04em]",
        tone === "neutral" && "border-line text-mute",
        tone === "ok" && "border-proof/40 text-proof",
        tone === "warn" && "border-warn/40 text-warn",
        tone === "signal" && "border-signal/40 text-signal",
        className,
      )}
    >
      {children}
    </span>
  );
}
