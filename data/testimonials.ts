import type { Testimonial } from "@/types";

/** Fourteen fictional client quotes, attributed to fictional people. */
export const testimonials: Testimonial[] = [
  {
    id: "t-01",
    quote:
      "We had been looking for two years and had stopped believing the right house existed. Elena found it in eleven days, and it had never been advertised anywhere.",
    name: "Marianne & Paul Vester",
    role: "Bought a townhouse",
    location: "Old Town",
    propertyReference: "VLR-1043",
    service: "buying",
    featured: true,
  },
  {
    id: "t-02",
    quote:
      "Tomás told me the apartment was overpriced and that I should wait. He was right, and it cost him a commission that quarter. That is the entire reason I have used him three times since.",
    name: "Ravi Chandran",
    role: "Bought and sold twice",
    location: "Waterfront",
    service: "buying",
    featured: true,
  },
  {
    id: "t-03",
    quote:
      "Our house sold in nineteen days at four percent above the guide. What actually mattered was that nobody wasted our time — there were six viewings, and every one of them was a real buyer.",
    name: "Ines Duarte",
    role: "Sold a family house",
    location: "The Hills",
    service: "selling",
    featured: true,
  },
  {
    id: "t-04",
    quote:
      "I have owned property in four countries and this is the first time the paperwork felt like someone else's problem rather than mine.",
    name: "Cristina Bauer",
    role: "Relocated from Zürich",
    location: "Central District",
    service: "relocation",
    featured: true,
  },
  {
    id: "t-05",
    quote:
      "Nadia talked me out of the building I wanted and into the one next door. Three years later the numbers are not close.",
    name: "Daniel Okoro",
    role: "Investor, four holdings",
    location: "Downtown",
    service: "investment",
    featured: true,
  },
  {
    id: "t-06",
    quote:
      "The house was empty for fourteen months while we were posted abroad. We came back to it exactly as we left it, including the garden, which I genuinely did not expect.",
    name: "Sarah Lindgren",
    role: "Managed portfolio client",
    location: "The Hills",
    service: "property-management",
    featured: true,
  },
  {
    id: "t-07",
    quote:
      "Sofia knew the building's history better than the seller did. When the heritage committee raised an objection she had already drafted the response.",
    name: "Miguel Antunes",
    role: "Bought a restoration project",
    location: "Old Town",
    propertyReference: "VLR-1049",
    service: "buying",
  },
  {
    id: "t-08",
    quote:
      "We let our apartment through Camille for four years and never once had to think about it. Not one late payment, not one awkward conversation.",
    name: "Hélène Marchal",
    role: "Landlord",
    location: "Central District",
    service: "renting",
  },
  {
    id: "t-09",
    quote:
      "Andrés arranged the survey, the berth transfer and the mooring licence before we had even agreed a price. He assumed we would get there.",
    name: "Jon & Kirsten Haugen",
    role: "Bought a coastal house",
    location: "Harbour Point",
    propertyReference: "VLR-1045",
    service: "buying",
  },
  {
    id: "t-10",
    quote:
      "Buying off-plan is an act of faith. Yuki turned it into a checklist, and then walked the site with me every six weeks until it was finished.",
    name: "Priya Raman",
    role: "Off-plan purchaser",
    location: "Waterfront",
    service: "buying",
  },
  {
    id: "t-11",
    quote:
      "Henrik walked the plot with us twice before he would even discuss the price. By the second walk we understood what we were actually buying.",
    name: "Alexander Roth",
    role: "Bought land and built",
    location: "The Hills",
    propertyReference: "VLR-1054",
    service: "buying",
  },
  {
    id: "t-12",
    quote:
      "I rented for a year while I decided whether to stay. Nobody tried to sell me anything for eleven months. Then they sold me a house.",
    name: "Fiona Whelan",
    role: "Rented, then bought",
    location: "Downtown",
    service: "renting",
  },
  {
    id: "t-13",
    quote:
      "The marketing photographs were the first time I had properly looked at my own house in twenty years. I nearly took it off the market.",
    name: "Teresa Moutinho",
    role: "Sold a period apartment",
    location: "Central District",
    service: "selling",
  },
  {
    id: "t-14",
    quote:
      "Three schools, two banks, one residency application and a dog that needed importing. James handled all of it, and the house was the easy part.",
    name: "The Okafor family",
    role: "Relocated from London",
    location: "The Hills",
    service: "relocation",
  },
];

export const testimonialById = (id: string) => testimonials.find((t) => t.id === id);
export const featuredTestimonials = testimonials.filter((t) => t.featured);
export const testimonialsByService = (service: string) =>
  testimonials.filter((t) => t.service === service);
