import { homeContent } from "@/config/content";
import { Plate } from "@/components/media/plate";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { ImageReveal } from "@/components/media/image-reveal";

/**
 * The statement section. Asymmetric on purpose: the type starts in column one,
 * the tall image sits in columns 8–12 and overlaps the section padding, and a
 * small detail plate breaks the grid from the left.
 */
export function EditorialIntro() {
  const { intro } = homeContent;

  return (
    <section className="section-y relative overflow-hidden bg-surface" aria-labelledby="intro-heading">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 xl:col-span-6">
            <Reveal>
              <p className="eyebrow rule-accent text-[var(--accent)]">{intro.eyebrow}</p>
            </Reveal>

            <RevealLines
              as="h2"
              id="intro-heading"
              lines={[...intro.headline]}
              delay={0.05}
              className="mt-7 font-serif text-title text-content"
            />

            <div className="mt-10 max-w-xl space-y-6">
              {intro.paragraphs.map((paragraph, i) => (
                <Reveal key={i} delay={0.12 + i * 0.07}>
                  <p className="text-lede text-content-muted">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <p className="mt-10 border-t border-hairline pt-6 text-[11px] tracking-[0.16em] text-content-faint uppercase">
                {intro.signature}
              </p>
            </Reveal>

            <Reveal delay={0.36}>
              <div className="mt-12 flex items-baseline gap-6 lg:mt-16">
                <span className="font-serif text-[3.5rem] leading-none tracking-[-0.04em] text-content tabular-nums">
                  {intro.stat.value}
                </span>
                <span className="measure-tight text-sm leading-snug text-content-muted">
                  {intro.stat.label}
                </span>
              </div>
            </Reveal>
          </div>

          <div className="relative lg:col-span-5 lg:col-start-8 xl:col-span-6 xl:col-start-7">
            <Parallax strength={5}>
              <ImageReveal>
                <Plate
                  asset={intro.image}
                  ratio="aspect-4/5"
                  sizes="(min-width: 1024px) 42vw, 92vw"
                  className="w-full"
                />
              </ImageReveal>
            </Parallax>

            {/* A second, smaller plate stepping outside the column. */}
            <div className="absolute -bottom-10 -left-6 hidden w-[42%] sm:block lg:-left-16 xl:-left-24">
              <ImageReveal delay={0.18} from="left">
                <Plate
                  asset={intro.detail}
                  ratio="aspect-square"
                  sizes="(min-width: 1024px) 18vw, 40vw"
                  className="w-full shadow-[var(--shadow-lift)]"
                />
              </ImageReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
