import { NextResponse } from 'next/server'
import { getServerAIConfig } from '@/lib/ai/server/config'
import type { AICapability } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GENERATIVE: AICapability[] = [
  'background-removal',
  'image-generation',
  'video-generation',
  'voice-generation',
  'music-generation',
  'sound-effects',
]

/**
 * Media generation endpoint.
 *
 * The adapters for Replicate / fal / ElevenLabs are documented in
 * API_INTEGRATION.md but are NOT implemented here, because shipping an
 * unverifiable integration would be worse than shipping none: this route
 * answers honestly with 501 and names the exact env var that would enable the
 * capability. Implement `runGeneration` to turn it on.
 */
export async function POST(request: Request) {
  let body: { capability?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const capability = body.capability as AICapability | undefined
  if (!capability || !GENERATIVE.includes(capability)) {
    return NextResponse.json({ error: 'Unknown generation capability.' }, { status: 400 })
  }

  const config = getServerAIConfig()
  const entry = config.media[capability]

  if (!entry.configured) {
    return NextResponse.json(
      {
        error: `${capability} is not configured on this server.`,
        requirement: entry.requirement,
        capability,
      },
      { status: 501 },
    )
  }

  return NextResponse.json(
    {
      error: `A credential for ${capability} is present, but no generation adapter is wired up in this build.`,
      requirement: entry.requirement,
      capability,
      docs: 'See API_INTEGRATION.md § Media generation for the adapter contract.',
    },
    { status: 501 },
  )
}
