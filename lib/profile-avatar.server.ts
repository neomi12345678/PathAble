import {
  isValidAvatarId,
  resolvePresetAvatarUrl,
  type ProfileAvatarPresetId,
} from "@/lib/profile-avatar";
import { IMAGES } from "@/lib/assets/images";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getProfileAvatarUrlForUser(
  userId: string
): Promise<string> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("avatar")
    .eq("id", userId)
    .maybeSingle();

  const avatarId = data?.avatar;
  if (
    avatarId &&
    isValidAvatarId(avatarId) &&
    avatarId !== "custom"
  ) {
    return resolvePresetAvatarUrl(avatarId as ProfileAvatarPresetId);
  }

  return IMAGES.profileAvatar;
}
