"use client";

import { useProfileAvatar } from "@/hooks/useProfileAvatar";

interface UserAvatarProps {
  className?: string;
  rounded?: "full" | "3xl";
  showOnline?: boolean;
}

export function UserAvatar({
  className = "h-12 w-12",
  rounded = "full",
  showOnline = false,
}: UserAvatarProps) {
  const { avatarUrl } = useProfileAvatar();
  const radius = rounded === "full" ? "rounded-full" : "rounded-3xl";

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`h-full w-full overflow-hidden border-2 border-white bg-cover bg-center shadow-md ${radius}`}
        style={{ backgroundImage: `url('${avatarUrl}')` }}
        role="img"
        aria-label="תמונת פרופיל"
      />
      {showOnline && (
        <span className="absolute bottom-0 left-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  );
}
