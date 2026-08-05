import type { SupportLevel } from "@/lib/jobs/support-level";
import {
  getSupportLevelLabel,
  SUPPORT_LEVEL_HINTS,
  SUPPORT_LEVEL_TOOLTIP,
  supportLevelBadgeClass,
  supportLevelEmoji,
} from "@/lib/jobs/support-level";

interface SupportLevelBadgeProps {
  level: SupportLevel | string;
  className?: string;
}

export function SupportLevelBadge({
  level,
  className = "",
}: SupportLevelBadgeProps) {
  const label = getSupportLevelLabel(level);
  const hint =
    level === "structured" ||
    level === "moderate" ||
    level === "independent"
      ? SUPPORT_LEVEL_HINTS[level]
      : SUPPORT_LEVEL_HINTS.moderate;

  return (
    <span
      title={`${SUPPORT_LEVEL_TOOLTIP} ${hint}`}
      className={`inline-flex cursor-help items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${supportLevelBadgeClass(level)} ${className}`}
    >
      <span aria-hidden>{supportLevelEmoji(level)}</span>
      {label}
    </span>
  );
}
