import type { LeaderboardEntry } from "@/types";
import { ACHIEVEMENTS } from "@/utils/texts";

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardCard({ entries }: LeaderboardCardProps) {
  const topEntries = entries.filter((e) => !e.isCurrentUser);
  const currentUser = entries.find((e) => e.isCurrentUser);

  return (
    <div className="glass depth-shadow relative overflow-hidden rounded-[32px] p-6">
      <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-5">
        <span className="material-symbols-outlined text-[100px] text-primary">emoji_events</span>
      </div>
      <h3 className="mb-5 font-display text-lg font-bold">{ACHIEVEMENTS.leaderboard}</h3>
      <div className="space-y-3">
        {topEntries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 rounded-xl p-2 ${
              entry.rank === 1
                ? "border border-secondary-container/20 bg-secondary-container/10"
                : ""
            }`}
          >
            <span
              className={`w-4 font-bold ${entry.rank === 1 ? "text-secondary" : "text-center text-on-surface-variant"}`}
            >
              {entry.rank}
            </span>
            {entry.avatar ? (
              <div
                className="h-8 w-8 shrink-0 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url('${entry.avatar}')` }}
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-xs font-bold">
                {entry.name.charAt(0)}
              </div>
            )}
            <span className={`flex-1 text-sm ${entry.rank === 1 ? "font-bold" : ""}`}>
              {entry.name}
            </span>
            <span
              className={`text-xs font-bold ${entry.rank === 1 ? "text-secondary" : "text-on-surface-variant"}`}
            >
              {entry.xp.toLocaleString("he-IL")} XP
            </span>
          </div>
        ))}
        {currentUser && (
          <div className="flex items-center gap-3 border-t border-outline-variant/30 p-2 pt-4">
            <span className="w-4 text-center font-bold text-primary">{currentUser.rank}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {ACHIEVEMENTS.you}
            </div>
            <span className="flex-1 text-sm font-bold text-primary">{currentUser.name}</span>
            <span className="text-xs font-bold text-primary">
              {currentUser.xp.toLocaleString("he-IL")} XP
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
