import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Plate } from "@/components/media/plate";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";

export function AgentCard({
  agent,
  className,
  sizes = "(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 88vw",
  priority,
}: {
  agent: Agent;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <article className={cn("group/agent relative flex flex-col", className)}>
      <div className="relative overflow-hidden">
        <Plate
          asset={agent.portrait}
          ratio="aspect-4/5"
          sizes={sizes}
          priority={priority}
          imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-editorial)] group-hover/agent:scale-[1.04]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent opacity-0 transition-opacity duration-700 group-hover/agent:opacity-100"
        />
        <span className="pointer-events-none absolute bottom-4 left-4 z-10 flex translate-y-2 flex-wrap gap-x-2 gap-y-1 opacity-0 transition-all duration-500 ease-[var(--ease-editorial)] group-hover/agent:translate-y-0 group-hover/agent:opacity-100">
          {agent.specialties.slice(0, 2).map((s) => (
            <span
              key={s}
              className="border border-paper/30 px-2 py-0.5 text-[10px] tracking-[0.14em] text-paper uppercase"
            >
              {s}
            </span>
          ))}
        </span>
      </div>

      <div className="pt-5">
        <h3 className="font-serif text-2xl leading-tight tracking-[-0.025em] text-content">
          <Link
            href={`/agents/${agent.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {agent.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-sm text-content-muted">{agent.title}</p>
        <p className="mt-3.5 flex items-center gap-2 border-t border-hairline pt-3.5 text-[11px] tracking-[0.14em] text-content-faint uppercase">
          {agent.location}
          <ArrowUpRight
            className="ml-auto size-3.5 transition-transform duration-500 group-hover/agent:translate-x-0.5 group-hover/agent:-translate-y-0.5"
            aria-hidden
          />
        </p>
      </div>
    </article>
  );
}
