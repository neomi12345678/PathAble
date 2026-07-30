"use client";

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h5 className="text-sm font-bold text-on-surface">{label}</h5>
        {description && (
          <p className="text-xs text-on-surface-variant">{description}</p>
        )}
      </div>
      <label htmlFor={id} className="relative inline-flex cursor-pointer items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-12 rounded-full bg-outline-variant transition-colors peer-checked:bg-primary-container"
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
              checked ? "right-1" : "left-1"
            }`}
          />
        </span>
      </label>
    </div>
  );
}
