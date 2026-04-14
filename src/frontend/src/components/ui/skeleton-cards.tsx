import { Skeleton } from "@/components/ui/skeleton";

/**
 * Card-shaped skeleton matching lesson/service card dimensions.
 */
export function SkeletonCard() {
  return (
    <div className="card-base p-6 space-y-4">
      <Skeleton className="h-40 w-full rounded-md" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Media card skeleton.
 */
export function SkeletonMediaCard() {
  return (
    <div className="card-base overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
