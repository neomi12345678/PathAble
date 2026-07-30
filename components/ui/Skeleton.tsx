import type { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
}

const baseClass = "animate-pulse rounded-xl bg-surface-container-high";

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`${baseClass} ${className}`} aria-hidden="true" />;
}

export function SkeletonCard(): ReactNode {
  return (
    <div className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }): ReactNode {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
