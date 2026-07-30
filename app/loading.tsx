import { SkeletonList } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="p-6">
      <SkeletonList count={4} />
    </div>
  );
}
