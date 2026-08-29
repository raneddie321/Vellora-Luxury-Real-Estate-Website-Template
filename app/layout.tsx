import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CollectionProvider } from "@/components/providers/collection-provider";
import { ToastProvider } from "@/components/ui/toast";
import { CompareBar } from "@/components/property/compare-bar";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...buildMetadata(),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  keywords: [
    "luxury real estate",
    "prime property",
    "property for sale",
    siteConfig.market.city,
    "penthouse",
    "villa",
    "estate agent",
  ],
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ed" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.language} className={`${sans.variable} ${serif.variable}`}>
      <head>
        {/*
          Scroll reveals are a progressive enhancement. Without JavaScript the
          motion library never runs, so its initial `opacity: 0` would hide the
          page permanently — this puts everything back.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-reveal-curtain]{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh antialiased">
        <script
          type="application/ld+json"
          // Static, authored JSON-LD — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <CollectionProvider>
          <ToastProvider>
            <Navbar />
            <main id="main">{children}</main>
            <CompareBar />
            <Footer />
          </ToastProvider>
        </CollectionProvider>
      </body>
    </html>
  );
}
