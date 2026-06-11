import type { Achievement, AchievementBadge } from "@/types";
import { DEMO_USER_ID } from "./constants";

export const mockAchievementBadges: AchievementBadge[] = [
  {
    id: "badge-001",
    emoji: "🎯",
    title: "השלמתי אבחון",
    condition: "לאחר שאלון ראשון",
    earned: true,
  },
  {
    id: "badge-002",
    emoji: "📚",
    title: "לומד ראשון",
    condition: "השלמת מודול למידה ראשון",
    earned: true,
  },
  {
    id: "badge-003",
    emoji: "💪",
    title: "5 תרגולים",
    condition: "5 תרגילים שהושלמו",
    earned: false,
  },
  {
    id: "badge-004",
    emoji: "🔥",
    title: "שבוע רצוף",
    condition: "7 ימי כניסה ברצף",
    earned: false,
  },
  {
    id: "badge-005",
    emoji: "⭐",
    title: "מוכן לעבודה",
    condition: "השלמת 5 מיומנויות",
    earned: false,
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: "ach-001",
    user_id: DEMO_USER_ID,
    type: "השלמתי אבחון",
    earned_at: "2025-02-10T15:00:00Z",
  },
  {
    id: "ach-002",
    user_id: DEMO_USER_ID,
    type: "לומד ראשון",
    earned_at: "2025-02-15T09:00:00Z",
  },
];
