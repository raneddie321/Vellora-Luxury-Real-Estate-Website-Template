"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Check, Loader2, Search } from "lucide-react";
import { Plate } from "@/components/media/plate";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, InputBoxed, Textarea } from "@/components/ui/input";
import { Calendar } from "@/components/booking/calendar";
import { bookingContent } from "@/config/content";
import { properties } from "@/data/properties";
import { agentById } from "@/data/agents";
import { neighborhoodName } from "@/data/neighborhoods";
import { email as emailRule, phone as phoneRule, required, submitDemo, validate } from "@/lib/validation";
import { cn, formatDate, formatPrice, formatRent, ordinal, seededIndex } from "@/lib/utils";

const SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

type Details = { name: string; email: string; phone: string; message: string };

const bookable = properties.filter((p) => p.status !== "sold" && p.status !== "let");

/**
 * Five steps, one piece of state, and no navigation away from the page.
 * Everything is frontend-only — `submitDemo` stands in for the request so the
 * loading and success states are real.
 */
export function BookingFlow({ initialSlug }: { initialSlug?: string }) {
  const reduce = useReducedMotion();
  const [step, setStep] = React.useState(() => (initialSlug ? 1 : 0));
  const [slug, setSlug] = React.useState<string | null>(initialSlug ?? null);
  const [date, setDate] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<string | null>(null);
  const [details, setDetails] = React.useState<Details>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof Details, string>>>({});
  const [query, setQuery] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [reference, setReference] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const property = bookable.find((p) => p.slug === slug);
  const agent = property ? agentById(property.agentId) : undefined;

  const results = React.useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return bookable;
    return bookable.filter((p) => {
      const haystack =
        `${p.name} ${p.address} ${p.type} ${p.reference} ${neighborhoodName(p.neighborhoodSlug)}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [query]);

  // Some slots are taken. Deterministic, so the page does not change under you.
  const unavailable = React.useMemo(() => {
    if (!date) return new Set<string>();
    const taken = new Set<string>();
    const base = seededIndex(date + (slug ?? ""), SLOTS.length);
    taken.add(SLOTS[base]!);
    taken.add(SLOTS[(base + 3) % SLOTS.length]!);
    return taken;
  }, [date, slug]);

  const canAdvance = [Boolean(slug), Boolean(date), Boolean(time), true, true][step];

  function go(next: number) {
    setStep(next);
    // Move focus to the new step so a screen reader announces the change.
    window.setTimeout(() => headingRef.current?.focus(), 60);
  }

  function next() {
    if (step < 4) go(step + 1);
  }

  async function submit() {
    // The details step ends in "Confirm booking" rather than "Continue", so
    // this is the only gate the contact details ever pass through.
    const found = validate(details, {
      name: [required("Your name")],
      email: [emailRule],
      phone: [phoneRule],
    });
    setErrors(found);
    if (Object.keys(found).length) {
      const firstKey = Object.keys(found)[0];
      document.getElementById(`booking-${firstKey}`)?.focus();
      return;
    }
    setSubmitting(true);
    await submitDemo({ slug, date, time, details });
    setReference(`VW-${String(Math.abs(seededIndex(`${slug}${date}${time}`, 9000) + 1000))}`);
    setSubmitting(false);
    go(4);
  }

  const summary = [
    { label: "Property", value: property?.name ?? "Not chosen" },
    { label: "Date", value: date ? formatDate(date) : "Not chosen" },
    { label: "Time", value: time ?? "Not chosen" },
    { label: "Name", value: details.name || "—" },
  ];

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
      {/* --- Step rail ------------------------------------------------- */}
      <div className="min-w-0 lg:col-span-4">
        <ol className="lg:sticky lg:top-28">
          {bookingContent.steps.map((item, i) => {
            const state = i === step ? "current" : i < step ? "done" : "todo";
            return (
              <li key={item.title} className="relative flex gap-5 pb-8 last:pb-0">
                {i < bookingContent.steps.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-9 bottom-1 left-[13px] w-px transition-colors duration-500",
                      state === "done" ? "bg-[var(--accent)]" : "bg-hairline",
                    )}
                  />
                ) : null}
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 flex size-7 shrink-0 items-center justify-center border text-[10px] tabular-nums transition-colors duration-500",
                    state === "current" && "border-content bg-content text-surface",
                    state === "done" && "border-[var(--accent)] bg-[var(--accent)] text-surface",
                    state === "todo" && "border-hairline text-content-faint",
                  )}
                >
                  {state === "done" ? <Check className="size-3.5" /> : ordinal(i)}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p
                    className={cn(
                      "text-base transition-colors duration-500",
                      state === "todo" ? "text-content-faint" : "text-content",
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* --- Step panel ------------------------------------------------ */}
      <div className="min-w-0 lg:col-span-7 lg:col-start-6">
        <div className="border border-hairline bg-surface-raised p-6 sm:p-9">
          <div className="flex items-center justify-between gap-4 border-b border-hairline pb-5">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="min-w-0 font-serif text-2xl tracking-[-0.025em] text-content outline-none sm:text-3xl"
            >
              {bookingContent.steps[step]?.title}
            </h2>
            <p className="shrink-0 text-xs text-content-faint tabular-nums">
              Step {step + 1} of {bookingContent.steps.length}
            </p>
          </div>

          <div
            aria-hidden
            className="mt-5 h-px w-full bg-hairline"
          >
            <div
              className="h-px bg-[var(--accent)] transition-[width] duration-700 ease-[var(--ease-editorial)]"
              style={{ width: `${((step + 1) / bookingContent.steps.length) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: reduce ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: reduce ? 0.01 : 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-8"
            >
              {step === 0 ? (
                <div>
                  <label htmlFor="booking-search" className="sr-only">
                    Search properties
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-content-faint"
                      aria-hidden
                    />
                    <InputBoxed
                      id="booking-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, district or reference"
                      className="pl-10"
                    />
                  </div>

                  <ul className="mt-6 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                    {results.map((item) => {
                      const active = item.slug === slug;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => setSlug(item.slug)}
                            aria-pressed={active}
                            className={cn(
                              "flex w-full items-center gap-4 border p-3 text-left transition-colors duration-300",
                              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)]",
                              active
                                ? "border-content bg-content/[0.04]"
                                : "border-hairline hover:border-hairline-strong",
                            )}
                          >
                            <Plate
                              asset={item.images[0]!}
                              className="w-20 shrink-0"
                              ratio="aspect-4/3"
                              sizes="80px"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-base text-content">
                                {item.name}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-content-muted">
                                {neighborhoodName(item.neighborhoodSlug)} · {item.type}
                              </span>
                              <span className="mt-1 block text-xs text-content-faint tabular-nums">
                                {item.listing === "rent"
                                  ? formatRent(item.price, item.pricePeriod ?? "month")
                                  : formatPrice(item.price)}
                              </span>
                            </span>
                            {active ? (
                              <Check className="size-4 shrink-0 text-[var(--accent)]" aria-hidden />
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                    {!results.length ? (
                      <li className="border border-dashed border-hairline p-8 text-center text-sm text-content-muted">
                        Nothing matches that. Clear the search to see everything.
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {step === 1 ? (
                <Calendar value={date} onChange={(iso) => { setDate(iso); setTime(null); }} />
              ) : null}

              {step === 2 ? (
                <div>
                  <p className="flex items-center gap-2.5 text-sm text-content-muted">
                    <CalendarIcon className="size-4 text-content-faint" aria-hidden />
                    {date ? formatDate(date) : ""}
                  </p>
                  <ul className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {SLOTS.map((slot) => {
                      const taken = unavailable.has(slot);
                      const active = time === slot;
                      return (
                        <li key={slot}>
                          <button
                            type="button"
                            disabled={taken}
                            aria-pressed={active}
                            onClick={() => setTime(slot)}
                            className={cn(
                              "w-full border py-3 text-sm tabular-nums transition-colors duration-200",
                              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)]",
                              taken && "cursor-not-allowed border-hairline text-content-faint/40 line-through",
                              !taken && !active && "border-hairline text-content hover:border-content",
                              active && "border-content bg-content text-surface",
                            )}
                          >
                            {slot}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-5 text-xs text-content-faint">
                    Struck-through slots are already taken. Evening viewings can be arranged on
                    request.
                  </p>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-7">
                  <div className="grid gap-7 sm:grid-cols-2">
                    <Field id="booking-name" label="Name" required error={errors.name}>
                      <Input
                        value={details.name}
                        onChange={(e) => setDetails({ ...details, name: e.target.value })}
                        autoComplete="name"
                        placeholder="Your full name"
                      />
                    </Field>
                    <Field id="booking-email" label="Email" required error={errors.email}>
                      <Input
                        type="email"
                        value={details.email}
                        onChange={(e) => setDetails({ ...details, email: e.target.value })}
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    </Field>
                  </div>
                  <Field id="booking-phone" label="Phone" required error={errors.phone}>
                    <Input
                      type="tel"
                      value={details.phone}
                      onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                      autoComplete="tel"
                      placeholder="+351 000 000 000"
                    />
                  </Field>
                  <Field
                    id="booking-message"
                    label="Anything we should know?"
                    hint="Optional — access needs, questions, who is coming with you."
                  >
                    <Textarea
                      rows={4}
                      value={details.message}
                      onChange={(e) => setDetails({ ...details, message: e.target.value })}
                    />
                  </Field>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="text-center">
                  <span className="mx-auto flex size-14 items-center justify-center border border-[var(--accent)] text-[var(--accent)]">
                    <Check className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-7 font-serif text-3xl tracking-[-0.03em] text-content">
                    Your viewing is requested.
                  </h3>
                  <p className="measure-tight mx-auto mt-4 text-sm leading-relaxed text-content-muted">
                    {agent ? `${agent.name} will` : "An advisor will"} confirm within one working
                    day. You will receive an email with the address and access details.
                  </p>
                  {reference ? (
                    <p className="mt-5 text-[11px] tracking-[0.16em] text-content-faint uppercase">
                      Reference {reference}
                    </p>
                  ) : null}

                  <dl className="mx-auto mt-9 max-w-sm divide-y divide-[color:var(--hairline)] border-y border-hairline text-left">
                    {summary.map((row) => (
                      <div key={row.label} className="flex justify-between gap-4 py-3">
                        <dt className="text-sm text-content-faint">{row.label}</dt>
                        <dd className="text-right text-sm text-content">{row.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-9 flex flex-wrap justify-center gap-3">
                    {property ? (
                      <Button asChild variant="outline">
                        <Link href={`/properties/${property.slug}`}>Back to the property</Link>
                      </Button>
                    ) : null}
                    <Button asChild>
                      <Link href="/properties">Browse more</Link>
                    </Button>
                  </div>

                  <p className="mt-8 text-xs text-content-faint">
                    This is a demonstration — no booking has been made and no data was sent.
                  </p>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {step < 4 ? (
            <div className="mt-9 flex items-center justify-between gap-4 border-t border-hairline pt-7">
              <Button
                variant="ghost"
                onClick={() => go(Math.max(0, step - 1))}
                disabled={step === 0}
                className="disabled:invisible"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back
              </Button>

              {step === 3 ? (
                <Button size="lg" onClick={submit} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Check className="size-4" aria-hidden />
                  )}
                  {submitting ? "Sending" : "Confirm booking"}
                </Button>
              ) : (
                <Button size="lg" onClick={next} disabled={!canAdvance}>
                  Continue
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {property && step < 4 ? (
          <div className="mt-6 flex items-center gap-4 border border-hairline p-4">
            <Plate
              asset={property.images[0]!}
              className="w-20 shrink-0"
              ratio="aspect-4/3"
              sizes="80px"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-content">{property.name}</p>
              <p className="mt-0.5 truncate text-xs text-content-muted">{property.address}</p>
            </div>
            {agent ? (
              <p className="hidden shrink-0 text-right text-xs text-content-faint sm:block">
                Your advisor
                <br />
                <span className="text-content">{agent.name}</span>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
