import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Compass,
  Handshake,
  Home,
  KeyRound,
  LineChart,
  Users,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = NavLink & {
  children?: NavLink[];
};

/** Primary desktop navigation — mirrored in the full-screen mobile menu. */
export const primaryNav: NavGroup[] = [
  { label: "Properties", href: "/properties", description: "The full collection" },
  { label: "Developments", href: "/developments", description: "New and forthcoming" },
  { label: "Agents", href: "/agents", description: "The people behind the work" },
  { label: "Neighbourhoods", href: "/neighborhoods", description: "Where to live" },
  { label: "Services", href: "/services", description: "How we can help" },
  { label: "Journal", href: "/journal", description: "Market notes and essays" },
  { label: "About", href: "/about", description: "The house of Vellora" },
];

/** Secondary links surfaced inside the mobile menu and the footer. */
export const utilityNav: NavLink[] = [
  { label: "Search", href: "/search" },
  { label: "Favourites", href: "/favorites" },
  { label: "Compare", href: "/compare" },
  { label: "Mortgage Calculator", href: "/mortgage-calculator" },
  { label: "Book a Viewing", href: "/book-a-viewing" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export const serviceNav: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Buying", href: "/services/buying", icon: Home },
  { label: "Selling", href: "/services/selling", icon: Handshake },
  { label: "Renting", href: "/services/renting", icon: KeyRound },
  { label: "Investment", href: "/services/investment", icon: LineChart },
  { label: "Property Management", href: "/services/property-management", icon: Building2 },
  { label: "Relocation", href: "/services/relocation", icon: Compass },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Collection",
    links: [
      { label: "All properties", href: "/properties" },
      { label: "For sale", href: "/properties?listing=sale" },
      { label: "To rent", href: "/properties?listing=rent" },
      { label: "Developments", href: "/developments" },
      { label: "Neighbourhoods", href: "/neighborhoods" },
      { label: "Compare", href: "/compare" },
    ],
  },
  {
    title: "Services",
    links: serviceNav.map(({ label, href }) => ({ label, href })),
  },
  {
    title: "Studio",
    links: [
      { label: "About Vellora", href: "/about" },
      { label: "Our advisors", href: "/agents" },
      { label: "Journal", href: "/journal" },
      { label: "Contact", href: "/contact" },
      { label: "Frequently asked", href: "/faq" },
      { label: "Book a viewing", href: "/book-a-viewing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
    ],
  },
];

export const teamIcons = { Building2, Compass, Handshake, Home, KeyRound, LineChart, Users };
