import type { ProfileInterest } from "@/types";
import type { UserProfilePrefs } from "@/lib/user-profile";
import type { ProfileRow } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import { tryCreateClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

import {
  isValidProfessionInterestId,
  profileInterestOptionsForUi,
} from "@/lib/professions/profession-interests";
function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email ?? "",
    first_name: row.first_name ?? "",
    last_name: row.last_name ?? "",
    phone: row.phone ?? "",
    age: row.age ?? 0,
    city: row.city ?? "",
    sector: (row.sector ?? "חילוני") as Profile["sector"],
    disability_type: row.disability_type ?? "",
    role: (row.role ?? "user") as Profile["role"],
    created_at: row.created_at,
  };
}

export function rowToProfilePrefs(row: ProfileRow): UserProfilePrefs | null {
  if (!row.disability_type?.trim()) return null;
  return {
    sector: row.sector ?? "",
    disability_type: row.disability_type,
    autism_level:
      row.autism_level as UserProfilePrefs["autism_level"] | undefined,
    city: row.city ?? undefined,
    onboardingComplete: row.onboarding_complete,
    avatar: row.avatar ?? undefined,
    interests: (row.interests ?? []).filter(
      (id): id is string =>
        typeof id === "string" && isValidProfessionInterestId(id)
    ),
  };
}

export async function getProfileByUserId(
  userId: string
): Promise<Profile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapProfile(data);
}

export async function getProfilePrefsForUser(
  userId: string
): Promise<UserProfilePrefs | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProfilePrefs(data);
}

export async function updateProfileOnboarding(
  userId: string,
  prefs: UserProfilePrefs,
  email?: string
): Promise<UserProfilePrefs> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: email ?? null,
        role: "user",
        sector: prefs.sector,
        disability_type: prefs.disability_type,
        autism_level: prefs.autism_level ?? null,
        onboarding_complete: prefs.onboardingComplete,
        avatar: prefs.avatar ?? null,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Profile update failed");

  const { error: metaError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      onboarding_complete: prefs.onboardingComplete,
      disability_type: prefs.disability_type,
      sector: prefs.sector,
      autism_level: prefs.autism_level ?? null,
    },
  });
  if (metaError) {
    // Profile row is the source of truth; metadata sync is best-effort
    const { logger } = await import("@/lib/logger");
    logger.error("User metadata sync failed", { error: metaError.message });
  }

  return rowToProfilePrefs(data)!;
}

export async function updateProfileAvatar(
  userId: string,
  avatar: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export interface ProfileUpdateInput {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  bio: string;
  skills: string[];
  interests: string[];
  email_notifications?: boolean;
}

export async function updateProfileDetails(
  userId: string,
  input: ProfileUpdateInput
): Promise<void> {
  const interests = input.interests.filter(isValidProfessionInterestId);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: input.first_name,
      last_name: input.last_name,
      phone: input.phone,
      city: input.city,
      bio: input.bio,
      skills: input.skills,
      interests,
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  if (input.email_notifications !== undefined) {
    // עדכון נפרד — לא מפיל את שמירת הפרופיל אם המיגרציה (003) עדיין לא רצה
    const { error: prefsError } = await supabase
      .from("profiles")
      .update({
        preferences: { email_notifications: input.email_notifications },
      })
      .eq("id", userId);
    if (prefsError) {
      const { logger } = await import("@/lib/logger");
      logger.warn("Preferences update failed (run migration 003)", {
        error: prefsError.message,
      });
    }
  }
}

/** מחיקת חשבון לצמיתות — מחיקת משתמש ה-auth מוחקת את כל הנתונים בקסקדה */
export async function deleteUserAccount(userId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}

export async function getProfileExtras(userId: string): Promise<{
  bio: string;
  skills: string[];
  interests: ProfileInterest[];
  emailNotifications: boolean;
}> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("bio, skills, interests, preferences")
    .eq("id", userId)
    .maybeSingle();

  const interestIds = (data?.interests ?? []) as string[];
  const interests = profileInterestOptionsForUi(
    interestIds.filter(isValidProfessionInterestId)
  );

  const prefs = (data?.preferences ?? {}) as Record<string, unknown>;

  return {
    bio: data?.bio ?? "",
    skills: (data?.skills as string[] | null) ?? [],
    interests,
    emailNotifications: prefs.email_notifications !== false,
  };
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await tryCreateClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return getProfileByUserId(user.id);
}
