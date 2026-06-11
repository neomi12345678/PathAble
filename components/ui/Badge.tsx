interface BadgeProps {
  children: React.ReactNode;
}

export function Badge({ children }: BadgeProps) {
  return (
    <span className="rounded-full bg-background px-2 py-1 text-xs text-muted">
      {children}
    </span>
  );
}
