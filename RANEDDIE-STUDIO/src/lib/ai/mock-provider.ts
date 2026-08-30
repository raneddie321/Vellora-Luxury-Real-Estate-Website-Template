import { createId } from '@/lib/id'
import type {
  AICapability,
  AIEditPlan,
  AIMessage,
  AnalyzeMediaRequest,
  CapabilityStatus,
  EditPlanRequest,
  GeneratedAssetResult,
  SceneAnalysis,
  TimelineSnapshotForAI,
} from '@/lib/types'
import { analyzeLocally, deriveCaptionTimings } from './local-engine'
import { buildPlan } from './planner'
import {
  CAPABILITY_CREDITS,
  CAPABILITY_LABELS,
  CAPABILITY_SECONDS,
  CapabilityUnavailableError,
  type AIProvider,
} from './provider'

/**
 * MockAIProvider — the provider the app runs on with no API keys at all.
 *
 * "Mock" does NOT mean fake results. Everything it reports as `ready` is real
 * work done locally (signal analysis, silence detection, deterministic
 * planning). Everything it cannot genuinely do throws
 * `CapabilityUnavailableError`, which the UI renders as "Requires API" — it will
 * not invent a matte, an image, or a transcript.
 */

const READY: AICapability[] = [
  'command-parse',
  'analyze-media',
  'silence-detection',
  'smart-trim',
  'aspect-convert',
]

const DEMO: { capability: AICapability; note: string }[] = [
  {
    capability: 'edit-plan',
    note: 'Plans come from the built-in deterministic planner. Connect a language model in Settings › AI for open-ended instructions.',
  },
  {
    capability: 'caption',
    note: 'Caption timings are detected from your real audio. The words need a speech-to-text provider — captions are created empty and ready to type into.',
  },
]

const REQUIRES_API: { capability: AICapability; note: string }[] = [
  { capability: 'background-removal', note: 'Set REPLICATE_API_TOKEN (or another matting provider) to enable.' },
  { capability: 'image-generation', note: 'Set REPLICATE_API_TOKEN or FAL_API_KEY to enable.' },
  { capability: 'video-generation', note: 'Set REPLICATE_API_TOKEN or FAL_API_KEY to enable.' },
  { capability: 'voice-generation', note: 'Set ELEVENLABS_API_KEY to enable.' },
  { capability: 'music-generation', note: 'Set REPLICATE_API_TOKEN to enable a music model.' },
  { capability: 'sound-effects', note: 'Set ELEVENLABS_API_KEY or REPLICATE_API_TOKEN to enable.' },
]

export class MockAIProvider implements AIProvider {
  readonly id = 'mock'
  readonly name = 'Built-in Studio Engine'
  readonly description =
    'Runs entirely on your machine. Real analysis and deterministic planning, no API key, no upload.'

  capabilities(): CapabilityStatus[] {
    const base = (capability: AICapability, availability: CapabilityStatus['availability'], note?: string) => ({
      capability,
      availability,
      note,
      credits: CAPABILITY_CREDITS[capability],
      estimatedSeconds: CAPABILITY_SECONDS[capability],
    })
    return [
      ...READY.map((c) => base(c, 'ready')),
      ...DEMO.map(({ capability, note }) => base(capability, 'demo', note)),
      ...REQUIRES_API.map(({ capability, note }) => base(capability, 'requires-api', note)),
    ]
  }

  async generateEditPlan(request: EditPlanRequest): Promise<AIEditPlan> {
    const capabilities = new Map(this.capabilities().map((c) => [c.capability, c]))
    const draft = buildPlan(request.prompt, { snapshot: request.snapshot, capabilities })
    return {
      id: createId('plan'),
      prompt: request.prompt,
      summary: draft.summary,
      createdAt: new Date().toISOString(),
      provider: this.id,
      operations: draft.operations,
      totalCredits: draft.operations.reduce((sum, op) => sum + op.credits, 0),
      status: 'draft',
      reasoning: draft.reasoning,
    }
  }

  async chat(messages: AIMessage[], context: TimelineSnapshotForAI): Promise<string> {
    const last = [...messages].reverse().find((m) => m.role === 'user')
    if (!last) return 'Tell me what you want this edit to feel like and I will draft a plan.'

    const capabilities = new Map(this.capabilities().map((c) => [c.capability, c]))
    const draft = buildPlan(last.content, { snapshot: context, capabilities })

    if (draft.operations.length === 0) {
      return [
        draft.reasoning,
        '',
        ...(draft.suggestions ?? []).map((s) => `• ${s}`),
      ].join('\n')
    }

    // The plan card below already states the summary and lists the steps, so the
    // reply adds context instead of repeating it.
    const blocked = draft.operations.filter((op) => op.availability === 'requires-api')
    const runnable = draft.operations.length - blocked.length
    const lines: string[] = [
      `Here is how I would approach that — ${runnable} step${runnable === 1 ? '' : 's'} you can apply now, in the order below.`,
    ]
    if (blocked.length > 0) {
      lines.push(
        `${blocked.length === 1 ? 'One step needs' : `${blocked.length} steps need`} an external provider (${blocked
          .map((op) => CAPABILITY_LABELS[op.capability])
          .join(', ')}), so ${blocked.length === 1 ? 'it is' : 'they are'} marked and will not run.`,
      )
    }
    lines.push('Apply the whole plan, or take the steps one at a time.')
    return lines.join(' ')
  }

  async analyzeMedia(request: AnalyzeMediaRequest): Promise<SceneAnalysis> {
    return analyzeLocally(request, this.id)
  }

  async generateCaption(request: { assetId: string; duration: number; waveform?: number[] }) {
    if (!request.waveform?.length) {
      throw new CapabilityUnavailableError(
        'caption',
        'This asset has no decoded audio, so there is nothing to detect speech in.',
      )
    }
    return deriveCaptionTimings(request.waveform, request.duration)
  }

  async removeBackground(): Promise<GeneratedAssetResult> {
    throw new CapabilityUnavailableError(
      'background-removal',
      'Background removal needs a matting model. No provider is configured.',
      'REPLICATE_API_TOKEN',
    )
  }

  async generateImage(): Promise<GeneratedAssetResult> {
    throw new CapabilityUnavailableError(
      'image-generation',
      'Image generation needs an external model. No provider is configured.',
      'REPLICATE_API_TOKEN or FAL_API_KEY',
    )
  }

  async generateVideo(): Promise<GeneratedAssetResult> {
    throw new CapabilityUnavailableError(
      'video-generation',
      'Video generation needs an external model. No provider is configured.',
      'REPLICATE_API_TOKEN or FAL_API_KEY',
    )
  }

  async generateVoice(): Promise<GeneratedAssetResult> {
    throw new CapabilityUnavailableError(
      'voice-generation',
      'Voice synthesis needs an external model. No provider is configured.',
      'ELEVENLABS_API_KEY',
    )
  }

  async generateSound(): Promise<GeneratedAssetResult> {
    throw new CapabilityUnavailableError(
      'sound-effects',
      'Sound effect generation needs an external model. No provider is configured.',
      'ELEVENLABS_API_KEY or REPLICATE_API_TOKEN',
    )
  }
}
