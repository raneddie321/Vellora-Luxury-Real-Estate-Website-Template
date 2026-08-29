import type { Faq } from "@/types";

/** Twenty-eight questions across seven categories, used on /faq and each service page. */
export const faqs: Faq[] = [
  /* ------------------------------- Buying -------------------------------- */
  {
    id: "f-b1",
    category: "Buying",
    question: "How much of your stock is never publicly listed?",
    answer:
      "Roughly a third. Some sellers do not want a public campaign; some properties sell before one is needed. Registered buyers see off-market instructions by email before anything is published, which in practice means a two to six week head start.",
  },
  {
    id: "f-b2",
    category: "Buying",
    question: "What does the purchase process actually look like?",
    answer:
      "Offer, acceptance, then a promissory contract with a deposit of 10–20%. Between promissory and completion you will have surveys, searches and mortgage formalities. Eight to twelve weeks is typical for a straightforward purchase; a listed building or a probate sale can take longer.",
  },
  {
    id: "f-b3",
    category: "Buying",
    question: "What should I budget beyond the purchase price?",
    answer:
      "Allow 6–8% of the price for transfer tax, stamp duty, notary and registration. Legal fees are usually 1–1.5%. If you are buying with a mortgage, add valuation and arrangement fees. We will give you a written estimate for your specific purchase before you commit to anything.",
  },
  {
    id: "f-b4",
    category: "Buying",
    question: "Can I buy if I am not resident in the country?",
    answer:
      "Yes. There is no restriction on non-resident ownership. You will need a local tax number, which takes about a week to obtain and which we can arrange, and a local bank account for the completion transfer.",
  },
  {
    id: "f-b5",
    category: "Buying",
    question: "Do you represent buyers as well as sellers?",
    answer:
      "We do, and we will tell you which we are doing on any given property. Where we act for the seller we say so at the first viewing. Search mandates, where we act only for you, are a separate service with its own fee structure.",
  },
  /* ------------------------------- Selling ------------------------------- */
  {
    id: "f-s1",
    category: "Selling",
    question: "How do you arrive at a guide price?",
    answer:
      "From completed sales in the same district over the previous eighteen months, adjusted for floor area, floor level, aspect, condition and any planning consents. We show you the comparables. If our view differs from another agent's, the difference will be in the comparables rather than in the optimism.",
  },
  {
    id: "f-s2",
    category: "Selling",
    question: "What is included in a marketing campaign?",
    answer:
      "Professional photography and floor plans, a written description, a video walkthrough where the property suits one, listing on our site and the two portals that matter here, a direct campaign to our registered buyers, and accompanied viewings. There is no separate charge for any of it.",
  },
  {
    id: "f-s3",
    category: "Selling",
    question: "What commission do you charge?",
    answer:
      "Between 3% and 5% plus VAT, depending on the property, the tenure and whether the instruction is sole or joint. It is agreed in writing before we start and it does not change afterwards.",
  },
  {
    id: "f-s4",
    category: "Selling",
    question: "Can I sell discreetly, without a public listing?",
    answer:
      "Yes. A discreet instruction is circulated only to matched registered buyers and to a small number of trusted co-agents. You lose some competitive tension and gain complete control over who knows. Around a fifth of our sales are handled this way.",
  },
  {
    id: "f-s5",
    category: "Selling",
    question: "Should I refurbish before selling?",
    answer:
      "Usually not structurally, often cosmetically. Repainting, repairing and properly styling a property reliably returns more than it costs. A new kitchen rarely does. We will walk the property and tell you specifically what is worth doing.",
  },
  /* ------------------------------- Renting ------------------------------- */
  {
    id: "f-r1",
    category: "Renting",
    question: "What are typical tenancy terms?",
    answer:
      "Twelve months is standard, with twenty-four and thirty-six month terms common for corporate tenants. Deposits are usually two months. Notice provisions are set out in the agreement and are negotiable before signature, not after.",
  },
  {
    id: "f-r2",
    category: "Renting",
    question: "What will I need to provide as a tenant?",
    answer:
      "Identification, proof of income or an employer letter, and references from a previous landlord where you have one. For corporate lets, a company guarantee usually replaces personal referencing.",
  },
  {
    id: "f-r3",
    category: "Renting",
    question: "Are properties let furnished?",
    answer:
      "Both. Around half our lettings book is furnished, and most furnished properties can be let unfurnished by arrangement — and occasionally the reverse. The listing states which, and the inventory is agreed and photographed at check-in.",
  },
  {
    id: "f-r4",
    category: "Renting",
    question: "Who handles repairs during a tenancy?",
    answer:
      "Where we manage the property, we do — through our own vetted contractor list, with a 24-hour line for anything urgent. Where the landlord manages directly, we introduce you at the start of the tenancy and step back.",
  },
  /* ------------------------------- Viewing ------------------------------- */
  {
    id: "f-v1",
    category: "Viewing",
    question: "How do I arrange a viewing?",
    answer:
      "Book online through the property page, or call the advisor named on the listing. We will confirm within one working day, usually much sooner. Same-day viewings are often possible for properties that are vacant.",
  },
  {
    id: "f-v2",
    category: "Viewing",
    question: "Can I view remotely?",
    answer:
      "Yes. We run live video viewings on request, with the advisor walking the property and answering questions in real time. For overseas buyers this is often the first two viewings; the third is usually in person.",
  },
  {
    id: "f-v3",
    category: "Viewing",
    question: "Will the owner be there?",
    answer:
      "Rarely, and only if you would like them to be. Most viewings are accompanied by the advisor alone, which lets you look properly and say what you actually think.",
  },
  {
    id: "f-v4",
    category: "Viewing",
    question: "How long does a viewing take?",
    answer:
      "Allow forty-five minutes for an apartment and an hour and a half for a house with grounds. Second viewings are usually longer, and we encourage bringing an architect or a builder if a project is involved.",
  },
  /* ------------------------------ Financing ------------------------------ */
  {
    id: "f-fi1",
    category: "Financing",
    question: "How much can I typically borrow?",
    answer:
      "Residents commonly borrow up to 80% of the lower of price or valuation; non-residents typically up to 65–70%. Lenders will want total borrowing costs to stay within about 35% of net income. Our mortgage calculator gives you an indicative monthly figure.",
  },
  {
    id: "f-fi2",
    category: "Financing",
    question: "Should I fix my rate?",
    answer:
      "It depends on how long you intend to hold and how much certainty is worth to you. Fixed terms of two, five and ten years are all available here, usually at a premium to the variable rate. We can introduce you to independent brokers; we do not receive commission from lenders.",
  },
  {
    id: "f-fi3",
    category: "Financing",
    question: "How long does a mortgage take to arrange?",
    answer:
      "Four to eight weeks from application to formal offer, assuming your documentation is complete. Non-resident applications are at the longer end. Getting a decision in principle before you offer is the single most useful thing you can do.",
  },
  {
    id: "f-fi4",
    category: "Financing",
    question: "Are there tax implications I should know about?",
    answer:
      "Transfer tax and stamp duty on purchase; an annual municipal property tax; and capital gains on disposal, with reliefs that depend on residency and reinvestment. This is genuinely specialist territory — we will introduce you to a tax adviser rather than guess.",
  },
  /* ------------------------------ Investment ----------------------------- */
  {
    id: "f-i1",
    category: "Investment",
    question: "What yields are realistic?",
    answer:
      "Gross yields of 4–5% in Downtown, 3–3.5% in the Central District and Waterfront, and lower in the Old Town and The Hills where capital growth has historically done the work instead. Net yields run roughly 1.2 to 1.5 points below gross once costs are taken.",
  },
  {
    id: "f-i2",
    category: "Investment",
    question: "Is short-let a better return than long-let?",
    answer:
      "Sometimes, but the gap is narrower than the headline numbers suggest once voids, management, furnishing, cleaning and licensing are counted. Several districts also restrict new short-let registrations. We will model both for a specific property before you decide.",
  },
  {
    id: "f-i3",
    category: "Investment",
    question: "Can you manage a portfolio for me?",
    answer:
      "Yes. Our investment desk handles acquisition, letting and management for eleven private clients, with quarterly reporting on income, costs, void days and valuation movement.",
  },
  {
    id: "f-i4",
    category: "Investment",
    question: "What is the minimum sensible entry point?",
    answer:
      "Around €500,000 for a single unit that will let reliably. Below that you are usually buying either a compromise on location or a compromise on condition, and both cost more than they save.",
  },
  /* -------------------------- Property Management ------------------------ */
  {
    id: "f-p1",
    category: "Property Management",
    question: "What does management actually cover?",
    answer:
      "Rent collection and arrears handling, statutory compliance, contractor management, quarterly inspections, annual condition reporting, and a single point of contact for the tenant. For vacant properties it covers security, utilities, gardens, pool plant and mail.",
  },
  {
    id: "f-p2",
    category: "Property Management",
    question: "What does it cost?",
    answer:
      "Typically 6–8% of collected rent for let properties, or a fixed monthly fee for vacant care based on the size of the property and the frequency of visits. Contractor work is charged at cost, with quotes above €500 sent to you first.",
  },
  {
    id: "f-p3",
    category: "Property Management",
    question: "Who do you use for maintenance?",
    answer:
      "A vetted list of around ninety contractors, all of whom have worked for the firm before. We do not take a margin on their work and we do not have exclusive arrangements with any of them.",
  },
  {
    id: "f-p4",
    category: "Property Management",
    question: "Can you look after a house I only use in summer?",
    answer:
      "That is a large part of what the department does. Vacant care includes weekly or fortnightly visits, opening and closing the house for your arrival and departure, and arranging everything from the pool being warm to the fridge being full.",
  },
];

export const faqsByCategory = (category: string) => faqs.filter((f) => f.category === category);
export const faqById = (id: string) => faqs.find((f) => f.id === id);
export const faqsByIds = (ids: string[]) =>
  ids.map((id) => faqById(id)).filter((f): f is Faq => Boolean(f));
