import type {
  AICapability,
  AIEditPlan,
  AIMessage,
  AnalyzeMediaRequest,
  CapabilityStatus,
  CaptionSegment,
  EditPlanRequest,
  GeneratedAssetResult,
  SceneAnalysis,
} from '@/lib/types'

/**
 * The AI provider contract.
 *
 * Nothing in the application imports a vendor SDK. Every AI-shaped feature goes
 * through this interface, so adding Anthropic, OpenAI, Replicate or a
 * self-hosted model is one new class plus one line in `registry.ts`.
 *
 * Two rules make the product trustworthy:
 *  1. A provider that cannot do something throws `CapabilityUnavailableError`.
 *     It never returns a plausible-looking fake result.
 *  2. `capabilities()` is the UI's source of truth for Ready / Demo Mode /
 *     Requires API badges, so the interface can never drift from the labels.
 */
export interface AIProvider {
  readonly id: string
  readonly name: string
  readonly description: string

  capabilities(): CapabilityStatus[]

  /** Natural language → a reviewable edit plan. Never applied automatically. */
  generateEditPlan(request: EditPlanRequest): Promise<AIEditPlan>

  /** Conversational reply for the assistant panel. */
  chat(messages: AIMessage[], context: EditPlanRequest['snapshot']): Promise<string>

  analyzeMedia(request: AnalyzeMediaRequest): Promise<SceneAnalysis>

  generateCaption(request: {
    assetId: string
    duration: number
    waveform?: number[]
  }): Promise<{ segments: CaptionSegment[]; transcribed: boolean }>

  removeBackground(request: { assetId: string; assetName: string }): Promise<GeneratedAssetResult>
  generateImage(request: { prompt: string; aspectRatio: string }): Promise<GeneratedAssetResult>
  generateVideo(request: { prompt: string; durationSeconds: number; aspectRatio: string }): Promise<GeneratedAssetResult>
  generateVoice(request: { text: string; voice: string }): Promise<GeneratedAssetResult>
  generateSound(request: { prompt: string; durationSeconds: number }): Promise<GeneratedAssetResult>
}

export class CapabilityUnavailableError extends Error {
  constructor(
    readonly capability: AICapability,
    message: string,
    /** The env var or setup step that would enable it. */
    readonly requirement?: string,
  ) {
    super(message)
    this.name = 'CapabilityUnavailableError'
  }
}

export class AIRequestError extends Error {
  constructor(
    message: string,
    readonly retryable = true,
    readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'AIRequestError'
  }
}

/** Cost table shown before any spend. Demo values — see CHANGELOG. */
export const CAPABILITY_CREDITS: Record<AICapability, number> = {
  'edit-plan': 1,
  'command-parse': 1,
  'analyze-media': 5,
  caption: 2,
  'silence-detection': 2,
  'smart-trim': 3,
  'aspect-convert': 1,
  'background-removal': 10,
  'image-generation': 15,
  'video-generation': 30,
  'voice-generation': 8,
  'music-generation': 12,
  'sound-effects': 6,
}

export const CAPABILITY_LABELS: Record<AICapability, string> = {
  'edit-plan': 'Edit plan',
  'command-parse': 'Command parsing',
  'analyze-media': 'Scene analysis',
  caption: 'Caption generation',
  'silence-detection': 'Silence detection',
  'smart-trim': 'Smart trimming',
  'aspect-convert': 'Aspect ratio conversion',
  'background-removal': 'Background removal',
  'image-generation': 'Image generation',
  'video-generation': 'Video generation',
  'voice-generation': 'AI voice',
  'music-generation': 'AI music',
  'sound-effects': 'Sound effects',
}

/** Rough wall-clock estimates surfaced in the plan UI. */
export const CAPABILITY_SECONDS: Record<AICapability, number> = {
  'edit-plan': 2,
  'command-parse': 1,
  'analyze-media': 8,
  caption: 6,
  'silence-detection': 4,
  'smart-trim': 5,
  'aspect-convert': 2,
  'background-removal': 45,
  'image-generation': 20,
  'video-generation': 120,
  'voice-generation': 15,
  'music-generation': 30,
  'sound-effects': 12,
}
