import Image from "next/image";
import { cn } from "@/lib/utils";
import { imageAspect, isVectorPlate, resolveImage } from "@/lib/images";
import type { ImageAsset } from "@/types";

type PlateProps = {
  asset: ImageAsset;
  /**
   * Art direction for narrow screens. A 3:2 plate cropped into a phone-shaped
   * frame becomes an unreadable band, so full-bleed heroes pass a portrait
   * plate here and it is swapped in below the `sm` breakpoint.
   */
  mobileAsset?: ImageAsset;
  /** Responsive sizes hint. Always pass one — it decides the bytes downloaded. */
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Applied to the <img> itself, for object-position and hover transforms. */
  imgClassName?: string;
  /** Tailwind aspect utility, e.g. "aspect-4/5". Omit to fill the parent. */
  ratio?: string;
  /** Warm cinematic gradient wash, for imagery that carries type on top. */
  wash?: boolean;
  grain?: boolean;
  quality?: number;
};

/**
 * Every image on the site goes through this component.
 *
 * It is a server component — no JavaScript ships for imagery. Swapping the
 * whole site to a CDN is a one-line change in `config/site.ts`; nothing here
 * needs to know where the bytes come from.
 */
export function Plate({
  asset,
  mobileAsset,
  sizes = "100vw",
  priority = false,
  className,
  imgClassName,
  ratio,
  wash = false,
  grain = false,
  quality = 82,
}: PlateProps) {
  const src = resolveImage(asset.key);
  const vector = isVectorPlate(src);
  const objectPosition = asset.focus ? `${asset.focus.x}% ${asset.focus.y}%` : undefined;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-content/[0.06]",
        ratio,
        wash && "image-wash",
        grain && "grain",
        className,
      )}
    >
      {mobileAsset ? (
        <Image
          src={resolveImage(mobileAsset.key)}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          priority={priority}
          quality={quality}
          unoptimized={isVectorPlate(resolveImage(mobileAsset.key))}
          loading={priority ? undefined : "lazy"}
          className={cn("object-cover sm:hidden", imgClassName)}
        />
      ) : null}
      <Image
        src={src}
        alt={asset.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        // Shipped plates are vector; running them through the raster optimiser
        // would cost bytes and gain nothing.
        unoptimized={vector}
        loading={priority ? undefined : "lazy"}
        style={objectPosition ? { objectPosition } : undefined}
        className={cn("object-cover", mobileAsset && "hidden sm:block", imgClassName)}
      />
    </div>
  );
}

/**
 * Intrinsic variant for flow layouts (article bodies, floor plans) where the
 * image should set its own height rather than fill a frame.
 */
export function PlateBlock({
  asset,
  sizes = "100vw",
  className,
  imgClassName,
  priority,
}: Pick<PlateProps, "asset" | "sizes" | "className" | "imgClassName" | "priority">) {
  const src = resolveImage(asset.key);
  const aspect = imageAspect(asset.key);
  return (
    <div className={cn("relative w-full overflow-hidden bg-content/[0.06]", className)}>
      <Image
        src={src}
        alt={asset.alt}
        width={1800}
        height={Math.round(1800 / aspect)}
        sizes={sizes}
        priority={priority}
        unoptimized={isVectorPlate(src)}
        className={cn("h-auto w-full", imgClassName)}
      />
    </div>
  );
}
