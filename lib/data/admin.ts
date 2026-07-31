import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminUser } from "@/components/admin/UserTable";

function getAdminClientOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

function initials(first: string | null, last: string | null, email: string | null): string {
  const f = first?.trim().charAt(0) ?? "";
  const l = last?.trim().charAt(0) ?? "";
  if (f || l) return `${f}${l}`;
  return (email?.charAt(0) ?? "?").toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("he-IL");
}

const DAY_LABELS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

export async function getAdminUsersFromDb(): Promise<AdminUser[]> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, sector, onboarding_complete, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((row, idx) => ({
    id: row.id,
    name:
      [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
      row.email ||
      "משתמש",
    initials: initials(row.first_name, row.last_name, row.email),
    email: row.email ?? "—",
    status: row.onboarding_complete ? ("active" as const) : ("pending" as const),
    track: row.sector ?? "טרם הושלם onboarding",
    joined: formatDate(row.created_at),
    accent: idx % 2 === 0 ? ("primary" as const) : ("secondary" as const),
  }));
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  completedModules: number;
  totalJobs: number;
  weeklySignups: { day: string; count: number; tone: string; h: number }[];
}

export async function getAdminStatsFromDb(): Promise<AdminStats> {
  const supabase = getAdminClientOrNull();
  if (!supabase) {
    return {
      totalUsers: 0,
      activeUsers: 0,
      completedModules: 0,
      totalJobs: 0,
      weeklySignups: Array.from({ length: 7 }, (_, i) => ({
        day: DAY_LABELS[i],
        count: 0,
        tone: "muted",
        h: 5,
      })),
    };
  }

  const [profilesRes, progressRes, jobsRes] = await Promise.all([
    supabase.from("profiles").select("id, onboarding_complete, created_at"),
    supabase
      .from("user_progress")
      .select("id")
      .eq("module_type", "learning")
      .eq("completed", true),
    supabase.from("jobs").select("slug", { count: "exact", head: true }).eq("active", true),
  ]);

  const profiles = profilesRes.data ?? [];
  const totalUsers = profiles.length;
  const activeUsers = profiles.filter((p) => p.onboarding_complete).length;
  const completedModules = progressRes.data?.length ?? 0;
  const totalJobs = jobsRes.count ?? 0;

  const now = new Date();
  const dailyCounts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return profiles.filter((p) => {
      const created = new Date(p.created_at);
      return created >= d && created < next;
    }).length;
  });

  const maxCount = Math.max(...dailyCounts, 1);

  const weeklySignups = dailyCounts.map((count, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const tone =
      count === maxCount && count > 0
        ? "highlight"
        : i % 3 === 1
          ? "secondary"
          : count === 0
            ? "muted"
            : "primary";
    return {
      day: DAY_LABELS[d.getDay()],
      count,
      tone,
      h: Math.round((count / maxCount) * 90) + (count > 0 ? 10 : 5),
    };
  });

  return {
    totalUsers,
    activeUsers,
    completedModules,
    totalJobs,
    weeklySignups,
  };
}

export async function getRegisteredUserCount(): Promise<number> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}
