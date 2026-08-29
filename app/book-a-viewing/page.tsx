import { PageHero } from "@/components/layout/page-hero";
import { BookingFlow } from "@/components/booking/booking-flow";
import { bookingContent } from "@/config/content";
import { properties } from "@/data/properties";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Book a viewing",
  description:
    "Arrange a private viewing in five steps. Choose the property, pick a date and time, and an advisor will confirm within one working day.",
  path: "/book-a-viewing",
  image: "cinema-07",
});

export default async function BookAViewingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.property) ? params.property[0] : params.property;
  const initialSlug = properties.some((p) => p.slug === raw) ? raw : undefined;

  return (
    <>
      <PageHero
        eyebrow={bookingContent.eyebrow}
        headline={[...bookingContent.headline]}
        supporting={bookingContent.supporting}
        crumbs={[{ label: "Home", href: "/" }, { label: "Book a viewing" }]}
        variant="plain"
      />
      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell">
          <BookingFlow initialSlug={initialSlug} />
        </div>
      </section>
    </>
  );
}
