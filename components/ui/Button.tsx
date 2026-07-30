interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "accent";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const variantClasses = {
  primary:
    "premium-btn bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary",
  secondary:
    "premium-btn bg-primary-light text-white shadow-lg shadow-primary-light/25 hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary-light",
  accent:
    "premium-btn bg-accent text-accent-dark shadow-lg shadow-accent/30 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-accent",
  outline:
    "border-2 border-primary/20 bg-white/60 text-primary hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary",
};

const sizeClasses = {
  sm: "px-5 py-2 text-sm",
  md: "px-7 py-2.5 text-sm",
  lg: "px-10 py-4 text-base",
};

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const baseClass =
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
