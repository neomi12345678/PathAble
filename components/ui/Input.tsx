interface InputProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "number";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hideLabel?: boolean;
}

const inputClass =
  "w-full rounded-2xl border border-border bg-white/80 px-5 py-3 text-sm text-text-main shadow-sm outline-none transition-all placeholder:text-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10";

export function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  hideLabel = false,
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {!hideLabel && (
        <label
          htmlFor={id}
          className="block text-sm font-bold text-text-main"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? (hideLabel ? label : undefined)}
        disabled={disabled}
        required={required}
        aria-label={hideLabel ? label : undefined}
        className={inputClass}
      />
    </div>
  );
}
