import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types";

const LABELS: Record<Property["status"], string> = {
  available: "Available",
  "under-offer": "Under offer",
  reserved: "Reserved",
  sold: "Sold",
  let: "Let",
};

/** Only shown when it changes what a buyer should do. "Available" is the default. */
export function StatusBadge({
  status,
  variant = "overlay",
}: {
  status: Property["status"];
  variant?: "overlay" | "outline";
}) {
  if (status === "available") return null;
  const tone = status === "sold" || status === "let" ? "danger" : variant;
  return <Badge variant={tone}>{LABELS[status]}</Badge>;
}

export function isNewListing(listedAt: string, days = 21): boolean {
  const listed = new Date(listedAt).getTime();
  // Fixed reference so server and client agree; see data/properties.ts.
  const reference = new Date("2026-08-29").getTime();
  return reference - listed < days * 24 * 60 * 60 * 1000;
}

export { LABELS as STATUS_LABELS };
