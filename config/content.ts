/**
 * ---------------------------------------------------------------------------
 * VELLORA — editorial content
 * ---------------------------------------------------------------------------
 * Every headline, standfirst and label that is not part of a data record lives
 * here. Rewriting the site's voice is a matter of editing this one file.
 * ---------------------------------------------------------------------------
 */
import { img } from "@/lib/images";

export const homeContent = {
  hero: {
    eyebrow: "Marivane · Est. 2009",
    headline: ["Exceptional properties.", "Distinctive living."],
    supporting:
      "Discover extraordinary homes, residences and developments selected for those who expect more.",
    primaryCta: { label: "Explore Properties", href: "/properties" },
    secondaryCta: { label: "Book a Viewing", href: "/book-a-viewing" },
    scrollLabel: "Scroll",
    image: img("cinema-08", "A modernist residence at dusk, lit from within"),
    mobileImage: img("tall-10", "A modernist residence at dusk"),
  },
  intro: {
    eyebrow: "The house of Vellora",
    headline: ["Real estate,", "considered differently."],
    paragraphs: [
      "We represent a deliberately small number of properties each year. Not because there is nothing else worth selling, but because the work we do — the research, the presentation, the negotiation — does not scale past a certain point without getting worse.",
      "That means we turn down instructions. It means our advisors carry ten files rather than forty. And it means that when we tell you a building is the right one, you can reasonably assume we have looked at everything else.",
    ],
    signature: "Elena Marchetti, Founding Partner",
    image: img("room-12", "A reception room in a restored Central District apartment"),
    detail: img("detail-04", "Board-marked concrete and oiled oak detailing"),
    stat: { value: "1 in 6", label: "Instructions we accept" },
  },
  featured: {
    eyebrow: "Featured residence",
    title: "The one everything else is measured against",
  },
  collection: {
    eyebrow: "The collection",
    headline: ["A short list,", "carefully kept."],
    supporting:
      "Twenty properties across six districts. Each one visited, photographed and written about by the advisor who represents it.",
    cta: { label: "View all properties", href: "/properties" },
  },
  search: {
    eyebrow: "Begin the search",
    headline: ["Tell us what", "you are looking for."],
    supporting:
      "Six filters and a shortlist. Or skip it entirely and call the advisor for the district you have in mind.",
  },
  developments: {
    eyebrow: "Developments",
    headline: ["Buildings that", "are still becoming."],
    supporting:
      "Seven schemes we represent from first release to final unit — including two that are already finished, and one that will not start until 2028.",
    cta: { label: "All developments", href: "/developments" },
  },
  neighborhoods: {
    eyebrow: "Neighbourhoods",
    headline: ["Six districts.", "Six answers."],
    supporting:
      "Where you live decides more about your day than what you live in. These are the six we know street by street.",
    cta: { label: "Explore neighbourhoods", href: "/neighborhoods" },
  },
  services: {
    eyebrow: "Services",
    headline: ["What we do,", "and how."],
    supporting:
      "Six service lines, each run by the people who do the work rather than a department that coordinates it.",
    cta: { label: "All services", href: "/services" },
  },
  agents: {
    eyebrow: "The advisors",
    headline: ["People, not", "a switchboard."],
    supporting:
      "Twelve advisors, each responsible for a district they actually live in. The person at your first viewing is the person at completion.",
    cta: { label: "Meet our agents", href: "/agents" },
  },
  journal: {
    eyebrow: "The journal",
    headline: ["Notes from", "the market."],
    supporting:
      "Essays on architecture, market analysis with the workings shown, and practical guidance we would give a friend.",
    cta: { label: "Read the journal", href: "/journal" },
  },
  testimonials: {
    eyebrow: "Clients",
    headline: ["In their words."],
  },
  stats: {
    eyebrow: "By the numbers",
    headline: ["Sixteen years,", "measured."],
    items: [
      { value: 2.4, suffix: "B+", prefix: "€", label: "Property value represented", decimals: 1 },
      { value: 1200, suffix: "+", prefix: "", label: "Properties sold", decimals: 0 },
      { value: 18, suffix: "", prefix: "", label: "Markets", decimals: 0 },
      { value: 97, suffix: "%", prefix: "", label: "Client satisfaction", decimals: 0 },
    ],
  },
  finalCta: {
    eyebrow: "Begin",
    headline: ["Find a place worth", "coming home to."],
    supporting:
      "Start with the collection, or tell an advisor what you are looking for and let them do the searching.",
    primaryCta: { label: "Explore Properties", href: "/properties" },
    secondaryCta: { label: "Speak to an advisor", href: "/contact" },
    image: img("cinema-11", "A clifftop residence above the water at dusk"),
    mobileImage: img("tall-05", "A clifftop residence above the water"),
  },
} as const;

export const aboutContent = {
  hero: {
    eyebrow: "About",
    headline: ["A brokerage built", "the slow way."],
    supporting:
      "Vellora was founded in 2009 on the idea that a smaller book, handled properly, beats a larger one handled quickly.",
    image: img("cinema-09", "The Vellora office on Rua da Alfândega"),
  },
  story: {
    eyebrow: "The story",
    title: "It began with a building nobody wanted",
    paragraphs: [
      "In 2008 Elena Marchetti was running a small restoration practice repairing nineteenth-century facades in the Old Town. One of her clients asked her to sell the house she had just spent two years repairing, on the grounds that nobody else would be able to explain it.",
      "She sold it in nine days, to a buyer who had walked past it twice and dismissed it both times. The difference was not marketing. It was that somebody in the room understood what had been done to the building and why it mattered.",
      "Vellora opened the following spring with two advisors and eleven instructions. Sixteen years later there are thirty-one people and around three hundred and forty transactions a year — a number that has deliberately not grown since 2021.",
    ],
    image: img("town-03", "A restored facade in the Old Town"),
  },
  philosophy: {
    eyebrow: "Philosophy",
    title: "Four things we hold to",
    values: [
      {
        title: "Fewer instructions, better work",
        description:
          "We accept roughly one instruction in six. Each advisor carries around ten live files, which is the number at which it is still possible to know all of them properly.",
      },
      {
        title: "Say the difficult thing early",
        description:
          "If a property is overpriced, we say so before the campaign rather than after it. If we act for the seller, you hear it at the first viewing.",
      },
      {
        title: "The building comes first",
        description:
          "Most of our advisors came from architecture, restoration, planning or finance rather than sales. It shows in what they notice.",
      },
      {
        title: "One person, all the way through",
        description:
          "No handover to a completions team. The advisor who takes the brief is the advisor at the notary.",
      },
    ],
  },
  timeline: {
    eyebrow: "Sixteen years",
    title: "A short chronology",
    entries: [
      { year: "2009", title: "Vellora opens", description: "Two advisors, eleven instructions, one room above a chandlery on the old quay." },
      { year: "2012", title: "The Old Town desk", description: "Sofia Almeida joins and the heritage practice begins in earnest." },
      { year: "2015", title: "Waterfront mandate", description: "Appointed to the second masterplan building; the district becomes a specialism." },
      { year: "2018", title: "Investment desk", description: "Nadia Okonkwo joins from a European residential credit fund." },
      { year: "2020", title: "Property management", description: "Formed after a client asked who was watching their house. Nobody was." },
      { year: "2022", title: "Relocation", description: "The international desk opens with nine partner schools." },
      { year: "2024", title: "€2 billion represented", description: "Cumulative transaction value passes two billion euros." },
      { year: "2026", title: "Thirty-one people", description: "Six districts, three hundred and forty transactions a year, and no plans to grow." },
    ],
  },
  achievements: {
    eyebrow: "Recognition",
    title: "Selected recognition",
    items: [
      { year: "2025", title: "Brokerage of the Year", body: "Iberian Property Awards" },
      { year: "2025", title: "Restoration Sale of the Year", body: "Palacete Santa Clara" },
      { year: "2024", title: "Best Development Marketing", body: "The Salt Works, Waterfront" },
      { year: "2023", title: "Heritage Advocacy Award", body: "Marivane Civic Trust" },
      { year: "2022", title: "Employer of the Year", body: "Regional Chamber of Commerce" },
      { year: "2021", title: "Market Report of the Year", body: "Property Journalism Guild" },
    ],
  },
} as const;

export const contactContent = {
  eyebrow: "Contact",
  headline: ["Start a", "conversation."],
  supporting:
    "Tell us what you are looking for, or what you are thinking of selling. Someone who knows the district will reply, usually the same day.",
  formTitle: "Send an enquiry",
  reasons: [
    "Buying a property",
    "Selling a property",
    "Letting or renting",
    "Investment advice",
    "Property management",
    "Relocation",
    "Press or media",
    "Something else",
  ],
} as const;

export const bookingContent = {
  eyebrow: "Private viewing",
  headline: ["Book a viewing."],
  supporting:
    "Five steps, about two minutes. We confirm within one working day, and usually a great deal sooner.",
  steps: [
    { title: "Property", description: "Which property would you like to see?" },
    { title: "Date", description: "Choose a day that suits you." },
    { title: "Time", description: "Pick a slot. Evening viewings are available on request." },
    { title: "Details", description: "How should we reach you?" },
    { title: "Confirm", description: "Check everything and send." },
  ],
} as const;

export const newsletterContent = {
  eyebrow: "The list",
  title: "Off-market first",
  description:
    "Registered buyers see roughly a third of our instructions before anything is published. One email a fortnight, no marketing.",
  placeholder: "you@example.com",
  cta: "Join the list",
  smallprint: "You can leave at any time. We do not share the list.",
} as const;
