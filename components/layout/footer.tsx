import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { newsletterContent } from "@/config/content";

const socialLabels: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
  pinterest: "Pinterest",
};

export function Footer() {
  const year = new Date().getFullYear();
  const { address, phone, phoneHref, email, hours } = siteConfig.contact;

  return (
    <footer className="theme-dark bg-surface text-content">
      <div className="shell">
        {/* Newsletter sits above the rule, as the last thing worth asking for. */}
        <div className="grid gap-10 border-b border-hairline py-16 md:grid-cols-12 md:gap-8 lg:py-20">
          <div className="md:col-span-5">
            <p className="eyebrow text-[var(--accent)]">{newsletterContent.eyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl leading-[0.98] tracking-[-0.035em] sm:text-5xl">
              {newsletterContent.title}
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="measure text-[0.95rem] leading-relaxed text-content-muted">
              {newsletterContent.description}
            </p>
            <NewsletterForm className="mt-7" />
          </div>
        </div>

        <div className="grid gap-12 py-16 md:grid-cols-12 md:gap-8 lg:py-20">
          <div className="md:col-span-4">
            <Logo size="md" />
            <p className="measure-tight mt-7 text-sm leading-relaxed text-content-muted">
              {siteConfig.shortDescription}
            </p>
            <address className="mt-8 space-y-1 text-sm not-italic text-content-muted">
              <p>{address.line1}</p>
              <p>{address.line2}</p>
              <p>
                {address.postcode} {address.city}, {address.country}
              </p>
            </address>
            <div className="mt-6 space-y-1.5 text-sm">
              <p>
                <a href={`tel:${phoneHref}`} className="link-rule text-content hover:text-content">
                  {phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${email}`} className="link-rule text-content-muted hover:text-content">
                  {email}
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 md:col-span-7 md:col-start-6">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3 className="eyebrow text-content-faint">{group.title}</h3>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="link-rule text-sm text-content-muted hover:text-content"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="grid gap-8 border-t border-hairline py-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h3 className="eyebrow text-content-faint">Opening hours</h3>
            <ul className="mt-4 space-y-1.5 text-sm text-content-muted">
              {hours.map((slot) => (
                <li key={slot.days} className="flex justify-between gap-6 sm:max-w-xs">
                  <span>{slot.days}</span>
                  <span className="tabular-nums">{slot.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <h3 className="eyebrow text-content-faint">Follow</h3>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
              {Object.entries(siteConfig.social).map(([key, href]) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex items-center gap-1 text-sm text-content-muted transition-colors hover:text-content"
                  >
                    {socialLabels[key] ?? key}
                    <ArrowUpRight
                      className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-hairline py-8 text-xs text-content-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legal.copyrightHolder}. {siteConfig.legal.registration}.
          </p>
          <p className="max-w-xl leading-relaxed">{siteConfig.legal.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
