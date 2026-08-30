import type {
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
import { MockAIProvider } from './mock-provider'
import { AIRequestError, CapabilityUnavailableError, type AIProvider } from './provider'

/**
 * RemoteAIProvider — used when the server reports a configured language model.
 *
 * Planning and conversation go through `/api/ai/*` so keys stay server-side.
 * Local analysis stays local: there is no reason to upload a waveform to answer
 * a question the browser already knows. If a remote call fails, the provider
 * degrades to the deterministic planner and marks the plan's provider as
 * `local-fallback`, so the UI can say what actually happened.
 */
export class RemoteAIProvider implements AIProvider {
  readonly id: string
  readonly name: string
  readonly description: string

  private readonly local = new MockAIProvider()

  constructor(
    providerId: string,
    model: string | null,
    private readonly status: CapabilityStatus[],
  ) {
    this.id = providerId
    this.name = model ? `${titleize(providerId)} · ${model}` : titleize(providerId)
    this.description = 'Planning and conversation run on your server; media analysis stays in your browser.'
  }

  capabilities(): CapabilityStatus[] {
    return this.status
  }

  private statusFor(capability: CapabilityStatus['capability']) {
    return this.status.find((c) => c.capability === capability)
  }

  async generateEditPlan(request: EditPlanRequest): Promise<AIEditPlan> {
    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...request, capabilities: this.status }),
      })
      if (response.ok) {
        const data = (await response.json()) as { plan: AIEditPlan }
        return data.plan
      }
      const error = (await response.json().catch(() => ({}))) as { error?: string; fallback?: string }
      if (error.fallback === 'local') {
        const plan = await this.local.generateEditPlan(request)
        return {
          ...plan,
          provider: 'local-fallback',
          reasoning: `${error.error ?? 'The model was unavailable.'} Fell back to the built-in planner. ${plan.reasoning ?? ''}`.trim(),
        }
      }
      throw new AIRequestError(error.error ?? 'The planning request failed.')
    } catch (error) {
      if (error instanceof AIRequestError) throw error
      const plan = await this.local.generateEditPlan(request)
      return {
        ...plan,
        provider: 'local-fallback',
        reasoning: `Could not reach the planning service, so the built-in planner produced this. ${plan.reasoning ?? ''}`.trim(),
      }
    }
  }

  async chat(messages: AIMessage[], context: TimelineSnapshotForAI): Promise<string> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages, snapshot: context }),
      })
      if (response.ok) {
        const data = (await response.json()) as { reply: string }
        return data.reply
      }
      return this.local.chat(messages, context)
    } catch {
      return this.local.chat(messages, context)
    }
  }

  async analyzeMedia(request: AnalyzeMediaRequest): Promise<SceneAnalysis> {
    return analyzeLocally(request, this.id)
  }

  async generateCaption(request: { assetId: string; duration: number; waveform?: number[] }) {
    if (!request.waveform?.length) {
      throw new CapabilityUnavailableError('caption', 'This asset has no decoded audio to analyse.')
    }
    return deriveCaptionTimings(request.waveform, request.duration)
  }

  private async generate(
    capability: CapabilityStatus['capability'],
    payload: Record<string, unknown>,
  ): Promise<GeneratedAssetResult> {
    const status = this.statusFor(capability)
    if (status?.availability !== 'ready') {
      throw new CapabilityUnavailableError(
        capability,
        status?.note ?? `${capability} is not configured on this server.`,
      )
    }
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ capability, ...payload }),
    })
    const data = (await response.json().catch(() => ({}))) as {
      error?: string
      requirement?: string
      url?: string
      mimeType?: string
      durationSeconds?: number
      width?: number
      height?: number
    }
    if (!response.ok || !data.url) {
      throw new CapabilityUnavailableError(
        capability,
        data.error ?? `${capability} is not available.`,
        data.requirement,
      )
    }
    return {
      url: data.url,
      mimeType: data.mimeType ?? 'application/octet-stream',
      durationSeconds: data.durationSeconds,
      width: data.width,
      height: data.height,
      provider: this.id,
    }
  }

  removeBackground(request: { assetId: string; assetName: string }) {
    return this.generate('background-removal', request)
  }
  generateImage(request: { prompt: string; aspectRatio: string }) {
    return this.generate('image-generation', request)
  }
  generateVideo(request: { prompt: string; durationSeconds: number; aspectRatio: string }) {
    return this.generate('video-generation', request)
  }
  generateVoice(request: { text: string; voice: string }) {
    return this.generate('voice-generation', request)
  }
  generateSound(request: { prompt: string; durationSeconds: number }) {
    return this.generate('sound-effects', request)
  }
}

const titleize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
