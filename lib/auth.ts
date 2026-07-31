import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { tryCreateClient } from "@/lib/supabase/server";

export const ADMIN_ROLE = "admin";

export interface SessionData {
  userId: string;
  role: string;
  email?: string;
}

export async function getSession(): Promise<SessionData | null> {
  const supabase = tryCreateClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = tryCreateAdminClient();
  if (!admin) {
    return {
      userId: user.id,
      role: "user",
      email: user.email,
    };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    role: profile?.role ?? "user",
    email: user.email,
  };
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === ADMIN_ROLE;
}

export async function hasCompletedOnboardingAuth(): Promise<boolean> {
  const supabase = tryCreateClient();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const admin = tryCreateAdminClient();
  if (!admin) return false;

  const { data } = await admin
    .from("profiles")
    .select("onboarding_complete, disability_type")
    .eq("id", user.id)
    .maybeSingle();

  return (
    data?.onboarding_complete === true &&
    typeof data.disability_type === "string" &&
    data.disability_type.trim().length > 0
  );
}
