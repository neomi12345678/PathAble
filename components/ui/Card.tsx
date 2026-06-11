interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  const cardClass = `rounded-xl border border-border bg-surface p-4 ${className}`;

  return <div className={cardClass}>{children}</div>;
}
