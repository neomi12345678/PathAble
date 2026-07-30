import type { AchievementBadge } from "@/types";
import { ACHIEVEMENTS } from "@/utils/texts";

interface BadgeGridProps {
  badges: AchievementBadge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <section id="badges">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold md:text-2xl">
          {ACHIEVEMENTS.badgeCollection}
        </h2>
        <span className="cursor-pointer text-xs font-bold text-primary hover:underline">
          {ACHIEVEMENTS.filterCategory}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {badges.map((badge) => {
          const locked = !badge.earned;
          const glowClass =
            badge.icon === "stars" ? "amber-glow" : locked ? "" : "sky-glow";
          const iconTint = badge.icon === "stars" ? "text-secondary" : "text-primary";
          const bgTint =
            badge.icon === "stars"
              ? "bg-secondary-container/20"
              : "bg-primary-container/20";

          return (
            <div
              key={badge.id}
              className={`glass depth-shadow flex flex-col items-center rounded-2xl p-4 text-center transition-all ${
                locked
                  ? "locked-badge border border-dashed border-outline-variant/50"
                  : "cursor-pointer hover:scale-105"
              }`}
            >
              <div
                className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${bgTint} ${glowClass}`}
              >
                <span className={`material-symbols-outlined text-3xl ${locked ? "text-outline" : iconTint}`}>
                  {locked ? "lock" : badge.icon}
                </span>
              </div>
              <span className="text-xs font-bold text-on-surface">{badge.title}</span>
              <span className="mt-1 text-[10px] text-on-surface-variant">
                {badge.condition}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
