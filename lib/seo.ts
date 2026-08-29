import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import { resolveImage } from "@/lib/images";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  authors?: string[];
  noIndex?: boolean;
};

/**
 * One place that builds page metadata. Every route calls this so titles,
 * canonicals, Open Graph and Twitter cards can never drift apart.
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = "editorial-01",
  type = "website",
  publishedTime,
  authors,
  noIndex,
}: SeoInput = {}): Metadata {
  const fullTitle = title ? `${title} — ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;
  const url = absoluteUrl(path);
  const ogImage = image.startsWith("http") ? image : absoluteUrl(resolveImage(image));

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: type === "profile" ? "profile" : type,
      images: [{ url: ogImage, width: 1800, height: 1200, alt: fullTitle }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** JSON-LD graph for the organisation — rendered once, in the root layout. */
export function organizationJsonLd() {
  const { name, legalName, url, description, contact, social, legal } = siteConfig;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name,
    legalName,
    url,
    description,
    email: contact.email,
    telephone: contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.line1,
      addressLocality: contact.address.city,
      postalCode: contact.address.postcode,
      addressCountry: contact.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: contact.coordinates.lat,
      longitude: contact.coordinates.lng,
    },
    sameAs: Object.values(social),
    identifier: legal.registration,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
