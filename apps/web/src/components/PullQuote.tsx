/** Editorial pull-quote — magazine cadence, not AI card stack. */
export function PullQuote({
  children,
  cite,
}: {
  children: React.ReactNode;
  cite?: string;
}) {
  return (
    <blockquote className="pull-quote" cite={cite}>
      <p>{children}</p>
      {cite ? <footer>{cite}</footer> : null}
    </blockquote>
  );
}
