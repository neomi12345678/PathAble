"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PROFILE_AVATAR_UPDATED_EVENT,
  type ProfileAvatarId,
} from "@/lib/profile-avatar";
import {
  getCustomAvatarDataUrl,
  resolveAvatarUrl,
} from "@/lib/profile-avatar.client";
import type { UserProfilePrefs } from "@/lib/user-profile";

interface ProfileResponse {
  profile: UserProfilePrefs | null;
}

export function useProfileAvatar(): {
  avatarUrl: string;
  avatarId: ProfileAvatarId | undefined;
  loading: boolean;
  refresh: () => void;
} {
  const [avatarId, setAvatarId] = useState<ProfileAvatarId | undefined>(
    undefined
  );
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setCustomUrl(getCustomAvatarDataUrl());
    fetch("/api/profile")
      .then((res) => res.json() as Promise<ProfileResponse>)
      .then((data) => {
        const id = data.profile?.avatar;
        setAvatarId(
          id && typeof id === "string" ? (id as ProfileAvatarId) : undefined
        );
      })
      .catch(() => setAvatarId(undefined))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const onUpdate = (): void => {
      setCustomUrl(getCustomAvatarDataUrl());
      load();
    };
    window.addEventListener(PROFILE_AVATAR_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(PROFILE_AVATAR_UPDATED_EVENT, onUpdate);
  }, [load]);

  return {
    avatarUrl: resolveAvatarUrl(avatarId, customUrl),
    avatarId,
    loading,
    refresh: load,
  };
}
