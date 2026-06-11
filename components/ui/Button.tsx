interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const variantClasses = {
  primary:
    "bg-primary text-white hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary",
  secondary:
    "bg-secondary text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-secondary",
  outline:
    "border border-border bg-surface text-text-main hover:bg-background focus-visible:ring-2 focus-visible:ring-primary",
};

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const baseClass =
    "rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
