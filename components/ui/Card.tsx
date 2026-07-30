interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "solid" | "glass";
}

export function Card({
  children,
  className = "",
  variant = "solid",
}: CardProps) {
  const base =
    variant === "glass"
      ? "glass-card rounded-2xl p-6"
      : "rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card";

  return <div className={`${base} ${className}`}>{children}</div>;
}
