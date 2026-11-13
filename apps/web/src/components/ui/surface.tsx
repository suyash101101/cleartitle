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
        "relative overflow-hidden rounded-[0.65rem] border border-[rgb(60_42_24_/_0.22)] bg-transparent",
        interactive && "transition-colors hover:border-[rgb(60_42_24_/_0.4)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
