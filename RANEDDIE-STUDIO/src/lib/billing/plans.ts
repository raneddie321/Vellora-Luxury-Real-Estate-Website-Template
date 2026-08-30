/**
 * Billing placeholder.
 *
 * No payment processor is connected and no card details are collected anywhere
 * in this application. These plans exist to define the shape a real billing
 * provider (Stripe, Paddle, Lemon Squeezy) would populate, and every surface
 * that renders them is labelled as a demo.
 */

export interface Plan {
  id: 'free' | 'creator' | 'pro' | 'studio'
  name: string
  tagline: string
  /** Monthly price in USD. Demo values. */
  price: number
  annualPrice: number
  credits: number
  highlight?: boolean
  features: string[]
  limits: { projects: string; storage: string; export: string; seats: string }
  cta: string
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Everything local, nothing to configure.',
    price: 0,
    annualPrice: 0,
    credits: 500,
    cta: 'Start creating',
    features: [
      'Full timeline editor',
      'Local media library',
      'Built-in analysis and planning',
      'Browser export (WebM / MP4)',
      'All 16 effects and 8 text presets',
    ],
    limits: { projects: 'Unlimited local', storage: 'Your browser', export: '1080p', seats: '1' },
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'For people publishing every week.',
    price: 19,
    annualPrice: 15,
    credits: 3000,
    cta: 'Choose Creator',
    features: [
      'Everything in Free',
      'Language-model edit plans',
      'Speech-to-text captions',
      'AI voice and music',
      'Cloud project sync',
    ],
    limits: { projects: 'Unlimited', storage: '100 GB', export: '4K', seats: '1' },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'The full creative toolkit.',
    price: 49,
    annualPrice: 39,
    credits: 12000,
    highlight: true,
    cta: 'Choose Pro',
    features: [
      'Everything in Creator',
      'Background removal and matting',
      'Image and video generation',
      'GPU render queue',
      'Priority rendering',
      'Version history',
    ],
    limits: { projects: 'Unlimited', storage: '1 TB', export: '4K + ProRes', seats: '3' },
  },
  {
    id: 'studio',
    name: 'Studio',
    tagline: 'For teams shipping at volume.',
    price: 149,
    annualPrice: 119,
    credits: 50000,
    cta: 'Talk to us',
    features: [
      'Everything in Pro',
      'Real-time collaboration',
      'Shared asset libraries',
      'Brand kits and locked templates',
      'SSO and audit logs',
      'Dedicated render capacity',
    ],
    limits: { projects: 'Unlimited', storage: '10 TB', export: 'All formats', seats: 'Unlimited' },
  },
]

export const getPlan = (id: Plan['id']) => PLANS.find((p) => p.id === id) ?? PLANS[0]

/** True when a payment provider is wired up. Always false in this build. */
export const isBillingEnabled = () => false
