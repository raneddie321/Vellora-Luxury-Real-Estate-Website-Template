import { PageHero } from "@/components/layout/page-hero";
import { FavoritesList } from "@/components/property/favorites-list";
import { CtaBand } from "@/components/sections/cta-band";
import { buildMetadata } from "@/lib/seo";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "Favourites",
  description: "Your saved properties, kept in this browser.",
  path: "/favorites",
  noIndex: true,
});

export default function FavoritesPage() {
  return (
    <>
      <PageHero
        eyebrow="Favourites"
        headline={["Your shortlist."]}
        supporting="Saved properties live in this browser. Nothing is sent to us until you send it."
        crumbs={[{ label: "Home", href: "/" }, { label: "Favourites" }]}
        variant="plain"
      />
      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell">
          <FavoritesList />
        </div>
      </section>
      <CtaBand
        eyebrow="Ready to see them?"
        headline={["Book two viewings", "in one afternoon."]}
        supporting="Send us your shortlist and we will arrange a route that works — usually three properties in three hours."
        primary={{ label: "Book a viewing", href: "/book-a-viewing" }}
        secondary={{ label: "Compare shortlist", href: "/compare" }}
        image={img("cinema-12", "A residence at dusk")}
      />
    </>
  );
}
