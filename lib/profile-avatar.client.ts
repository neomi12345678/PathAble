import {
  CUSTOM_AVATAR_ID,
  PROFILE_AVATAR_UPDATED_EVENT,
  resolvePresetAvatarUrl,
  type ProfileAvatarId,
  type ProfileAvatarPresetId,
} from "@/lib/profile-avatar";
import { IMAGES } from "@/lib/assets/images";

export const CUSTOM_AVATAR_STORAGE_KEY = "atid-avatar-custom";
const MAX_FILE_BYTES = 500_000;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function getCustomAvatarDataUrl(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOM_AVATAR_STORAGE_KEY);
}

export function setCustomAvatarDataUrl(dataUrl: string): void {
  localStorage.setItem(CUSTOM_AVATAR_STORAGE_KEY, dataUrl);
}

export function clearCustomAvatarDataUrl(): void {
  localStorage.removeItem(CUSTOM_AVATAR_STORAGE_KEY);
}

export function notifyAvatarUpdated(): void {
  window.dispatchEvent(new Event(PROFILE_AVATAR_UPDATED_EVENT));
}

export function resolveAvatarUrl(
  avatarId: ProfileAvatarId | undefined,
  customDataUrl: string | null = getCustomAvatarDataUrl()
): string {
  if (avatarId === CUSTOM_AVATAR_ID && customDataUrl) {
    return customDataUrl;
  }
  if (avatarId && avatarId !== CUSTOM_AVATAR_ID) {
    return resolvePresetAvatarUrl(avatarId as ProfileAvatarPresetId);
  }
  return IMAGES.profileAvatar;
}

export async function readAvatarFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    throw new Error("יש להעלות קובץ JPG, PNG או WebP בלבד");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("התמונה גדולה מדי (מקסימום 500KB)");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("לא ניתן לקרוא את הקובץ"));
      }
    };
    reader.onerror = () => reject(new Error("לא ניתן לקרוא את הקובץ"));
    reader.readAsDataURL(file);
  });
}
