import { MEDIA_DIMENSIONS, type MediaKey } from "@/lib/media-keys";
import { siteConfig } from "@/config/site";
import type { ImageAsset } from "@/types";

export type { MediaKey };

/**
 * Resolves an image key to a URL.
 *
 * By default this points at the art-directed plates that ship in
 * `/public/media`, so the template renders completely with no network access
 * and no third-party licences. Set `siteConfig.images.useRemote` to serve the
 * same keys from your own CDN instead — no component changes required.
 */
// Widened deliberately: these are switches the template owner flips, so the
// literal types inferred from `as const` would only get in the way.
const useRemote: boolean = siteConfig.images.useRemote;
const remoteBase: string = siteConfig.images.remoteBase;
const remoteExtension: string = siteConfig.images.remoteExtension;

export function resolveImage(key: string): string {
  if (useRemote && remoteBase) {
    return `${remoteBase.replace(/\/$/, "")}/${key}.${remoteExtension}`;
  }
  return `/media/${key}.svg`;
}

/** SVG plates are already vector — sending them through the optimiser is waste. */
export function isVectorPlate(src: string): boolean {
  return src.endsWith(".svg");
}

export function imageDimensions(key: string): { width: number; height: number } {
  return MEDIA_DIMENSIONS[key as MediaKey] ?? { width: 1800, height: 1200 };
}

export function imageAspect(key: string): number {
  const { width, height } = imageDimensions(key);
  return width / height;
}

/** Convenience factory so data files stay readable. */
export function img(key: MediaKey, alt: string, focus?: { x: number; y: number }): ImageAsset {
  return focus ? { key, alt, focus } : { key, alt };
}
