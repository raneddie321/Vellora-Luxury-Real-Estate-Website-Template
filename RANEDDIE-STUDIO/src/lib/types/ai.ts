/**
 * AI action + edit-plan models.
 *
 * An AI never mutates the timeline directly. It produces `AIAction`s, which are
 * grouped into reviewable `AIOperation`s inside an `AIEditPlan`. Only when the
 * user applies an operation does the editor store execute those actions — and
 * every execution goes through the normal history system, so it is undoable.
 */

export type AIActionType =
  | 'split'
  | 'trim'
  | 'delete'
  | 'move'
  | 'resize'
  | 'crop'
  | 'speed'
  | 'volume'
  | 'fade'
  | 'color'
  | 'caption'
  | 'transition'
  | 'text'
  | 'audio'
  | 'effect'
  | 'aspect'

export type AITarget =
  | { kind: 'clip'; id: string }
  | { kind: 'track'; id: string }
  | { kind: 'selection' }
  | { kind: 'project' }
  | { kind: 'all-video' }
  | { kind: 'all-audio' }

export interface AIAction {
  type: AIActionType
  target: AITarget
  parameters: Record<string, unknown>
}

/**
 * Capabilities a provider may implement. The UI reads
 * `AIProvider.capabilities()` to decide whether to show a feature as Ready,
 * Demo Mode, or Requires API — it never assumes a capability exists.
 */
export type AICapability =
  | 'edit-plan'
  | 'command-parse'
  | 'analyze-media'
  | 'caption'
  | 'silence-detection'
  | 'smart-trim'
  | 'aspect-convert'
  | 'background-removal'
  | 'image-generation'
  | 'video-generation'
  | 'voice-generation'
  | 'music-generation'
  | 'sound-effects'

export type CapabilityAvailability = 'ready' | 'demo' | 'requires-api' | 'unavailable'

export interface CapabilityStatus {
  capability: AICapability
  availability: CapabilityAvailability
  /** Human-readable reason shown in the UI, e.g. "Set REPLICATE_API_TOKEN". */
  note?: string
  credits: number
  /** Rough wall-clock estimate in seconds, for the plan UI. */
  estimatedSeconds: number
}

export type AIOperationStatus = 'pending' | 'applying' | 'applied' | 'skipped' | 'failed'

export interface AIOperation {
  id: string
  title: string
  description: string
  capability: AICapability
  actions: AIAction[]
  estimatedSeconds: number
  credits: number
  availability: CapabilityAvailability
  availabilityNote?: string
  status: AIOperationStatus
  error?: string
  /** Short, concrete statement of what changes — shown in the preview popover. */
  preview?: string
}

export type AIEditPlanStatus = 'draft' | 'applying' | 'applied' | 'partial' | 'failed'

export interface AIEditPlan {
  id: string
  prompt: string
  summary: string
  createdAt: string
  provider: string
  operations: AIOperation[]
  totalCredits: number
  status: AIEditPlanStatus
  /** One or two sentences of rationale, shown above the operation list. */
  reasoning?: string
  /** Set once applied, so the plan can be undone as a single unit. */
  historyLabel?: string
}

export type ChatRole = 'user' | 'assistant' | 'system'

export interface AIMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  planId?: string
  /** Attached, dismissible suggestions rendered as chips under the message. */
  suggestions?: string[]
  status?: 'streaming' | 'complete' | 'error'
}

export interface AISuggestion {
  id: string
  title: string
  detail: string
  prompt: string
  capability: AICapability
}

/* ------------------------------------------------------------------ */
/* Provider request/response payloads                                  */
/* ------------------------------------------------------------------ */

export interface TimelineSnapshotForAI {
  projectName: string
  duration: number
  aspectRatio: string
  fps: number
  selection: string[]
  tracks: {
    id: string
    kind: string
    name: string
    clips: {
      id: string
      kind: string
      label: string
      start: number
      duration: number
      assetKind?: string
    }[]
  }[]
  assets: { id: string; name: string; kind: string; duration: number }[]
}

export interface EditPlanRequest {
  prompt: string
  snapshot: TimelineSnapshotForAI
}

export interface AnalyzeMediaRequest {
  assetId: string
  assetName: string
  kind: string
  duration: number
  /** Peaks the client already computed, so the provider need not re-decode. */
  waveform?: number[]
  /**
   * Frame-to-frame luma differences sampled by the client. Supplying these lets
   * a provider detect shot changes without ever uploading the video.
   */
  frameDifferences?: number[]
}

export interface CaptionSegment {
  start: number
  end: number
  text: string
  confidence?: number
}

export interface GeneratedAssetResult {
  url: string
  mimeType: string
  durationSeconds?: number
  width?: number
  height?: number
  provider: string
}
