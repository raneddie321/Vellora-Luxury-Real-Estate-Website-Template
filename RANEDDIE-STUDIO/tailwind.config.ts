import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/**
 * Editime design tokens.
 *
 * The visual language is intentionally its own: a near-black neutral shell with
 * a warm "Ember" action colour and a cool "Iris" colour reserved exclusively for
 * AI surfaces, so a user can always tell at a glance whether a control edits
 * their timeline directly or hands work to the AI.
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          muted: 'hsl(var(--primary) / 0.14)',
        },
        ai: {
          DEFAULT: 'hsl(var(--ai))',
          foreground: 'hsl(var(--ai-foreground))',
          muted: 'hsl(var(--ai) / 0.14)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        track: {
          video: 'hsl(var(--track-video))',
          audio: 'hsl(var(--track-audio))',
          text: 'hsl(var(--track-text))',
          caption: 'hsl(var(--track-caption))',
          overlay: 'hsl(var(--track-overlay))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 3px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        xs: ['0.75rem', { lineHeight: '1.0625rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
      },
      boxShadow: {
        panel: '0 1px 0 0 hsl(var(--border)), 0 8px 24px -12px rgb(0 0 0 / 0.8)',
        float: '0 24px 60px -20px rgb(0 0 0 / 0.85), 0 0 0 1px hsl(var(--border))',
        glow: '0 0 0 1px hsl(var(--primary) / 0.4), 0 0 32px -8px hsl(var(--primary) / 0.5)',
        'glow-ai': '0 0 0 1px hsl(var(--ai) / 0.4), 0 0 32px -8px hsl(var(--ai) / 0.5)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 hsl(var(--ai) / 0.5)' },
          '70%': { boxShadow: '0 0 0 8px hsl(var(--ai) / 0)' },
          '100%': { boxShadow: '0 0 0 0 hsl(var(--ai) / 0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.8s infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        'fade-up': 'fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [animate],
}

export default config
