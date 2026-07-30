import type { ActivityFeedItem } from "@/types";
import { ACHIEVEMENTS } from "@/utils/texts";

interface ActivityFeedProps {
  items: ActivityFeedItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-bold md:text-2xl">
        {ACHIEVEMENTS.recentActivity}
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="glass flex cursor-default items-center gap-3 rounded-2xl p-4 transition-colors hover:bg-white"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container/20">
              <span className="material-symbols-outlined text-primary">{item.icon}</span>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm text-on-surface">
                <span className="font-bold">{item.title}</span> {item.detail}
              </p>
              <p className="text-xs text-on-surface-variant">{item.timeAgo}</p>
            </div>
            <button
              type="button"
              aria-label="שיתוף"
              className="material-symbols-outlined text-outline transition-colors hover:text-primary"
            >
              share
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
