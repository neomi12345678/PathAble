import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logger } from "@/lib/logger";

/** מזהי תגים — חייבים להתאים ל-slug ב-achievement_badges (seed) */
export const BADGES = {
  onboarding: "badge-001",
  assessment: "badge-002",
  firstLearning: "badge-003",
  firstSkill: "badge-004",
  savedProfession: "badge-005",
  threeLearning: "badge-006",
  firstChat: "badge-007",
  fiveModules: "badge-008",
} as const;

export type BadgeSlug = (typeof BADGES)[keyof typeof BADGES];

/** מעניק תג למשתמש אם עדיין אין לו אותו. מחזיר true אם הוענק עכשיו. */
export async function awardBadge(
  userId: string,
  badgeSlug: BadgeSlug
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_slug", badgeSlug)
      .maybeSingle();
    if (existing) return false;

    const { error } = await supabase
      .from("achievements")
      .insert({ user_id: userId, badge_slug: badgeSlug });
    if (error) {
      logger.error("Badge award failed", { badgeSlug, error: error.message });
      return false;
    }
    return true;
  } catch (error) {
    logger.error("Badge award failed", { badgeSlug, error: String(error) });
    return false;
  }
}

/** מעניק תגי התקדמות אחרי השלמת מודול (למידה/מיומנות) */
export async function awardModuleBadges(
  userId: string,
  moduleType: "learning" | "skill"
): Promise<void> {
  if (moduleType === "learning") {
    await awardBadge(userId, BADGES.firstLearning);
  } else {
    await awardBadge(userId, BADGES.firstSkill);
  }

  if (!isSupabaseConfigured()) return;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("user_progress")
    .select("module_type")
    .eq("user_id", userId)
    .eq("completed", true);
  const rows = data ?? [];

  const learningCount = rows.filter(
    (r) => r.module_type === "learning"
  ).length;
  if (learningCount >= 3) {
    await awardBadge(userId, BADGES.threeLearning);
  }
  if (rows.length >= 5) {
    await awardBadge(userId, BADGES.fiveModules);
  }
}
