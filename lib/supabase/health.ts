import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SupabaseHealthStatus {
  configured: boolean;
  connected: boolean;
  tablesReady: boolean;
  professionsCount: number | null;
  error: string | null;
}

export async function getSupabaseHealthStatus(): Promise<SupabaseHealthStatus> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      tablesReady: false,
      professionsCount: null,
      error: "חסרים NEXT_PUBLIC_SUPABASE_URL או NEXT_PUBLIC_SUPABASE_ANON_KEY ב-.env.local",
    };
  }

  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("professions")
      .select("slug", { count: "exact" })
      .limit(1);

    if (error) {
      const missingTable =
        error.message.includes("does not exist") ||
        error.message.includes("Could not find");
      const networkError =
        error.message.includes("fetch failed") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("getaddrinfo");
      return {
        configured: true,
        connected: !networkError,
        tablesReady: !missingTable && !networkError,
        professionsCount: null,
        error: missingTable
          ? "הטבלאות לא קיימות — הרץ supabase/migrations/001_initial.sql ב-SQL Editor"
          : networkError
            ? "לא ניתן להגיע ל-Supabase — בדוק ש-NEXT_PUBLIC_SUPABASE_URL נכון (Settings → General → Project URL)"
            : error.message,
      };
    }

    const hasData = (count ?? 0) > 0;
    return {
      configured: true,
      connected: true,
      tablesReady: true,
      professionsCount: count,
      error: hasData ? null : "מחובר, אבל DB ריק — הרץ npm run seed",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאת חיבור";
    const missingServiceKey = message.includes("Missing Supabase admin");
    return {
      configured: true,
      connected: false,
      tablesReady: false,
      professionsCount: null,
      error: missingServiceKey
        ? "חסר SUPABASE_SERVICE_ROLE_KEY ב-.env.local"
        : message,
    };
  }
}
