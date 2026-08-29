import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { agents, agentBySlug } from "@/data/agents";
import { properties } from "@/data/properties";
import { testimonials } from "@/data/testimonials";
import { neighborhoodBySlug } from "@/data/neighborhoods";
import { buildMetadata } from "@/lib/seo";
import { Plate } from "@/components/media/plate";
import { PropertyCard } from "@/components/property/property-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ContactForm } from "@/components/forms/contact-form";
import { CtaBand } from "@/components/sections/cta-band";
import { formatPriceCompact, seededIndex } from "@/lib/utils";
import { img } from "@/lib/images";

export function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) return buildMetadata({ title: "Advisor not found", noIndex: true });
  return buildMetadata({
    title: `${agent.name} — ${agent.title}`,
    description: agent.bio[0] ?? "",
    path: `/agents/${agent.slug}`,
    image: agent.portrait.key,
    type: "profile",
  });
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) notFound();

  const listings = properties.filter((p) => p.agentId === agent.id && p.status !== "sold");
  const quote = testimonials[seededIndex(agent.id, testimonials.length)];

  const stats = [
    { label: "Years advising", value: String(agent.yearsExperience) },
    { label: "Transactions", value: String(agent.transactions) },
    { label: "Represented", value: formatPriceCompact(agent.volume) },
    { label: "Live instructions", value: String(listings.length) },
  ];

  return (
    <>
      <section className="bg-surface pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="shell">
          <Reveal>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Agents", href: "/agents" },
                { label: agent.name },
              ]}
            />
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <Reveal>
                <Plate
                  asset={agent.portrait}
                  ratio="aspect-4/5"
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  priority
                />
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal delay={0.06}>
                <p className="eyebrow rule-accent text-[var(--accent)]">{agent.title}</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="mt-6 font-serif text-title text-content">{agent.name}</h1>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="prose-editorial mt-8 text-[1rem]">
                  {agent.bio.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.18}>
                <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-hairline pt-7 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-[10px] tracking-[0.2em] text-content-faint uppercase">
                        {stat.label}
                      </dt>
                      <dd className="mt-2 font-serif text-2xl tracking-[-0.02em] text-content tabular-nums">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={0.22}>
                <div className="mt-10 grid gap-8 border-t border-hairline pt-7 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow text-content-faint">Specialisms</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {agent.specialties.map((item) => (
                        <li
                          key={item}
                          className="border border-hairline px-2.5 py-1 text-[11px] tracking-[0.1em] text-content-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="eyebrow mt-7 text-content-faint">Languages</p>
                    <p className="mt-3 text-sm text-content-muted">{agent.languages.join(", ")}</p>
                  </div>
                  <div>
                    <p className="eyebrow text-content-faint">Districts</p>
                    <ul className="mt-4 space-y-2">
                      {agent.neighborhoodSlugs.map((hoodSlug) => {
                        const hood = neighborhoodBySlug(hoodSlug);
                        if (!hood) return null;
                        return (
                          <li key={hoodSlug}>
                            <Link
                              href={`/neighborhoods/${hoodSlug}`}
                              className="link-rule text-sm text-content-muted hover:text-content"
                            >
                              {hood.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-7 space-y-2.5 text-sm">
                      <a
                        href={`tel:${agent.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2.5 text-content-muted transition-colors hover:text-content"
                      >
                        <Phone className="size-3.5 shrink-0 text-content-faint" aria-hidden />
                        {agent.phone}
                      </a>
                      <a
                        href={`mailto:${agent.email}`}
                        className="flex items-center gap-2.5 break-all text-content-muted transition-colors hover:text-content"
                      >
                        <Mail className="size-3.5 shrink-0 text-content-faint" aria-hidden />
                        {agent.email}
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.26}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <a href="#contact">Contact {agent.name.split(" ")[0]}</a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/book-a-viewing">Book a viewing</Link>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {quote ? (
        <section className="theme-dark section-y-sm bg-surface text-content">
          <div className="shell">
            <Reveal>
              <figure className="measure">
                <blockquote>
                  <p className="font-serif text-[1.7rem] leading-[1.2] tracking-[-0.025em] sm:text-[2.2rem]">
                    <span aria-hidden className="text-[var(--accent)]">“</span>
                    {quote.quote}
                    <span aria-hidden className="text-[var(--accent)]">”</span>
                  </p>
                </blockquote>
                <figcaption className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-hairline pt-5 text-sm">
                  <span className="text-content">{quote.name}</span>
                  <span className="text-content-muted">{quote.role}</span>
                  <span className="text-[11px] tracking-[0.14em] text-content-faint uppercase">
                    {quote.location}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="section-y bg-surface">
        <div className="shell">
          <Reveal>
            <p className="eyebrow rule-accent text-[var(--accent)]">Current instructions</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-serif text-title text-content">
              Represented by {agent.name.split(" ")[0]}
            </h2>
          </Reveal>

          {listings.length ? (
            <RevealGroup className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((property) => (
                <RevealItem key={property.id}>
                  <PropertyCard property={property} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <EmptyState
              className="mt-14"
              eyebrow="Nothing live"
              title="No public instructions at the moment."
              description="Which usually means everything is under offer. Get in touch — there is often something off-market."
              action={
                <Button asChild>
                  <a href="#contact">Contact {agent.name.split(" ")[0]}</a>
                </Button>
              }
            />
          )}
        </div>
      </section>

      <section id="contact" className="section-y bg-surface-sunken scroll-mt-28">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">Get in touch</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-serif text-title text-content">
                Write to {agent.name.split(" ")[0]}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="measure mt-6 text-lede text-content-muted">
                Messages go straight to {agent.name.split(" ")[0]}, not to a general inbox. Replies
                usually come the same working day.
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.14}>
              <ContactForm compact defaultReason="Buying a property" recipient={agent.name} />
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Elsewhere"
        headline={["Twelve advisors,", "six districts."]}
        supporting="If your search sits somewhere else in the city, someone here already knows the street."
        primary={{ label: "Meet the team", href: "/agents" }}
        secondary={{ label: "Browse properties", href: "/properties" }}
        image={img("cinema-10", "The city at night")}
      />
    </>
  );
}
