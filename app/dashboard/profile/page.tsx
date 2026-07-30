import type { Metadata } from "next";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import {
  getAssessmentResult,
  getProfile,
  getProfileExtrasData,
  getProfessions,
  getSavedProfessionIds,
  getUserProgress,
} from "@/lib/data";
import { IMAGES } from "@/lib/assets/images";
import {
  isValidAvatarId,
  resolvePresetAvatarUrl,
  type ProfileAvatarId,
} from "@/lib/profile-avatar";
import { getDiagnosisLabel } from "@/lib/user-profile";
import { getUserProfilePrefsAsync } from "@/lib/user-profile.server";
import { APP_NAME, PROFILE } from "@/utils/texts";

export const metadata: Metadata = {
  title: `${PROFILE.title} | ${APP_NAME}`,
  description: PROFILE.subtitle,
};

function computeCompletion(
  hasOnboarding: boolean,
  hasAssessment: boolean,
  hasProgress: boolean,
  hasSaved: boolean
): number {
  let score = 0;
  if (hasOnboarding) score += 25;
  if (hasAssessment) score += 25;
  if (hasProgress) score += 25;
  if (hasSaved) score += 25;
  return score;
}

export default async function ProfilePage() {
  const [prefs, profile, extras, assessment, savedIds, professions, progress] =
    await Promise.all([
      getUserProfilePrefsAsync(),
      getProfile(),
      getProfileExtrasData(),
      getAssessmentResult(),
      getSavedProfessionIds(),
      getProfessions(),
      getUserProgress(),
    ]);

  const disabilityDisplay = prefs
    ? getDiagnosisLabel(prefs)
    : profile?.disability_type ?? "";

  const savedProfessions = professions.filter((p) => savedIds.includes(p.id));
  const roleLine =
    savedProfessions[0]?.name ??
    assessment?.recommendations[0] ??
    "מחפש/ת הזדמנויות תעסוקתיות";

  const completionPercent = computeCompletion(
    Boolean(prefs?.onboardingComplete),
    Boolean(assessment?.summary),
    progress.length > 0,
    savedProfessions.length > 0
  );

  const avatarId: ProfileAvatarId | undefined =
    prefs?.avatar && isValidAvatarId(prefs.avatar) ? prefs.avatar : undefined;
  const avatarUrl =
    avatarId && avatarId !== "custom"
      ? resolvePresetAvatarUrl(avatarId)
      : IMAGES.profileAvatar;

  return (
    <ProfileSettings
      data={{
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        email: profile?.email ?? "",
        phone: profile?.phone ?? "",
        city: profile?.city ?? "",
        sector: (prefs?.sector as string) ?? profile?.sector ?? "",
        disabilityType: disabilityDisplay,
        bio: extras.bio,
        roleLine,
        completionPercent,
        avatarUrl,
        avatarId,
        skills: extras.skills,
        interests: extras.interests,
      }}
    />
  );
}
