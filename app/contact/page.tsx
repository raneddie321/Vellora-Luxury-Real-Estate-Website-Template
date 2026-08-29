import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/forms/contact-form";
import { StaticMap } from "@/components/property/static-map";
import { Reveal } from "@/components/motion/reveal";
import { siteConfig } from "@/config/site";
import { contactContent } from "@/config/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Speak to a Vellora advisor. Office address, opening hours, direct lines and an enquiry form that reaches the right district desk.",
  path: "/contact",
  image: "map-01",
});

const socialLabels: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
  pinterest: "Pinterest",
};

export default function ContactPage() {
  const { contact, social } = siteConfig;

  return (
    <>
      <PageHero
        eyebrow={contactContent.eyebrow}
        headline={[...contactContent.headline]}
        supporting={contactContent.supporting}
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        variant="plain"
      />

      <section className="bg-surface pb-24 lg:pb-32">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="eyebrow rule-accent text-[var(--accent)]">
                {contactContent.formTitle}
              </h2>
            </Reveal>
            <Reveal delay={0.06}>
              <ContactForm className="mt-9" />
            </Reveal>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.1}>
              <div className="border border-hairline p-7">
                <h2 className="eyebrow text-content-faint">The office</h2>
                <address className="mt-5 flex gap-3.5 text-sm leading-relaxed text-content-muted not-italic">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-content-faint" aria-hidden />
                  <span>
                    {contact.address.line1}
                    <br />
                    {contact.address.line2}
                    <br />
                    {contact.address.postcode} {contact.address.city}
                    <br />
                    {contact.address.country}
                  </span>
                </address>

                <div className="mt-6 space-y-3 border-t border-hairline pt-5 text-sm">
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="flex items-center gap-3.5 text-content transition-colors hover:text-content-muted"
                  >
                    <Phone className="size-4 shrink-0 text-content-faint" aria-hidden />
                    {contact.phone}
                  </a>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3.5 break-all text-content-muted transition-colors hover:text-content"
                  >
                    <Mail className="size-4 shrink-0 text-content-faint" aria-hidden />
                    {contact.email}
                  </a>
                </div>

                <div className="mt-6 border-t border-hairline pt-5">
                  <h3 className="flex items-center gap-2.5 text-[11px] tracking-[0.18em] text-content-faint uppercase">
                    <Clock className="size-3.5" aria-hidden />
                    Opening hours
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    {contact.hours.map((slot) => (
                      <li key={slot.days} className="flex justify-between gap-4">
                        <span className="text-content-muted">{slot.days}</span>
                        <span className="shrink-0 text-content tabular-nums">{slot.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-hairline pt-5">
                  <h3 className="eyebrow text-content-faint">Other enquiries</h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>
                      <a href={`mailto:${contact.pressEmail}`} className="link-rule text-content-muted hover:text-content">
                        Press — {contact.pressEmail}
                      </a>
                    </li>
                    <li>
                      <a href={`mailto:${contact.careersEmail}`} className="link-rule text-content-muted hover:text-content">
                        Careers — {contact.careersEmail}
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 border-t border-hairline pt-5">
                  <h3 className="eyebrow text-content-faint">Follow</h3>
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    {Object.entries(social).map(([key, href]) => (
                      <li key={key}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="link-rule text-content-muted hover:text-content"
                        >
                          {socialLabels[key] ?? key}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="pb-24 lg:pb-32">
        <div className="shell">
          <Reveal>
            <StaticMap
              address={`${contact.address.line1}, ${contact.address.city}`}
              coordinates={contact.coordinates}
              seed="vellora-office"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
