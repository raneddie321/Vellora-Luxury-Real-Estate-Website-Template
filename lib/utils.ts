import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/config/site";

/** Merge conditional class names, with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const intlLocale = siteConfig.locale.replace("_", "-");

/* -------------------------------------------------------------------------- */
/*                                 Formatters                                 */
/* -------------------------------------------------------------------------- */

const priceFormatter = new Intl.NumberFormat(intlLocale, {
  style: "currency",
  currency: siteConfig.market.currency,
  maximumFractionDigits: 0,
});

/** €4,250,000 — the canonical way a price appears on Vellora. */
export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

/** €4.25M — for tight spaces such as cards, chips and axis labels. */
export function formatPriceCompact(value: number): string {
  const { currencySymbol } = siteConfig.market;
  if (value >= 1_000_000_000) return `${currencySymbol}${trim(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `${currencySymbol}${trim(value / 1_000_000)}M`;
  if (value >= 1_000) return `${currencySymbol}${trim(value / 1_000)}K`;
  return `${currencySymbol}${value}`;
}

function trim(n: number): string {
  return n >= 100 ? String(Math.round(n)) : String(Number(n.toFixed(n >= 10 ? 1 : 2)));
}

export function formatRent(value: number, period: "month" | "week" = "month"): string {
  return `${priceFormatter.format(value)}/${period === "month" ? "mo" : "wk"}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(intlLocale).format(value);
}

/** 412 m² — respects siteConfig.market.areaUnit. */
export function formatArea(value: number): string {
  return siteConfig.market.areaUnit === "sqm"
    ? `${formatNumber(value)} m²`
    : `${formatNumber(Math.round(value * 10.7639))} sq ft`;
}

export const areaUnitLabel =
  siteConfig.market.areaUnit === "sqm" ? "m²" : "sq ft";

export function formatDate(iso: string, style: "long" | "short" = "long"): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(d);
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Stable pseudo-random pick so server and client agree without hydration noise. */
export function seededIndex(seed: string, length: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % Math.max(1, length);
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

/** "01", "02", … — the index numerals used throughout the editorial layouts. */
export function ordinal(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function readingTime(words: number): number {
  return Math.max(1, Math.round(words / 225));
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
