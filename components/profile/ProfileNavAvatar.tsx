"use client";

import Link from "next/link";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";

export function ProfileNavAvatar() {
  const { avatarUrl } = useProfileAvatar();

  return (
    <Link
      href="/dashboard/profile"
      className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-cover bg-center shadow-md focus-visible:ring-2 focus-visible:ring-primary"
      style={{ backgroundImage: `url('${avatarUrl}')` }}
      aria-label="אזור אישי"
    >
      <span className="absolute bottom-0 left-0 h-3 w-3 rounded-full border border-white bg-green-500" />
    </Link>
  );
}
