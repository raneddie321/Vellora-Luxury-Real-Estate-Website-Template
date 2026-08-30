import { NextResponse } from 'next/server'
import { getServerAIConfig } from '@/lib/ai/server/config'
import { CAPABILITY_CREDITS, CAPABILITY_SECONDS } from '@/lib/ai/provider'
import type { AICapability, CapabilityStatus } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Tells the browser what the server can actually do.
 * Returns booleans and requirement strings only — never key values.
 */
export async function GET() {
  const config = getServerAIConfig()

  const capabilities: CapabilityStatus[] = (
    Object.keys(config.media) as AICapability[]
  ).map((capability) => {
    const entry = config.media[capability]
    const local = capability === 'command-parse' || capability === 'analyze-media' ||
      capability === 'silence-detection' || capability === 'smart-trim' || capability === 'aspect-convert'

    let availability: CapabilityStatus['availability']
    let note: string | undefined

    if (local) {
      availability = 'ready'
    } else if (capability === 'edit-plan') {
      availability = config.language.configured ? 'ready' : 'demo'
      note = config.language.configured
        ? `Planning with ${config.language.provider} · ${config.language.model}.`
        : 'Plans come from the built-in deterministic planner. Set AI_PROVIDER and an API key for open-ended instructions.'
    } else if (capability === 'caption') {
      availability = 'demo'
      note =
        'Caption timings are detected from your real audio. The words need a speech-to-text provider, so captions are created empty and ready to type into.'
    } else {
      availability = entry.configured ? 'ready' : 'requires-api'
      note = entry.configured ? undefined : `Set ${entry.requirement} to enable.`
    }

    return {
      capability,
      availability,
      note,
      credits: CAPABILITY_CREDITS[capability],
      estimatedSeconds: CAPABILITY_SECONDS[capability],
    }
  })

  return NextResponse.json({
    provider: config.language.provider,
    model: config.language.configured ? config.language.model : null,
    configured: config.language.configured,
    capabilities,
  })
}
