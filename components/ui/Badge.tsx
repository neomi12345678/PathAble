interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "accent" | "primary";
}

const variants = {
  neutral: "bg-background text-muted border border-border",
  accent: "bg-accent/90 text-accent-dark shadow-sm",
  primary: "bg-primary/10 text-primary",
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
