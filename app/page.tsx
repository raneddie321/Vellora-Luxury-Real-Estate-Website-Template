import { Hero } from "@/components/sections/hero";
import { EditorialIntro } from "@/components/sections/editorial-intro";
import { FeaturedProperty } from "@/components/sections/featured-property";
import { PropertyCollection } from "@/components/sections/property-collection";
import { SearchModule } from "@/components/sections/search-module";
import { DevelopmentsSection } from "@/components/sections/developments-section";
import { NeighborhoodsSection } from "@/components/sections/neighborhoods-section";
import { ServicesSection } from "@/components/sections/services-section";
import { AgentsSection } from "@/components/sections/agents-section";
import { JournalSection } from "@/components/sections/journal-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { StatsSection } from "@/components/sections/stats-section";
import { FinalCta } from "@/components/sections/final-cta";

import { properties, propertyBySlug } from "@/data/properties";
import { featuredDevelopments } from "@/data/developments";
import { neighborhoods } from "@/data/neighborhoods";
import { services } from "@/data/services";
import { featuredAgents } from "@/data/agents";
import { sortedArticles } from "@/data/articles";
import { featuredTestimonials } from "@/data/testimonials";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ path: "/", image: "cinema-01" });

export default function HomePage() {
  const hero = propertyBySlug("the-estuary-penthouse")!;
  const collection = properties
    .filter((p) => p.status !== "sold" && p.id !== hero.id)
    .slice(0, 6);

  return (
    <>
      <Hero />
      <EditorialIntro />
      <FeaturedProperty property={hero} />
      <PropertyCollection items={collection} />
      <SearchModule />
      <DevelopmentsSection items={featuredDevelopments} />
      <NeighborhoodsSection items={neighborhoods} />
      <ServicesSection items={services} />
      <AgentsSection items={featuredAgents.slice(0, 4)} />
      <JournalSection items={sortedArticles.slice(0, 4)} />
      <TestimonialsSection items={featuredTestimonials} />
      <StatsSection />
      <FinalCta />
    </>
  );
}
