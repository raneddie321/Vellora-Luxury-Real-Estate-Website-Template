import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Editime'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: `${APP_NAME} — Create what you imagine`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'An AI-native creative studio for video, VFX, motion, audio and beyond. Describe the edit you want; review the plan; keep control of every frame.',
  applicationName: APP_NAME,
  keywords: ['video editor', 'AI video', 'creative studio', 'timeline editor', 'VFX'],
  authors: [{ name: 'Raneddie Studio' }],
  openGraph: {
    title: `${APP_NAME} by Raneddie Studio`,
    description: 'An AI-native creative studio for video, VFX, motion, audio and beyond.',
    type: 'website',
    images: ['/og.svg'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#08090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only-focusable absolute left-3 top-3 z-[100] rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
