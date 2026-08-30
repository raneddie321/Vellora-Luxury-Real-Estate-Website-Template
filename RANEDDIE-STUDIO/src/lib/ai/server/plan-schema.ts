import 'server-only'
import { createId } from '@/lib/id'
import type { AIAction, AIActionType, AIEditPlan, AIOperation, AITarget, CapabilityStatus } from '@/lib/types'
import { CAPABILITY_CREDITS, CAPABILITY_SECONDS } from '../provider'

/**
 * Validation for language-model output.
 *
 * A model is untrusted input. Anything it returns is checked against the action
 * vocabulary here before it can reach the executor, and unknown action types are
 * dropped rather than passed through. If the whole response fails to parse, the
 * caller falls back to the deterministic planner and says so.
 */

const ACTION_TYPES: AIActionType[] = [
  'split', 'trim', 'delete', 'move', 'resize', 'crop', 'speed', 'volume',
  'fade', 'color', 'caption', 'transition', 'text', 'audio', 'effect', 'aspect',
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function parseTarget(value: unknown): AITarget {
  if (!isRecord(value)) return { kind: 'selection' }
  const kind = value.kind
  if (kind === 'clip' && typeof value.id === 'string') return { kind: 'clip', id: value.id }
  if (kind === 'track' && typeof value.id === 'string') return { kind: 'track', id: value.id }
  if (kind === 'project' || kind === 'selection' || kind === 'all-video' || kind === 'all-audio') {
    return { kind }
  }
  return { kind: 'selection' }
}

function parseActions(value: unknown): AIAction[] {
  if (!Array.isArray(value)) return []
  const actions: AIAction[] = []
  for (const raw of value) {
    if (!isRecord(raw)) continue
    const type = raw.type
    if (typeof type !== 'string' || !ACTION_TYPES.includes(type as AIActionType)) continue
    actions.push({
      type: type as AIActionType,
      target: parseTarget(raw.target),
      parameters: isRecord(raw.parameters) ? raw.parameters : {},
    })
  }
  return actions
}

export interface ParsedPlan {
  summary: string
  reasoning: string
  operations: AIOperation[]
}

export function parsePlanResponse(
  raw: string,
  capabilities: Map<string, CapabilityStatus>,
): ParsedPlan | null {
  const json = extractJson(raw)
  if (!json) return null

  let payload: unknown
  try {
    payload = JSON.parse(json)
  } catch {
    return null
  }
  if (!isRecord(payload) || !Array.isArray(payload.operations)) return null

  const operations: AIOperation[] = []
  for (const raw of payload.operations) {
    if (!isRecord(raw)) continue
    const capability = typeof raw.capability === 'string' ? raw.capability : 'command-parse'
    const status = capabilities.get(capability)
    const actions = parseActions(raw.actions)
    if (actions.length === 0 && status?.availability !== 'requires-api') continue

    operations.push({
      id: createId('op'),
      title: typeof raw.title === 'string' ? raw.title.slice(0, 80) : 'Edit operation',
      description: typeof raw.description === 'string' ? raw.description.slice(0, 400) : '',
      capability: (capability as AIOperation['capability']) ?? 'command-parse',
      actions,
      estimatedSeconds:
        status?.estimatedSeconds ?? CAPABILITY_SECONDS[capability as AIOperation['capability']] ?? 3,
      credits: status?.credits ?? CAPABILITY_CREDITS[capability as AIOperation['capability']] ?? 1,
      availability: status?.availability ?? 'unavailable',
      availabilityNote: status?.note,
      status: 'pending',
      preview: typeof raw.preview === 'string' ? raw.preview.slice(0, 240) : undefined,
    })
  }

  if (operations.length === 0) return null

  return {
    summary:
      typeof payload.summary === 'string'
        ? payload.summary.slice(0, 160)
        : `I'll make ${operations.length} ${operations.length === 1 ? 'change' : 'changes'}.`,
    reasoning: typeof payload.reasoning === 'string' ? payload.reasoning.slice(0, 600) : '',
    operations,
  }
}

/** Models sometimes wrap JSON in prose or a fence — recover the object. */
function extractJson(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) return trimmed
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) return fence[1].trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  return start >= 0 && end > start ? trimmed.slice(start, end + 1) : null
}

export function toEditPlan(
  parsed: ParsedPlan,
  prompt: string,
  provider: string,
): AIEditPlan {
  return {
    id: createId('plan'),
    prompt,
    summary: parsed.summary,
    createdAt: new Date().toISOString(),
    provider,
    operations: parsed.operations,
    totalCredits: parsed.operations.reduce((sum, op) => sum + op.credits, 0),
    status: 'draft',
    reasoning: parsed.reasoning,
  }
}

export const PLAN_SYSTEM_PROMPT = `You are RAN, the creative director inside Editime, a professional AI video editor.

You convert a user's instruction into a REVIEWABLE EDIT PLAN. You never claim work is done — the user applies each operation themselves.

Return a single JSON object:
{
  "summary": "I'll make N changes.",
  "reasoning": "one or two sentences about the creative intent",
  "operations": [
    {
      "title": "Short imperative title",
      "description": "One sentence a non-technical editor understands",
      "capability": "<capability id>",
      "preview": "Concretely what changes, e.g. 'Adds a Color effect (contrast +28).'",
      "actions": [ { "type": "<action type>", "target": {...}, "parameters": {...} } ]
    }
  ]
}

Capability ids: edit-plan, command-parse, analyze-media, caption, silence-detection, smart-trim, aspect-convert, background-removal, image-generation, video-generation, voice-generation, music-generation, sound-effects.
Use "command-parse" for anything applied directly to the timeline with no external model.

Action types: split, trim, delete, move, resize, crop, speed, volume, fade, color, caption, transition, text, audio, effect, aspect.

Targets: {"kind":"clip","id":"clip_x"} | {"kind":"track","id":"track_x"} | {"kind":"selection"} | {"kind":"project"} | {"kind":"all-video"} | {"kind":"all-audio"}

Parameter shapes:
- color / effect: { "effectType": "color|blur|glow|vignette|grain|sharpen|distortion", "presetId": "...", "params": { ... } }
- crop:       { "top": 0.1, "right": 0, "bottom": 0.1, "left": 0 }
- speed:      { "speed": 1.25 }
- volume:     { "volume": 0.8 } or { "muted": true }
- fade:       { "fadeIn": 0.5, "fadeOut": 0.5 }
- transition: { "transitionType": "fade|dissolve|slide|zoom", "duration": 0.5, "position": "between|first-in" }
- split:      { "interval": 1.6 } or { "at": "playhead" }
- trim:       { "mode": "remove-silence" } or { "mode": "to-duration", "targetDuration": 30 }
- caption:    { "preset": "clean|boxed|bold-pop|highlight|broadcast|minimal-mono" }
- text:       { "content": "...", "preset": "heading|subheading|statement|kicker|lower-third|quote|ticker|caption", "start": 0, "duration": 3, "animation": "fade|slide-up|pop|typewriter|blur-in|none" }
- aspect:     { "aspectRatio": "16:9|9:16|1:1|4:5", "reframe": "cover" }
- delete:     { "ripple": true }

Rules:
- Prefer 3-6 focused operations over one vague one.
- Only use clip and track ids that appear in the timeline snapshot.
- If something needs an external model (background removal, generation, voice, music), still include the operation with the right capability — the app labels it "Requires API" and will not run it.
- Never invent transcript text.`
