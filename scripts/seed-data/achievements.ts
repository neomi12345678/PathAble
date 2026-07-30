import type {
  Achievement,
  AchievementBadge,
  ActivityFeedItem,
  CareerPath,
  LeaderboardEntry,
} from "@/types";
import { DEMO_USER_ID } from "./constants";
import { IMAGES } from "./images";

export const mockAchievementBadges: AchievementBadge[] = [
  {
    id: "badge-001",
    icon: "verified",
    title: "מתחיל/ה בטוח/ה",
    condition: "השלמת פרופיל מלא",
    earned: true,
  },
  {
    id: "badge-002",
    icon: "stars",
    title: "מצטיין/ת קורס",
    condition: "ציון 90+ במבחן",
    earned: true,
  },
  {
    id: "badge-003",
    icon: "work",
    title: "ראיון ראשון",
    condition: "תיאום ראיון עבודה",
    earned: true,
  },
  {
    id: "badge-004",
    icon: "chat",
    title: "פעיל/ה בקהילה",
    condition: "10 תגובות בפורום",
    earned: true,
  },
  {
    id: "badge-005",
    icon: "lock",
    title: "מנהיג/ת עתידי/ת",
    condition: "השלמת מסלול ניהול",
    earned: false,
  },
  {
    id: "badge-006",
    icon: "military_tech",
    title: "חלוץ/ה טכנולוגי/ת",
    condition: "למידת 3 טכנולוגיות",
    earned: false,
  },
  {
    id: "badge-007",
    icon: "workspace_premium",
    title: "מנטור/ית",
    condition: "ליווי משתמש/ת חדש/ה",
    earned: false,
  },
  {
    id: "badge-008",
    icon: "rocket_launch",
    title: "עצמאי/ת בשטח",
    condition: "חודש ראשון בעבודה",
    earned: false,
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: "ach-001",
    user_id: DEMO_USER_ID,
    type: "מתחיל/ה בטוח/ה",
    earned_at: "2025-02-10T15:00:00Z",
  },
  {
    id: "ach-002",
    user_id: DEMO_USER_ID,
    type: "מצטיין/ת קורס",
    earned_at: "2025-02-15T09:00:00Z",
  },
];

export const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: "act-001",
    icon: "military_tech",
    title: "קיבלת תג חדש:",
    detail: "מצטיין/ת קורס",
    timeAgo: "לפני יומיים",
  },
  {
    id: "act-002",
    icon: "trending_up",
    title: "עלית בדירוג:",
    detail: "הגעת למקום ה-15 בטבלה",
    timeAgo: "לפני 3 ימים",
  },
  {
    id: "act-003",
    icon: "school",
    title: "השלמת שיעור:",
    detail: "מבוא לנגישות דיגיטלית",
    timeAgo: "לפני שבוע",
  },
];

export const mockCareerPath: CareerPath = {
  title: "מסלול קריירה: עבודה מותאמת",
  step: 3,
  totalSteps: 5,
  percent: 65,
  steps: [
    { label: "הכשרת יסוד", status: "done" },
    { label: "בניית תיק עבודות", status: "done" },
    { label: "הכנה לראיונות", status: "active" },
    { label: "השמה ראשונה", status: "pending" },
    { label: "ליווי בעבודה", status: "pending" },
  ],
};

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "אורן ל.",
    xp: 2450,
    avatar: IMAGES.profileAvatar,
  },
  {
    rank: 2,
    name: "מיכל כ.",
    xp: 2100,
    avatar: IMAGES.mentor,
  },
  {
    rank: 3,
    name: "יוסי א.",
    xp: 1950,
    avatar: IMAGES.skillsUserPortrait,
  },
  {
    rank: 15,
    name: "דני כ.",
    xp: 850,
    isCurrentUser: true,
  },
];
