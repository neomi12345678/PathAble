import { createClient } from "@/lib/supabase/server";
import type {
  AchievementBadge,
  ActivityFeedItem,
  CareerPath,
  CareerStepStatus,
  LeaderboardEntry,
  RightsFaq,
  RightsHelperOrg,
  RightsTopic,
} from "@/types";

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "היום";
  if (days === 1) return "לפני יום";
  if (days < 7) return `לפני ${days} ימים`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "לפני שבוע";
  return `לפני ${weeks} שבועות`;
}

export async function getRightsDataFromDb(): Promise<{
  topics: RightsTopic[];
  faqs: RightsFaq[];
  organizations: RightsHelperOrg[];
}> {
  const supabase = createClient();
  const [topicsRes, faqsRes, orgsRes] = await Promise.all([
    supabase.from("rights_topics").select("*").order("order_index"),
    supabase.from("rights_faqs").select("*").order("order_index"),
    supabase.from("rights_organizations").select("*").order("order_index"),
  ]);

  return {
    topics: (topicsRes.data ?? []).map((t) => ({
      id: t.slug,
      title: t.title,
      content: t.content,
    })),
    faqs: (faqsRes.data ?? []).map((f) => ({
      id: f.slug,
      question: f.question,
      answer: f.answer,
    })),
    organizations: (orgsRes.data ?? []).map((o) => ({
      id: o.slug,
      name: o.name,
      url: o.url ?? "",
      description: o.description,
    })),
  };
}

export async function getAchievementBadgesFromDb(
  userId?: string
): Promise<AchievementBadge[]> {
  const supabase = createClient();
  const { data: badges, error } = await supabase
    .from("achievement_badges")
    .select("*");
  if (error || !badges) return [];

  let earnedSlugs = new Set<string>();
  if (userId) {
    const { data: earned } = await supabase
      .from("achievements")
      .select("badge_slug")
      .eq("user_id", userId);
    earnedSlugs = new Set((earned ?? []).map((e) => e.badge_slug));
  }

  return badges.map((b) => ({
    id: b.slug,
    icon: b.icon,
    title: b.title,
    condition: b.description,
    earned: earnedSlugs.has(b.slug),
  }));
}

export async function getActivityFeedFromDb(
  userId: string
): Promise<ActivityFeedItem[]> {
  const supabase = createClient();
  const [achievementsRes, progressRes, badgesRes] = await Promise.all([
    supabase
      .from("achievements")
      .select("id, earned_at, badge_slug")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_progress")
      .select("module_id, module_type, updated_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("achievement_badges").select("slug, title, icon"),
  ]);

  const badgeMap = new Map(
    (badgesRes.data ?? []).map((b) => [b.slug, b])
  );

  const items: { at: string; item: ActivityFeedItem }[] = [];

  for (const row of achievementsRes.data ?? []) {
    const badge = badgeMap.get(row.badge_slug);
    items.push({
      at: row.earned_at,
      item: {
        id: row.id,
        icon: badge?.icon ?? "military_tech",
        title: "קיבלת תג חדש:",
        detail: badge?.title ?? row.badge_slug,
        timeAgo: formatTimeAgo(row.earned_at),
      },
    });
  }

  for (const row of progressRes.data ?? []) {
    items.push({
      at: row.updated_at,
      item: {
        id: `${row.module_type}-${row.module_id}`,
        icon: row.module_type === "skill" ? "psychology" : "school",
        title: "השלמת מודול:",
        detail: row.module_id,
        timeAgo: formatTimeAgo(row.updated_at),
      },
    });
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8)
    .map((entry) => entry.item);
}

function stepStatus(done: boolean, active: boolean): CareerStepStatus {
  if (done) return "done";
  if (active) return "active";
  return "pending";
}

export async function getCareerPathFromDb(userId: string): Promise<CareerPath> {
  const supabase = createClient();
  const [profileRes, assessmentRes, progressRes, savedRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("assessment_results")
      .select("id")
      .eq("user_id", userId)
      .limit(1),
    supabase
      .from("user_progress")
      .select("completed, progress")
      .eq("user_id", userId),
    supabase
      .from("saved_professions")
      .select("id")
      .eq("user_id", userId)
      .limit(1),
  ]);

  const onboardingDone = profileRes.data?.onboarding_complete ?? false;
  const assessmentDone = (assessmentRes.data?.length ?? 0) > 0;
  const progressRows = progressRes.data ?? [];
  const learningDone =
    progressRows.some((r) => r.completed) ||
    progressRows.some((r) => r.progress >= 50);
  const savedProfession = (savedRes.data?.length ?? 0) > 0;

  const flags = [onboardingDone, assessmentDone, learningDone, savedProfession, false];
  const completedCount = flags.filter(Boolean).length;
  const activeIndex = flags.findIndex((f) => !f);
  const stepNumber = activeIndex === -1 ? flags.length : activeIndex + 1;

  const steps = [
    { label: "השלמת פרופיל", status: stepStatus(onboardingDone, !onboardingDone) },
    {
      label: "אבחון תעסוקתי",
      status: stepStatus(
        assessmentDone,
        onboardingDone && !assessmentDone
      ),
    },
    {
      label: "למידה והכשרה",
      status: stepStatus(
        learningDone,
        assessmentDone && !learningDone
      ),
    },
    {
      label: "בחירת מקצוע",
      status: stepStatus(
        savedProfession,
        learningDone && !savedProfession
      ),
    },
    {
      label: "השמה בעבודה",
      status: stepStatus(false, savedProfession),
    },
  ];

  return {
    title: "מסלול קריירה: עבודה מותאמת",
    step: stepNumber,
    totalSteps: steps.length,
    percent: Math.round((completedCount / steps.length) * 100),
    steps,
  };
}

export async function getLeaderboardFromDb(
  currentUserId?: string
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data: earned } = await supabase
    .from("achievements")
    .select("user_id");

  if (!earned?.length) return [];

  const counts = new Map<string, number>();
  for (const row of earned) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }

  const userIds = Array.from(counts.keys());
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  const entries = userIds
    .map((userId) => {
      const profile = profileMap.get(userId);
      const first = profile?.first_name?.trim() ?? "";
      const lastInitial = profile?.last_name?.trim().charAt(0);
      const name =
        first && lastInitial
          ? `${first} ${lastInitial}.`
          : first || "משתמש/ת";

      return {
        userId,
        name,
        xp: (counts.get(userId) ?? 0) * 100,
        avatar: profile?.avatar ?? undefined,
        isCurrentUser: userId === currentUserId,
      };
    })
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10)
    .map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      xp: entry.xp,
      avatar: entry.avatar,
      isCurrentUser: entry.isCurrentUser,
    }));

  return entries;
}
