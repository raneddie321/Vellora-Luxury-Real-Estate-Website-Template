import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Plate } from "@/components/media/plate";
import { AgentCard } from "@/components/cards/agent-card";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { StatsSection } from "@/components/sections/stats-section";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ImageReveal } from "@/components/media/image-reveal";
import { aboutContent } from "@/config/content";
import { agents } from "@/data/agents";
import { featuredTestimonials } from "@/data/testimonials";
import { buildMetadata } from "@/lib/seo";
import { ordinal } from "@/lib/utils";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "About Vellora",
  description:
    "Founded in 2009 on the idea that a smaller book, handled properly, beats a larger one handled quickly. The story, the philosophy and the people.",
  path: "/about",
  image: "cinema-09",
});

export default function AboutPage() {
  const { hero, story, philosophy, timeline, achievements } = aboutContent;

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        headline={[...hero.headline]}
        supporting={hero.supporting}
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        image={hero.image}
        mobileImage={img("tall-01", "The Vellora office")}
      />

      <section className="section-y bg-surface">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">{story.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-serif text-title text-content">{story.title}</h2>
            </Reveal>
            <div className="prose-editorial mt-9">
              {story.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <ImageReveal>
              <Plate
                asset={story.image}
                ratio="aspect-4/5"
                sizes="(min-width: 1024px) 40vw, 92vw"
              />
            </ImageReveal>
          </div>
        </div>
      </section>

      <section className="theme-dark section-y bg-surface text-content">
        <div className="shell">
          <Reveal>
            <p className="eyebrow rule-accent text-[var(--accent)]">{philosophy.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-serif text-title">{philosophy.title}</h2>
          </Reveal>

          <RevealGroup className="mt-14 grid border-t border-hairline sm:grid-cols-2">
            {philosophy.values.map((value, i) => (
              <RevealItem
                key={value.title}
                className="border-b border-hairline py-9 sm:[&:nth-child(2n)]:border-l sm:[&:nth-child(2n)]:pl-9 sm:[&:nth-child(2n+1)]:pr-9"
              >
                <span className="eyebrow text-content-faint tabular-nums">({ordinal(i)})</span>
                <h3 className="mt-6 font-serif text-2xl tracking-[-0.028em] sm:text-3xl">
                  {value.title}
                </h3>
                <p className="measure mt-4 text-[0.95rem] leading-relaxed text-content-muted">
                  {value.description}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <StatsSection />

      <section className="section-y bg-surface">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">{timeline.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-serif text-title text-content">{timeline.title}</h2>
            </Reveal>
          </div>
          <RevealGroup className="lg:col-span-7 lg:col-start-6">
            <ol className="border-t border-hairline">
              {timeline.entries.map((entry) => (
                <RevealItem key={entry.year}>
                  <li className="grid gap-2 border-b border-hairline py-6 sm:grid-cols-12 sm:gap-6">
                    <span className="font-serif text-xl text-content tabular-nums sm:col-span-2">
                      {entry.year}
                    </span>
                    <span className="text-base text-content sm:col-span-4">{entry.title}</span>
                    <span className="text-sm leading-relaxed text-content-muted sm:col-span-6">
                      {entry.description}
                    </span>
                  </li>
                </RevealItem>
              ))}
            </ol>
          </RevealGroup>
        </div>
      </section>

      <section className="section-y bg-surface-sunken">
        <div className="shell">
          <Reveal>
            <p className="eyebrow rule-accent text-[var(--accent)]">{achievements.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-serif text-title text-content">{achievements.title}</h2>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-x-10 border-t border-hairline sm:grid-cols-2 lg:grid-cols-3">
            {achievements.items.map((item) => (
              <RevealItem key={item.title}>
                <div className="border-b border-hairline py-6">
                  <p className="eyebrow text-content-faint tabular-nums">{item.year}</p>
                  <p className="mt-3 text-base text-content">{item.title}</p>
                  <p className="mt-1.5 text-sm text-content-muted">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Reveal>
                <p className="eyebrow rule-accent text-[var(--accent)]">The team</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-6 font-serif text-title text-content">Thirty-one people</h2>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <Link
                href="/agents"
                className="link-rule text-[11px] tracking-[0.18em] text-content uppercase"
              >
                All advisors
              </Link>
            </Reveal>
          </div>
          <RevealGroup className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {agents.slice(0, 8).map((agent) => (
              <RevealItem key={agent.id}>
                <AgentCard agent={agent} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <TestimonialsSection items={featuredTestimonials} />

      <CtaBand
        eyebrow="Work with us"
        headline={["A smaller book,", "handled properly."]}
        supporting="If that sounds like the way you would like your own sale or search handled, we should talk."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "Browse properties", href: "/properties" }}
        image={img("cinema-06", "A residence at dusk")}
      />
    </>
  );
}
