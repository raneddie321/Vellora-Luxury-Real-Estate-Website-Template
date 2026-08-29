import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";

export type LegalSection = { heading: string; paragraphs: string[]; list?: string[] };

/**
 * One layout for all three legal documents: a quiet masthead, a jump list and
 * numbered sections. Keeps the policies looking like part of the site rather
 * than a bolted-on afterthought.
 */
export function LegalPage({
  title,
  intro,
  updatedAt,
  sections,
}: {
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        headline={[title]}
        supporting={intro}
        crumbs={[{ label: "Home", href: "/" }, { label: title }]}
        variant="plain"
        meta={[{ label: "Last updated", value: formatDate(updatedAt) }]}
      />

      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <nav aria-label="On this page" className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow text-content-faint">Contents</p>
              <ol className="mt-5 space-y-2.5 border-t border-hairline pt-5">
                {sections.map((section, i) => (
                  <li key={section.heading}>
                    <a
                      href={`#s-${i + 1}`}
                      className="link-rule flex gap-3 text-sm text-content-muted hover:text-content"
                    >
                      <span className="shrink-0 tabular-nums text-content-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="lg:col-span-8 lg:col-start-5">
            {sections.map((section, i) => (
              <Reveal key={section.heading}>
                <section id={`s-${i + 1}`} className="scroll-mt-28 border-t border-hairline pt-8 pb-10">
                  <p className="eyebrow text-content-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.03em] text-content">
                    {section.heading}
                  </h2>
                  <div className="prose-editorial mt-6 text-[1rem]">
                    {section.paragraphs.map((paragraph, j) => (
                      <p key={j}>{paragraph}</p>
                    ))}
                    {section.list ? (
                      <ul>
                        {section.list.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
