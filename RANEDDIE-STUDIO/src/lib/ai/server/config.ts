import 'server-only'
import type { AICapability } from '@/lib/types'

/**
 * Server-side AI configuration.
 *
 * This module is the ONLY place API keys are read, and `server-only` makes it a
 * build error to import it from a client component. The browser learns what is
 * configured through `/api/ai/status`, which returns booleans — never values.
 */

export type LanguageProviderId = 'mock' | 'anthropic' | 'openai'

export interface ServerAIConfig {
  language: {
    provider: LanguageProviderId
    model: string
    configured: boolean
  }
  /** Media-generation providers, keyed by the capability they unlock. */
  media: Record<AICapability, { configured: boolean; requirement: string }>
}

const req = (name: string) => (process.env[name] ?? '').trim()

export function getServerAIConfig(): ServerAIConfig {
  const requested = (process.env.AI_PROVIDER ?? 'mock').toLowerCase() as LanguageProviderId
  const anthropicKey = req('ANTHROPIC_API_KEY')
  const openaiKey = req('OPENAI_API_KEY')

  let provider: LanguageProviderId = 'mock'
  let model = ''
  if (requested === 'anthropic' && anthropicKey) {
    provider = 'anthropic'
    model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'
  } else if (requested === 'openai' && openaiKey) {
    provider = 'openai'
    model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }

  const replicate = Boolean(req('REPLICATE_API_TOKEN'))
  const elevenlabs = Boolean(req('ELEVENLABS_API_KEY'))
  const fal = Boolean(req('FAL_API_KEY'))

  const media: ServerAIConfig['media'] = {
    'edit-plan': { configured: provider !== 'mock', requirement: 'AI_PROVIDER + API key' },
    'command-parse': { configured: true, requirement: 'built in' },
    'analyze-media': { configured: true, requirement: 'built in' },
    caption: { configured: false, requirement: 'a speech-to-text provider' },
    'silence-detection': { configured: true, requirement: 'built in' },
    'smart-trim': { configured: true, requirement: 'built in' },
    'aspect-convert': { configured: true, requirement: 'built in' },
    'background-removal': { configured: replicate, requirement: 'REPLICATE_API_TOKEN' },
    'image-generation': { configured: replicate || fal, requirement: 'REPLICATE_API_TOKEN or FAL_API_KEY' },
    'video-generation': { configured: replicate || fal, requirement: 'REPLICATE_API_TOKEN or FAL_API_KEY' },
    'voice-generation': { configured: elevenlabs, requirement: 'ELEVENLABS_API_KEY' },
    'music-generation': { configured: replicate, requirement: 'REPLICATE_API_TOKEN' },
    'sound-effects': { configured: elevenlabs || replicate, requirement: 'ELEVENLABS_API_KEY or REPLICATE_API_TOKEN' },
  }

  return {
    language: { provider, model, configured: provider !== 'mock' },
    media,
  }
}
