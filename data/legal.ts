import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

const { legalName, contact, url } = siteConfig;
const inbox = contact.email;

export const legalUpdatedAt = "2026-08-01";

export const privacySections: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      `${legalName} ("we", "us") operates ${url} and acts as the data controller for the personal information described in this policy.`,
      `Questions about this policy, or any request to exercise your rights under it, should go to ${inbox}.`,
    ],
  },
  {
    heading: "What we collect",
    paragraphs: [
      "We collect only what we need to answer an enquiry, arrange a viewing or act on an instruction.",
    ],
    list: [
      "Contact details you give us — name, email address, telephone number.",
      "Enquiry content — what you are looking for, budget, timing and any notes you add.",
      "Viewing arrangements — the property, date and time you request.",
      "Technical data — IP address, browser type and pages viewed, collected in aggregate.",
      "Preferences stored in your own browser, such as saved properties and comparisons.",
    ],
  },
  {
    heading: "Why we process it",
    paragraphs: [
      "We process your information to respond to enquiries, arrange and confirm viewings, meet our obligations as a licensed agency, and — only where you have asked for it — to send you market notices and new instructions.",
      "Where we rely on legitimate interests, that interest is running a property agency and responding to people who contact us. You may object at any time.",
    ],
  },
  {
    heading: "Favourites, comparisons and local storage",
    paragraphs: [
      "Saved properties and comparison lists are stored in your browser's local storage. They stay on your device, are not transmitted to us, and are removed when you clear your browser data.",
    ],
  },
  {
    heading: "Sharing",
    paragraphs: [
      "We share personal information only where it is necessary: with the property owner or their representative when you request a viewing, with professional advisers acting on a transaction, and with service providers who host our systems under written instructions.",
      "We do not sell personal information, and we do not share it for third-party advertising.",
    ],
  },
  {
    heading: "Retention",
    paragraphs: [
      "Enquiry records are kept for two years from the last contact. Transaction records are kept for the period required by law, which is generally ten years. Marketing preferences are kept until you withdraw them.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You have the right to access the information we hold about you, to have it corrected or erased, to restrict or object to its processing, and to receive it in a portable format.",
      `To exercise any of these, write to ${inbox}. We will respond within one month. You also have the right to complain to your national data protection authority.`,
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "Access to personal information is limited to staff who need it. Data is transmitted over encrypted connections and held with providers who maintain recognised security certifications.",
    ],
  },
  {
    heading: "Changes",
    paragraphs: [
      "We update this policy when our practices change. The date at the top of this page is the date of the current version.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    heading: "These terms",
    paragraphs: [
      `By using ${url} you accept these terms. If you do not accept them, please do not use the site.`,
      "We may amend these terms; the version published here at the time you use the site is the one that applies.",
    ],
  },
  {
    heading: "Demonstration content",
    paragraphs: [
      "All properties, developments, advisors, articles and testimonials shown on this site are fictional and exist to demonstrate the design of the template. No content on this site constitutes an offer, a listing or an invitation to treat.",
    ],
  },
  {
    heading: "Property information",
    paragraphs: [
      "Where real listings are published, particulars are prepared in good faith and are believed correct, but they are a general guide only. Measurements are approximate, images may be indicative, and nothing in a listing forms part of any contract.",
      "Prospective purchasers and tenants must satisfy themselves as to the accuracy of any statement, by inspection or by taking their own professional advice.",
    ],
  },
  {
    heading: "No professional advice",
    paragraphs: [
      "Nothing on this site is legal, tax, financial or investment advice. The mortgage calculator produces indicative figures only and is not an offer of credit. You should take independent advice before making any decision.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: ["You agree not to:"],
    list: [
      "Use the site for any unlawful purpose or in breach of any regulation.",
      "Attempt to gain unauthorised access to the site or any system connected to it.",
      "Scrape, harvest or systematically extract content without our written consent.",
      "Introduce any malicious code, or interfere with the operation of the site.",
    ],
  },
  {
    heading: "Intellectual property",
    paragraphs: [
      `All content on this site, including text, layout, artwork and code, is owned by ${legalName} or its licensors and is protected by copyright. You may view and print pages for your own use; any other reproduction requires our written consent.`,
    ],
  },
  {
    heading: "Liability",
    paragraphs: [
      "We do not exclude liability for death or personal injury caused by negligence, or for fraud. Subject to that, we are not liable for any indirect or consequential loss arising from your use of this site, or from reliance on any content on it.",
    ],
  },
  {
    heading: "Third-party links",
    paragraphs: [
      "Where we link to other sites, we do so for convenience. We have no control over their content and accept no responsibility for it.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      `These terms are governed by the laws of ${contact.address.country}, and the courts of ${contact.address.country} have exclusive jurisdiction.`,
    ],
  },
];

export const cookieSections: LegalSection[] = [
  {
    heading: "What cookies are",
    paragraphs: [
      "Cookies are small text files a site stores on your device. Related technologies — local storage and session storage — work in a similar way. This page covers all of them.",
    ],
  },
  {
    heading: "What this site uses",
    paragraphs: [
      "This template ships without advertising or tracking cookies. What it stores is limited to the following:",
    ],
    list: [
      "Local storage — your saved properties and comparison list, held on your device only.",
      "Session cookies — set by the hosting platform to route requests and keep the site working.",
      "Analytics — none by default. If the site owner enables an analytics provider, this page should be updated to name it.",
    ],
  },
  {
    heading: "Consent",
    paragraphs: [
      "Because no cookies are used for advertising or cross-site tracking by default, no consent banner is shown. If you add analytics or marketing tools, you will need to add a consent mechanism and revise this page.",
    ],
  },
  {
    heading: "Managing storage",
    paragraphs: [
      "You can clear cookies and local storage at any time from your browser settings. Doing so will remove your saved properties and comparison list from this site.",
      "Blocking storage entirely will not break the site: favourites and comparisons simply will not persist between visits.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [`Questions about this page can go to ${inbox}.`],
  },
];
