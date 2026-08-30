import { DEFAULT_TEXT_STYLE } from '@/lib/timeline/factories'
import type { TextAnimation, TextStyle } from '@/lib/types'

export interface TextPreset {
  id: string
  name: string
  description: string
  animation: TextAnimation
  style: Partial<TextStyle>
  /** Preview label rendered in the panel tile. */
  sample: string
}

export const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'heading',
    name: 'Heading',
    description: 'Large centred title for openings and section breaks.',
    animation: 'fade',
    sample: 'Heading',
    style: { fontSize: 96, fontWeight: 800, letterSpacing: -0.02, y: 0, shadow: 0.4 },
  },
  {
    id: 'subheading',
    name: 'Subheading',
    description: 'Secondary line, sits under a heading.',
    animation: 'slide-up',
    sample: 'Subheading',
    style: { fontSize: 44, fontWeight: 500, letterSpacing: 0.01, y: 0.14, shadow: 0.3 },
  },
  {
    id: 'lower-third',
    name: 'Lower Third',
    description: 'Left-aligned name plate with a solid backing bar.',
    animation: 'slide-up',
    sample: 'Name · Role',
    style: {
      fontSize: 38,
      fontWeight: 600,
      align: 'left',
      x: -0.28,
      y: 0.62,
      backgroundColor: '#000000',
      backgroundOpacity: 0.6,
      paddingX: 28,
      paddingY: 16,
      maxWidth: 0.5,
    },
  },
  {
    id: 'caption',
    name: 'Caption',
    description: 'Small supporting line near the bottom of frame.',
    animation: 'fade',
    sample: 'Caption text',
    style: { fontSize: 32, fontWeight: 500, y: 0.72, maxWidth: 0.66 },
  },
  {
    id: 'kicker',
    name: 'Kicker',
    description: 'Tracked-out uppercase label for chapters.',
    animation: 'blur-in',
    sample: 'CHAPTER ONE',
    style: { fontSize: 26, fontWeight: 700, uppercase: true, letterSpacing: 0.32, y: -0.28 },
  },
  {
    id: 'statement',
    name: 'Statement',
    description: 'Oversized editorial text that fills the frame.',
    animation: 'pop',
    sample: 'Big idea.',
    style: { fontSize: 132, fontWeight: 900, letterSpacing: -0.04, lineHeight: 0.95, maxWidth: 0.9 },
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Centred pull-quote with generous line height.',
    animation: 'fade',
    sample: '“A quote.”',
    style: { fontSize: 56, fontWeight: 400, lineHeight: 1.35, maxWidth: 0.7 },
  },
  {
    id: 'ticker',
    name: 'Ticker',
    description: 'Monospaced typewriter line for data and callouts.',
    animation: 'typewriter',
    sample: 'STATUS: LIVE',
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 30,
      fontWeight: 500,
      uppercase: true,
      letterSpacing: 0.12,
      y: 0.78,
      backgroundColor: '#000000',
      backgroundOpacity: 0.55,
    },
  },
]

export interface CaptionPreset {
  id: string
  name: string
  description: string
  style: Partial<TextStyle>
}

export const CAPTION_PRESETS: CaptionPreset[] = [
  {
    id: 'clean',
    name: 'Clean',
    description: 'White text, soft shadow, no box. Reads on most footage.',
    style: { fontSize: 40, fontWeight: 600, color: '#FFFFFF', shadow: 0.6, backgroundOpacity: 0, y: 0.66 },
  },
  {
    id: 'boxed',
    name: 'Boxed',
    description: 'Solid dark plate — the safest option over busy video.',
    style: {
      fontSize: 38,
      fontWeight: 600,
      color: '#FFFFFF',
      backgroundColor: '#000000',
      backgroundOpacity: 0.72,
      paddingX: 20,
      paddingY: 12,
      shadow: 0,
      y: 0.68,
    },
  },
  {
    id: 'bold-pop',
    name: 'Bold Pop',
    description: 'Heavy uppercase with a stroke. Built for social feeds.',
    style: {
      fontSize: 52,
      fontWeight: 900,
      uppercase: true,
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 8,
      letterSpacing: -0.01,
      y: 0.58,
      maxWidth: 0.82,
    },
  },
  {
    id: 'highlight',
    name: 'Highlight',
    description: 'Ember highlight bar behind the words.',
    style: {
      fontSize: 44,
      fontWeight: 800,
      color: '#0B0B0D',
      backgroundColor: '#FF6B35',
      backgroundOpacity: 1,
      paddingX: 16,
      paddingY: 8,
      uppercase: true,
      y: 0.62,
    },
  },
  {
    id: 'broadcast',
    name: 'Broadcast',
    description: 'Neutral, conservative styling for corporate output.',
    style: {
      fontSize: 34,
      fontWeight: 500,
      color: '#F2F3F5',
      backgroundColor: '#101215',
      backgroundOpacity: 0.85,
      paddingX: 18,
      paddingY: 10,
      y: 0.74,
      maxWidth: 0.75,
    },
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'Small monospace subtitle, documentary feel.',
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 28,
      fontWeight: 500,
      color: '#E8EAED',
      letterSpacing: 0.02,
      shadow: 0.5,
      y: 0.76,
    },
  },
]

export const resolveTextStyle = (partial: Partial<TextStyle> | undefined): TextStyle => ({
  ...DEFAULT_TEXT_STYLE,
  ...partial,
})

export const getTextPreset = (id: string) => TEXT_PRESETS.find((p) => p.id === id)
export const getCaptionPreset = (id: string) => CAPTION_PRESETS.find((p) => p.id === id)

export const FONT_OPTIONS = [
  { value: 'var(--font-sans)', label: 'Studio Sans' },
  { value: 'var(--font-mono)', label: 'Studio Mono' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Editorial Serif' },
  { value: '"Trebuchet MS", "Segoe UI", sans-serif', label: 'Humanist' },
  { value: 'Impact, "Haettenschweiler", sans-serif', label: 'Poster' },
]
