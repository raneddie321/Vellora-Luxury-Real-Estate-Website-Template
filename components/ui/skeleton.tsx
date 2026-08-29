import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden
      className={cn("animate-[var(--animate-shimmer)] bg-content/[0.08]", className)}
      {...props}
    />
  );
}

/** Matches the exact geometry of PropertyCard so nothing shifts on load. */
export function PropertyCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="space-y-2.5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
