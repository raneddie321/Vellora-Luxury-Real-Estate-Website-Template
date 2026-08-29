"use client";

import { Check, Scale } from "lucide-react";
import { useCollections, COMPARE_LIMIT } from "@/components/providers/collection-provider";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function CompareToggle({
  propertyId,
  propertyName,
  className,
  withLabel = false,
}: {
  propertyId: string;
  propertyName: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { isComparing, toggleCompare, ready } = useCollections();
  const { toast } = useToast();
  const active = ready && isComparing(propertyId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${propertyName} from comparison` : `Add ${propertyName} to comparison`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const { added, full } = toggleCompare(propertyId);
        if (full) {
          toast({
            title: `You can compare ${COMPARE_LIMIT} properties at a time`,
            description: "Remove one to add another.",
            tone: "error",
          });
          return;
        }
        toast({
          title: added ? "Added to comparison" : "Removed from comparison",
          description: propertyName,
          tone: added ? "success" : "default",
        });
      }}
      className={cn(
        "relative z-20 inline-flex items-center justify-center gap-2 border transition-all duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
        withLabel ? "h-11 px-4 text-[11px] tracking-[0.16em] uppercase" : "size-11",
        active
          ? "border-content bg-content text-surface"
          : "border-hairline text-content hover:border-content",
        className,
      )}
    >
      {active ? <Check className="size-4" aria-hidden /> : <Scale className="size-4" aria-hidden />}
      {withLabel ? <span>{active ? "Comparing" : "Compare"}</span> : null}
    </button>
  );
}
