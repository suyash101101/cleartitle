import { cn } from "@/lib/utils";

export function Surface({
  children,
  className,
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[0.5rem] border border-line bg-white/80 backdrop-blur-sm",
        interactive && "transition-colors hover:border-signal/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
