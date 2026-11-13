import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={cn("bento-grid", className)}>{children}</div>
);

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className?: string;
  background?: React.ReactNode;
  Icon?: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
  cta: string;
}) => (
  <a href={href} className={cn("bento-card", className)}>
    <div className="bento-card-bg" aria-hidden>
      {background}
    </div>
    <div className="bento-card-body">
      {Icon && <Icon className="bento-card-icon" />}
      <h3>{name}</h3>
      <p>{description}</p>
      <span className="bento-card-cta">{cta}</span>
    </div>
  </a>
);
