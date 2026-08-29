import { AgentCard } from "@/components/cards/agent-card";
import { SectionHeader } from "@/components/sections/section-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { homeContent } from "@/config/content";
import type { Agent } from "@/types";

export function AgentsSection({ items }: { items: Agent[] }) {
  return (
    <section className="section-y bg-surface" aria-labelledby="agents-heading">
      <div className="shell">
        <SectionHeader
          eyebrow={homeContent.agents.eyebrow}
          headline={homeContent.agents.headline}
          supporting={homeContent.agents.supporting}
          cta={homeContent.agents.cta}
        />
        <RevealGroup className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {items.map((agent) => (
            <RevealItem key={agent.id}>
              <AgentCard agent={agent} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
