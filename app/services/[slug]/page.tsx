import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services, serviceBySlug } from "@/data/services";
import { faqsByIds } from "@/data/faqs";
import { testimonialById } from "@/data/testimonials";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { Plate } from "@/components/media/plate";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CtaBand } from "@/components/sections/cta-band";
import { ordinal } from "@/lib/utils";
import { img } from "@/lib/images";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return buildMetadata({ title: "Service not found", noIndex: true });
  return buildMetadata({
    title: service.name,
    description: service.summary,
    path: `/services/${service.slug}`,
    image: service.hero.key,
  });
}

/** Splits a stat like "97.4%" or "€358M" into a number and its trimmings. */
function parseStat(value: string) {
  const match = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const numeric = Number(digits!.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return null;
  const decimals = digits!.includes(".") ? digits!.split(".")[1]!.length : 0;
  return { prefix: prefix ?? "", value: numeric, suffix: suffix ?? "", decimals };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  const faqs = faqsByIds([...service.faqIds]);
  const testimonial = testimonialById(service.testimonialId);

  return (
    <>
      <PageHero
        eyebrow={service.name}
        headline={[service.headline]}
        supporting={service.summary}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
        image={service.hero}
      />

      <section className="section-y bg-surface">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <div className="prose-editorial">
              {service.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal delay={0.08}>
              <Plate
                asset={service.image}
                ratio="aspect-4/5"
                sizes="(min-width: 1024px) 40vw, 92vw"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="theme-dark section-y bg-surface text-content">
        <div className="shell">
          <Reveal>
            <p className="eyebrow rule-accent text-[var(--accent)]">The process</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-serif text-title">How it runs</h2>
          </Reveal>

          <RevealGroup className="mt-14 grid border-t border-hairline sm:grid-cols-2 lg:grid-cols-3">
            {service.process.map((step, i) => (
              <RevealItem
                key={step.title}
                className="border-b border-hairline p-7 sm:[&:nth-child(2n)]:border-l lg:[&:nth-child(2n)]:border-l-0 lg:[&:not(:nth-child(3n+1))]:border-l"
              >
                <span className="font-serif text-[3rem] leading-none tracking-[-0.04em] text-content-faint/45 tabular-nums">
                  {ordinal(i)}
                </span>
                <h3 className="mt-6 font-serif text-2xl tracking-[-0.025em]">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-content-muted">
                  {step.description}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section-y bg-surface">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">What you get</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-serif text-title text-content">The difference</h2>
            </Reveal>
          </div>
          <RevealGroup className="lg:col-span-6 lg:col-start-7">
            <dl className="border-t border-hairline">
              {service.benefits.map((benefit) => (
                <RevealItem key={benefit.title}>
                  <div className="border-b border-hairline py-6">
                    <dt className="text-lg text-content">{benefit.title}</dt>
                    <dd className="measure mt-2.5 text-sm leading-relaxed text-content-muted">
                      {benefit.description}
                    </dd>
                  </div>
                </RevealItem>
              ))}
            </dl>
          </RevealGroup>
        </div>
      </section>

      <section className="section-y-sm bg-surface-sunken">
        <div className="shell">
          <dl className="grid gap-y-10 border-y border-hairline py-12 sm:grid-cols-3">
            {service.stats.map((stat, i) => {
              const parsed = parseStat(stat.value);
              return (
                <Reveal key={stat.label} delay={i * 0.08} className="sm:px-6 sm:first:pl-0">
                  <dd className="font-serif text-[3rem] leading-none tracking-[-0.04em] text-content tabular-nums sm:text-[3.5rem]">
                    {parsed ? (
                      <Counter
                        value={parsed.value}
                        prefix={parsed.prefix}
                        suffix={parsed.suffix}
                        decimals={parsed.decimals}
                      />
                    ) : (
                      stat.value
                    )}
                  </dd>
                  <dt className="mt-4 max-w-[26ch] text-sm text-content-muted">{stat.label}</dt>
                </Reveal>
              );
            })}
          </dl>
        </div>
      </section>

      {testimonial ? (
        <section className="section-y bg-surface">
          <div className="shell">
            <Reveal>
              <figure className="measure">
                <blockquote>
                  <p className="font-serif text-[1.8rem] leading-[1.18] tracking-[-0.028em] text-content sm:text-[2.4rem]">
                    <span aria-hidden className="text-[var(--accent)]">“</span>
                    {testimonial.quote}
                    <span aria-hidden className="text-[var(--accent)]">”</span>
                  </p>
                </blockquote>
                <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1.5 border-t border-hairline pt-6">
                  <span className="text-base text-content">{testimonial.name}</span>
                  <span className="text-sm text-content-muted">{testimonial.role}</span>
                  <span className="text-[11px] tracking-[0.16em] text-content-faint uppercase">
                    {testimonial.location}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>
      ) : null}

      {faqs.length ? (
        <section className="section-y bg-surface-sunken">
          <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <Reveal>
                <p className="eyebrow rule-accent text-[var(--accent)]">Questions</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-6 font-serif text-title text-content">
                  {service.name}, answered
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <Link
                  href="/faq"
                  className="link-rule mt-7 inline-block text-[11px] tracking-[0.18em] text-content uppercase"
                >
                  All questions
                </Link>
              </Reveal>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <Reveal delay={0.08}>
                <Accordion type="single" collapsible className="border-t border-hairline">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow={service.name}
        headline={[service.ctaLabel + "."]}
        supporting="One conversation, no obligation, and an honest view on whether we are the right firm for it."
        primary={{ label: service.ctaLabel, href: `/contact?service=${service.slug}` }}
        secondary={{ label: "All services", href: "/services" }}
        image={img("cinema-08", "A residence at dusk")}
      />
    </>
  );
}
