import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a route segment streams in. Mirrors the shape of a page hero. */
export default function Loading() {
  return (
    <div className="bg-surface pt-32 pb-24 lg:pt-44">
      <div className="shell">
        <Skeleton className="h-2.5 w-28" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-14 w-3/4 sm:h-20" />
          <Skeleton className="h-14 w-1/2 sm:h-20" />
        </div>
        <Skeleton className="mt-10 h-4 w-full max-w-lg" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
        <div className="mt-20 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-4/3 w-full" />
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
    </div>
  );
}
