"use client";

import { Heart } from "lucide-react";
import { useCollections } from "@/components/providers/collection-provider";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  propertyId,
  propertyName,
  className,
  tone = "overlay",
  size = "md",
}: {
  propertyId: string;
  propertyName: string;
  className?: string;
  tone?: "overlay" | "plain";
  size?: "sm" | "md";
}) {
  const { isFavorite, toggleFavorite, ready } = useCollections();
  const { toast } = useToast();
  const active = ready && isFavorite(propertyId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${propertyName} from favourites` : `Save ${propertyName} to favourites`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const added = toggleFavorite(propertyId);
        toast({
          title: added ? "Saved to favourites" : "Removed from favourites",
          description: propertyName,
          tone: added ? "success" : "default",
        });
      }}
      className={cn(
        "relative z-20 inline-flex items-center justify-center transition-all duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
        size === "sm" ? "size-9" : "size-11",
        tone === "overlay"
          ? "border border-paper/30 bg-ink/30 text-paper backdrop-blur-[2px] hover:border-paper/60 hover:bg-ink/50"
          : "border border-hairline text-content hover:border-content",
        className,
      )}
    >
      <Heart
        className={cn(
          "transition-all duration-300",
          size === "sm" ? "size-4" : "size-[18px]",
          active ? "scale-110 fill-current text-[var(--color-gold-400)]" : "",
        )}
        aria-hidden
      />
    </button>
  );
}
