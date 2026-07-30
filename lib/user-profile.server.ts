import "server-only";
import { getAuthUser } from "@/lib/data/auth";
import { getProfilePrefsForUser } from "@/lib/data/profile";
import type { UserProfilePrefs } from "@/lib/user-profile";

export async function getUserProfilePrefsAsync(): Promise<UserProfilePrefs | null> {
  const user = await getAuthUser();
  if (!user) return null;
  return getProfilePrefsForUser(user.id);
}

export async function hasCompletedOnboardingAsync(): Promise<boolean> {
  const profile = await getUserProfilePrefsAsync();
  return profile?.onboardingComplete === true && !!profile?.disability_type;
}
