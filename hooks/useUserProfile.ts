"use client";

import { useEffect, useState } from "react";
import {
  getDiagnosisLabel,
  type AutismLevel,
  type UserProfilePrefs,
} from "@/lib/user-profile";

interface ProfileResponse {
  profile: UserProfilePrefs | null;
}

export function useUserProfile(): {
  profile: UserProfilePrefs | null;
  loading: boolean;
  diagnosis: string;
  autismLevel?: AutismLevel;
  city?: string;
  diagnosisLabel: string;
} {
  const [profile, setProfile] = useState<UserProfilePrefs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then((res) => res.json() as Promise<ProfileResponse>)
      .then((data) => {
        if (active) setProfile(data.profile);
      })
      .catch(() => {
        if (active) setProfile(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const diagnosis = profile?.disability_type ?? "אוטיזם";
  const diagnosisLabel = profile
    ? getDiagnosisLabel(profile)
    : "אוטיזם";

  return {
    profile,
    loading,
    diagnosis,
    autismLevel: profile?.autism_level,
    city: profile?.city,
    diagnosisLabel,
  };
}
