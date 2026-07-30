import { IMAGES } from "@/lib/assets/images";

export const CUSTOM_AVATAR_ID = "custom" as const;

export const PROFILE_AVATAR_PRESETS = {
  default: { label: "ברירת מחדל", url: IMAGES.profileAvatar },
  mentor: { label: "מנטור/ית", url: IMAGES.mentor },
  skills: { label: "מקצועי/ת", url: IMAGES.skillsUserPortrait },
  coach: { label: "מאמן/ת", url: IMAGES.coachPortrait },
  ai: { label: "דיגיטלי", url: IMAGES.aiAvatar },
} as const;

export type ProfileAvatarPresetId = keyof typeof PROFILE_AVATAR_PRESETS;
export type ProfileAvatarId = ProfileAvatarPresetId | typeof CUSTOM_AVATAR_ID;

export function isValidAvatarId(value: string): value is ProfileAvatarId {
  return value === CUSTOM_AVATAR_ID || value in PROFILE_AVATAR_PRESETS;
}

export function resolvePresetAvatarUrl(
  id: ProfileAvatarPresetId | undefined
): string {
  if (id && id in PROFILE_AVATAR_PRESETS) {
    return PROFILE_AVATAR_PRESETS[id].url;
  }
  return IMAGES.profileAvatar;
}

export const PROFILE_AVATAR_UPDATED_EVENT = "profile-avatar-updated";
