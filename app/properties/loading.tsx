import { PropertyCardSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-surface pt-32 pb-24 lg:pt-44">
      <div className="shell">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="mt-8 h-16 w-2/3 sm:h-20" />
        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="hidden space-y-5 lg:col-span-3 lg:block">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only" role="status">
        Loading properties
      </span>
    </div>
  );
}
