import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { AgentCard } from "@/components/cards/agent-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { agents } from "@/data/agents";
import { buildMetadata } from "@/lib/seo";
import { formatPriceCompact, ordinal } from "@/lib/utils";
import { img } from "@/lib/images";

export const metadata = buildMetadata({
  title: "Our advisors",
  description:
    "Twelve Vellora advisors, each responsible for a district they live in. Specialisms, languages, transaction history and direct contact details.",
  path: "/agents",
  image: "portrait-01",
});

export default function AgentsPage() {
  const totalVolume = agents.reduce((sum, a) => sum + a.volume, 0);
  const totalTransactions = agents.reduce((sum, a) => sum + a.transactions, 0);
  const languages = new Set(agents.flatMap((a) => a.languages));

  return (
    <>
      <PageHero
        eyebrow="The advisors"
        headline={["People, not", "a switchboard."]}
        supporting="Most of our advisors came from architecture, restoration, planning or finance rather than sales. It shows in what they notice, and in what they tell you not to buy."
        crumbs={[{ label: "Home", href: "/" }, { label: "Agents" }]}
        variant="plain"
        meta={[
          { label: "Advisors", value: String(agents.length) },
          { label: "Transactions", value: String(totalTransactions) },
          { label: "Represented", value: formatPriceCompact(totalVolume) },
          { label: "Languages", value: String(languages.size) },
        ]}
      />

      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell">
          <RevealGroup className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent, i) => (
              <RevealItem key={agent.id}>
                <AgentCard agent={agent} priority={i < 4} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="theme-dark section-y bg-surface text-content">
        <div className="shell">
          <Reveal>
            <p className="eyebrow rule-accent text-[var(--accent)]">By specialism</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-serif text-title">Who to call</h2>
          </Reveal>

          <RevealGroup className="mt-12 border-t border-hairline">
            {agents.map((agent, i) => (
              <RevealItem key={`row-${agent.id}`}>
                <Link
                  href={`/agents/${agent.slug}`}
                  className="group grid gap-3 border-b border-hairline py-6 transition-colors hover:bg-content/[0.04] sm:grid-cols-12 sm:items-baseline"
                >
                  <span className="eyebrow text-content-faint tabular-nums sm:col-span-1">
                    {ordinal(i)}
                  </span>
                  <span className="font-serif text-xl tracking-[-0.02em] sm:col-span-3">
                    {agent.name}
                  </span>
                  <span className="text-sm text-content-muted sm:col-span-3">{agent.title}</span>
                  <span className="text-sm text-content-muted sm:col-span-3">
                    {agent.specialties.join(" · ")}
                  </span>
                  <span className="text-[11px] tracking-[0.14em] text-content-faint uppercase sm:col-span-2 sm:text-right">
                    {agent.location}
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBand
        eyebrow="Talk to someone"
        headline={["The right advisor", "is a phone call away."]}
        supporting="Tell us the district and the brief. We will put you with the person who knows the street."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "Book a viewing", href: "/book-a-viewing" }}
        image={img("cinema-04", "The city at night")}
      />
    </>
  );
}
