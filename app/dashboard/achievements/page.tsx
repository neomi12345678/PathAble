import type { Metadata } from "next";
import { AchievementsHero } from "@/components/achievements/AchievementsHero";
import { ActivityFeed } from "@/components/achievements/ActivityFeed";
import { BadgeGrid } from "@/components/achievements/BadgeGrid";
import { CareerPathCard } from "@/components/achievements/CareerPathCard";
import { LeaderboardCard } from "@/components/achievements/LeaderboardCard";
import {
  getAchievementBadges,
  getActivityFeed,
  getCareerPath,
  getLeaderboard,
  getProfile,
} from "@/lib/data";
import { APP_NAME, ACHIEVEMENTS } from "@/utils/texts";

export const metadata: Metadata = {
  title: `${ACHIEVEMENTS.title} | ${APP_NAME}`,
  description: ACHIEVEMENTS.subtitle,
};

export default async function AchievementsPage() {
  const [profile, badges, activity, careerPath, leaderboard] = await Promise.all([
    getProfile(),
    getAchievementBadges(),
    getActivityFeed(),
    getCareerPath(),
    getLeaderboard(),
  ]);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="mx-auto max-w-container-max">
      <AchievementsHero
        userName={profile?.first_name ?? "משתמש"}
        badgeCount={earnedCount}
        journeyPercent={careerPath.percent}
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <BadgeGrid badges={badges} />
          <ActivityFeed items={activity} />
        </div>
        <aside className="space-y-6">
          <CareerPathCard path={careerPath} />
          <LeaderboardCard entries={leaderboard} />
        </aside>
      </div>
    </div>
  );
}
