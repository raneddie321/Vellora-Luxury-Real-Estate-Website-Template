import { createId } from '@/lib/id'
import type {
  AIAction,
  AICapability,
  AIOperation,
  AITarget,
  CapabilityStatus,
  TimelineSnapshotForAI,
} from '@/lib/types'
import { CAPABILITY_CREDITS, CAPABILITY_SECONDS } from './provider'

/**
 * The deterministic planner.
 *
 * This is the MVP's "AI command parser": it turns everyday instructions into
 * concrete, reviewable operations without any network call. It is intentionally
 * a separate module from the provider, so an LLM-backed provider can replace
 * *only* the plan generation while every downstream piece — the plan UI, the
 * executor, credits, undo — keeps working unchanged.
 *
 * See API_INTEGRATION.md § "Replacing the planner".
 */

export interface PlanContext {
  snapshot: TimelineSnapshotForAI
  capabilities: Map<AICapability, CapabilityStatus>
}

export interface PlanDraft {
  summary: string
  reasoning: string
  operations: AIOperation[]
  /** Follow-up prompts offered when the planner could not do much. */
  suggestions?: string[]
}

interface OperationInput {
  title: string
  description: string
  capability: AICapability
  actions: AIAction[]
  preview?: string
  /** Overrides the capability default when an operation is unusually heavy. */
  seconds?: number
  credits?: number
}

function makeOperation(input: OperationInput, ctx: PlanContext): AIOperation {
  const status = ctx.capabilities.get(input.capability)
  return {
    id: createId('op'),
    title: input.title,
    description: input.description,
    capability: input.capability,
    actions: input.actions,
    estimatedSeconds: input.seconds ?? status?.estimatedSeconds ?? CAPABILITY_SECONDS[input.capability],
    credits: input.credits ?? status?.credits ?? CAPABILITY_CREDITS[input.capability],
    availability: status?.availability ?? 'unavailable',
    availabilityNote: status?.note,
    status: 'pending',
    preview: input.preview,
  }
}

/* ------------------------------------------------------------------ */
/* Target resolution                                                   */
/* ------------------------------------------------------------------ */

function videoTarget(snapshot: TimelineSnapshotForAI): AITarget {
  if (snapshot.selection.length === 1) return { kind: 'clip', id: snapshot.selection[0] }
  if (snapshot.selection.length > 1) return { kind: 'selection' }
  return { kind: 'all-video' }
}

const audioTarget = (): AITarget => ({ kind: 'all-audio' })

function describeScope(snapshot: TimelineSnapshotForAI): string {
  if (snapshot.selection.length === 1) return 'the selected clip'
  if (snapshot.selection.length > 1) return `${snapshot.selection.length} selected clips`
  const count = snapshot.tracks
    .filter((t) => t.kind === 'video')
    .reduce((n, t) => n + t.clips.length, 0)
  return count === 1 ? 'the clip on your video track' : `all ${count} video clips`
}

/* ------------------------------------------------------------------ */
/* Intents                                                             */
/* ------------------------------------------------------------------ */

interface Intent {
  id: string
  patterns: RegExp[]
  /** Higher wins when several intents match and they conflict. */
  weight: number
  build: (prompt: string, ctx: PlanContext) => OperationInput[]
  summary: string
}

const seconds = (prompt: string): number | null => {
  const match = prompt.match(/(\d{1,3})\s*(?:-|\s)?\s*(second|sec\b|s\b|minute|min\b)/i)
  if (!match) return null
  const value = Number(match[1])
  return /min/i.test(match[2]) ? value * 60 : value
}

const multiplier = (prompt: string): number | null => {
  const x = prompt.match(/(\d+(?:\.\d+)?)\s*x\b/i)
  if (x) return Number(x[1])
  if (/half\s*speed|slow\s*motion|slow-?mo/i.test(prompt)) return 0.5
  if (/double\s*speed|twice\s*as\s*fast/i.test(prompt)) return 2
  return null
}

const percentage = (prompt: string): number | null => {
  const match = prompt.match(/(\d{1,3})\s*%/)
  return match ? Number(match[1]) / 100 : null
}

const INTENTS: Intent[] = [
  {
    id: 'cinematic',
    weight: 10,
    summary: 'Give the footage a cinematic finish',
    patterns: [/cinematic/i, /film\s*look/i, /movie\s*look/i, /hollywood/i, /blockbuster/i, /trailer/i, /epic\b/i],
    build: (prompt, ctx) => {
      const target = videoTarget(ctx.snapshot)
      const trailer = /hollywood|trailer|blockbuster/i.test(prompt)
      const ops: OperationInput[] = [
        {
          title: 'Color grade',
          description: 'Apply the Cinematic grade: lifted contrast, gently desaturated, cool shadows.',
          capability: 'command-parse',
          preview: 'Adds a Color effect (contrast +28, saturation −12, temperature −12).',
          actions: [
            {
              type: 'color',
              target,
              parameters: {
                presetId: 'color-cinematic',
                params: { exposure: -0.04, contrast: 0.28, saturation: -0.12, temperature: -0.12 },
              },
            },
          ],
        },
        {
          title: 'Add subtle contrast',
          description: 'Vignette the frame edges so the eye lands on the subject.',
          capability: 'command-parse',
          preview: 'Adds a Vignette effect at 40% with a soft falloff.',
          actions: [
            {
              type: 'effect',
              target,
              parameters: { effectType: 'vignette', presetId: 'vignette-classic', params: { amount: 0.4, softness: 0.55 } },
            },
          ],
        },
        {
          title: 'Adjust pacing',
          description: 'Trim dead air from the audio so the cut moves at a deliberate pace.',
          capability: 'smart-trim',
          preview: 'Detects silences longer than 0.45s and removes them, closing the gaps.',
          actions: [{ type: 'trim', target: audioTarget(), parameters: { mode: 'remove-silence' } }],
        },
        {
          title: 'Add cinematic crop',
          description: 'Crop to a 2.39:1 frame, letterboxed inside your project aspect.',
          capability: 'command-parse',
          preview: 'Crops 10.4% from the top and bottom of each clip.',
          actions: [
            { type: 'crop', target, parameters: { top: 0.104, bottom: 0.104, left: 0, right: 0 } },
          ],
        },
        {
          title: 'Add audio enhancement',
          description: 'Normalise clip gain and add short fades so cuts do not click.',
          capability: 'command-parse',
          preview: 'Sets clip volume to 0.9 and adds 0.15s fades at each edge.',
          actions: [
            { type: 'audio', target: audioTarget(), parameters: { action: 'normalize', gain: 0.9 } },
            { type: 'fade', target: audioTarget(), parameters: { fadeIn: 0.15, fadeOut: 0.15 } },
          ],
        },
      ]
      if (trailer) {
        ops.push({
          title: 'Add film grain',
          description: 'Fine 16mm grain over the whole sequence for a shot-on-film texture.',
          capability: 'command-parse',
          preview: 'Adds a Grain effect at 16%.',
          actions: [
            { type: 'effect', target, parameters: { effectType: 'grain', presetId: 'grain-fine', params: { amount: 0.16, size: 1 } } },
          ],
        })
      }
      return ops
    },
  },
  {
    id: 'background-removal',
    weight: 9,
    summary: 'Separate the subject from the background',
    patterns: [/remove\s+(the\s+)?background/i, /cut\s*out\s+(the\s+)?(subject|person)/i, /green\s*screen/i, /matting/i, /rotoscope/i],
    build: (_prompt, ctx) => [
      {
        title: 'Remove background',
        description: 'Run subject matting on the selected footage and keep the alpha channel.',
        capability: 'background-removal',
        preview: 'Produces a matted version of the clip and swaps it in on the video track.',
        actions: [{ type: 'effect', target: videoTarget(ctx.snapshot), parameters: { effectType: 'matte' } }],
      },
    ],
  },
  {
    id: 'silence',
    weight: 8,
    summary: 'Tighten the edit by removing silence',
    patterns: [/remove\s+(the\s+)?silen/i, /cut\s+(the\s+)?silen/i, /dead\s*air/i, /remove\s+(the\s+)?pauses/i, /tighten/i],
    build: () => [
      {
        title: 'Remove silence',
        description: 'Detect silent ranges in the audio and ripple-delete them from the timeline.',
        capability: 'silence-detection',
        preview: 'Splits at each silent range, deletes it, then closes the gaps.',
        actions: [{ type: 'trim', target: audioTarget(), parameters: { mode: 'remove-silence' } }],
      },
    ],
  },
  {
    id: 'captions',
    weight: 8,
    summary: 'Add captions to the sequence',
    patterns: [/caption/i, /subtitle/i, /\bcc\b/i, /transcri/i],
    build: () => [
      {
        title: 'Generate captions',
        description: 'Detect spoken segments and lay timed caption clips on a caption track.',
        capability: 'caption',
        preview: 'Adds one caption clip per detected speech segment, using the Clean preset.',
        actions: [{ type: 'caption', target: { kind: 'project' }, parameters: { preset: 'clean' } }],
      },
    ],
  },
  {
    id: 'social',
    weight: 9,
    summary: 'Reformat for social',
    patterns: [/social/i, /tiktok/i, /reel/i, /\bshorts?\b/i, /instagram/i, /vertical/i],
    build: (prompt, ctx) => {
      const limit = seconds(prompt)
      const ops: OperationInput[] = [
        {
          title: 'Convert to 9:16',
          description: 'Switch the project to vertical and re-frame every clip to fill it.',
          capability: 'aspect-convert',
          preview: 'Sets the project aspect ratio to 9:16 and scales clips to cover the frame.',
          actions: [{ type: 'aspect', target: { kind: 'project' }, parameters: { aspectRatio: '9:16', reframe: 'cover' } }],
        },
      ]
      if (limit) {
        ops.push({
          title: `Trim to ${limit} seconds`,
          description: `Keep the strongest ${limit}s and drop the rest, cutting on natural boundaries.`,
          capability: 'smart-trim',
          preview: `Ripple-trims the timeline so total duration is ${limit}s.`,
          actions: [{ type: 'trim', target: { kind: 'project' }, parameters: { mode: 'to-duration', targetDuration: limit } }],
        })
      }
      ops.push({
        title: 'Add captions',
        description: 'Vertical video is usually watched muted — captions carry the message.',
        capability: 'caption',
        preview: 'Adds caption clips using the Bold Pop preset.',
        actions: [{ type: 'caption', target: { kind: 'project' }, parameters: { preset: 'bold-pop' } }],
      })
      void ctx
      return ops
    },
  },
  {
    id: 'aspect',
    weight: 7,
    summary: 'Change the frame shape',
    patterns: [/16:9/i, /9:16/i, /1:1/i, /4:5/i, /square/i, /portrait/i, /widescreen/i, /landscape/i, /aspect\s*ratio/i],
    build: (prompt) => {
      const ratio = /9:16|vertical|portrait\b/i.test(prompt)
        ? '9:16'
        : /1:1|square/i.test(prompt)
          ? '1:1'
          : /4:5/i.test(prompt)
            ? '4:5'
            : '16:9'
      return [
        {
          title: `Convert to ${ratio}`,
          description: `Change the project aspect ratio to ${ratio} and re-frame clips to fill it.`,
          capability: 'aspect-convert',
          preview: `Sets the project aspect ratio to ${ratio}.`,
          actions: [{ type: 'aspect', target: { kind: 'project' }, parameters: { aspectRatio: ratio, reframe: 'cover' } }],
        },
      ]
    },
  },
  {
    id: 'intro',
    weight: 8,
    summary: 'Build an opening',
    patterns: [/intro/i, /opening/i, /title\s*card/i, /cold\s*open/i, /hook/i],
    build: (prompt, ctx) => {
      const dramatic = /dramatic|epic|bold|cinematic/i.test(prompt)
      return [
        {
          title: 'Add title card',
          description: dramatic
            ? 'Place an oversized statement title over the first three seconds.'
            : 'Place a heading over the opening of the sequence.',
          capability: 'command-parse',
          preview: `Adds a text clip at 0s for 3s using the ${dramatic ? 'Statement' : 'Heading'} preset.`,
          actions: [
            {
              type: 'text',
              target: { kind: 'project' },
              parameters: {
                content: ctx.snapshot.projectName.toUpperCase(),
                preset: dramatic ? 'statement' : 'heading',
                start: 0,
                duration: 3,
                animation: dramatic ? 'pop' : 'fade',
              },
            },
          ],
        },
        {
          title: 'Fade up from black',
          description: 'Open on black and resolve into the first shot.',
          capability: 'command-parse',
          preview: 'Adds a 0.8s fade transition to the first video clip.',
          actions: [
            {
              type: 'transition',
              target: { kind: 'all-video' },
              parameters: { transitionType: 'fade', duration: 0.8, position: 'first-in' },
            },
          ],
        },
        {
          title: 'Push in on the first shot',
          description: 'A slow scale-up gives the opening momentum.',
          capability: 'command-parse',
          preview: 'Adds a zoom transition to the first clip.',
          actions: [
            {
              type: 'transition',
              target: { kind: 'all-video' },
              parameters: { transitionType: 'zoom', duration: 1.2, position: 'first-in' },
            },
          ],
        },
      ]
    },
  },
  {
    id: 'montage',
    weight: 8,
    summary: 'Cut a fast-paced montage',
    patterns: [/montage/i, /fast[\s-]?paced/i, /quick\s*cuts/i, /energetic/i, /upbeat\s*edit/i, /rapid/i],
    build: (prompt, ctx) => {
      const target = videoTarget(ctx.snapshot)
      const interval = seconds(prompt) ?? 1.6
      return [
        {
          title: 'Cut to a rhythm',
          description: `Split the video track every ${interval}s so the sequence moves.`,
          capability: 'command-parse',
          preview: `Adds a cut every ${interval}s across the video track.`,
          actions: [{ type: 'split', target, parameters: { interval } }],
        },
        {
          title: 'Lift the pace',
          description: 'Speed the clips up slightly so each shot lands before it outstays its welcome.',
          capability: 'command-parse',
          preview: 'Sets clip speed to 1.25×.',
          actions: [{ type: 'speed', target, parameters: { speed: 1.25 } }],
        },
        {
          title: 'Blend the cuts',
          description: 'Short dissolves between shots keep the montage fluid.',
          capability: 'command-parse',
          preview: 'Adds 0.2s dissolves between adjacent clips.',
          actions: [
            { type: 'transition', target, parameters: { transitionType: 'dissolve', duration: 0.2, position: 'between' } },
          ],
        },
      ]
    },
  },
  {
    id: 'warm-cool',
    weight: 6,
    summary: 'Shift the colour temperature',
    patterns: [/warmer|warm\s*colou?rs?|golden/i, /cooler|colder|cool\s*colou?rs?|blue\s*tone/i],
    build: (prompt, ctx) => {
      const warm = /warm|golden|orange/i.test(prompt)
      const strength = percentage(prompt) ?? 0.45
      return [
        {
          title: warm ? 'Warm the colours' : 'Cool the colours',
          description: warm
            ? 'Push the white balance toward golden hour.'
            : 'Push the white balance toward a cooler, bluer look.',
          capability: 'command-parse',
          preview: `Adds a Color effect with temperature ${warm ? '+' : '−'}${Math.round(strength * 100)}.`,
          actions: [
            {
              type: 'color',
              target: videoTarget(ctx.snapshot),
              parameters: {
                presetId: warm ? 'color-warm' : 'color-cool',
                params: {
                  exposure: warm ? 0.06 : -0.04,
                  contrast: 0.12,
                  saturation: warm ? 0.14 : -0.06,
                  temperature: warm ? strength : -strength,
                },
              },
            },
          ],
        },
      ]
    },
  },
  {
    id: 'grade',
    weight: 5,
    summary: 'Grade the footage',
    patterns: [/colou?r\s*grade/i, /\bgrade\b/i, /\blut\b/i, /punchy|vibrant|saturated/i, /black\s*and\s*white|monochrome|greyscale|grayscale/i, /desaturat/i],
    build: (prompt, ctx) => {
      const mono = /black\s*and\s*white|monochrome|greyscale|grayscale/i.test(prompt)
      const punch = /punchy|vibrant|saturated/i.test(prompt)
      return [
        {
          title: mono ? 'Convert to monochrome' : punch ? 'Add punch' : 'Apply a grade',
          description: mono
            ? 'Remove all colour and hold shape with contrast.'
            : punch
              ? 'Raise contrast and saturation for a bold, high-energy look.'
              : 'Apply the Cinematic grade as a starting point.',
          capability: 'command-parse',
          preview: `Adds a Color effect using the ${mono ? 'Monochrome' : punch ? 'Punch' : 'Cinematic'} preset.`,
          actions: [
            {
              type: 'color',
              target: videoTarget(ctx.snapshot),
              parameters: {
                presetId: mono ? 'color-mono' : punch ? 'color-punch' : 'color-cinematic',
                params: mono
                  ? { exposure: 0, contrast: 0.3, saturation: -1, temperature: 0 }
                  : punch
                    ? { exposure: 0.05, contrast: 0.45, saturation: 0.4, temperature: 0.05 }
                    : { exposure: -0.04, contrast: 0.28, saturation: -0.12, temperature: -0.12 },
              },
            },
          ],
        },
      ]
    },
  },
  {
    id: 'music',
    weight: 8,
    summary: 'Score the sequence',
    patterns: [/background\s*music/i, /add\s+music/i, /soundtrack/i, /\bscore\b/i, /\bbgm\b/i],
    build: (prompt, ctx) => [
      {
        title: 'Generate background music',
        description: 'Compose a bed that matches the sequence length and drop it on the audio track.',
        capability: 'music-generation',
        preview: `Requests roughly ${Math.max(10, Math.round(ctx.snapshot.duration))}s of music and adds it as a new audio clip.`,
        actions: [
          {
            type: 'audio',
            target: { kind: 'project' },
            parameters: { action: 'generate-music', prompt, durationSeconds: Math.max(10, ctx.snapshot.duration) },
          },
        ],
      },
    ],
  },
  {
    id: 'sfx',
    weight: 7,
    summary: 'Add sound design',
    patterns: [/sound\s*effect/i, /\bsfx\b/i, /whoosh/i, /impact\s*sound/i, /foley/i],
    build: (prompt) => [
      {
        title: 'Generate sound effect',
        description: 'Synthesise a one-shot effect and place it at the playhead.',
        capability: 'sound-effects',
        preview: 'Adds a short audio clip at the current playhead position.',
        actions: [{ type: 'audio', target: { kind: 'project' }, parameters: { action: 'generate-sfx', prompt, durationSeconds: 2 } }],
      },
    ],
  },
  {
    id: 'voice',
    weight: 7,
    summary: 'Add narration',
    patterns: [/voice\s*over/i, /voiceover/i, /narrat/i, /text\s*to\s*speech/i, /\btts\b/i, /read\s+this\s+out/i],
    build: (prompt) => [
      {
        title: 'Generate voice over',
        description: 'Synthesise narration and place it on the audio track.',
        capability: 'voice-generation',
        preview: 'Adds a generated voice clip at the playhead.',
        actions: [{ type: 'audio', target: { kind: 'project' }, parameters: { action: 'generate-voice', prompt } }],
      },
    ],
  },
  {
    id: 'image-gen',
    weight: 7,
    summary: 'Generate imagery',
    patterns: [/generate\s+(an?\s+)?(image|background|environment|scene|backdrop)/i, /create\s+a?\s*(futuristic|fantasy|sci-?fi)?\s*(environment|world|city|landscape|backdrop)/i, /\bmake\s+an?\s+image\b/i],
    build: (prompt, ctx) => [
      {
        title: 'Generate environment plate',
        description: 'Create a still plate from your description and add it to the media library.',
        capability: 'image-generation',
        preview: `Generates one ${ctx.snapshot.aspectRatio} image and imports it as an asset.`,
        actions: [{ type: 'effect', target: { kind: 'project' }, parameters: { action: 'generate-image', prompt } }],
      },
    ],
  },
  {
    id: 'video-gen',
    weight: 7,
    summary: 'Generate footage',
    patterns: [/generate\s+(a\s+)?(video|shot|clip|footage)/i, /text\s*to\s*video/i, /animate\s+this\s+image/i],
    build: (prompt) => [
      {
        title: 'Generate video shot',
        description: 'Create a short generated shot from your description.',
        capability: 'video-generation',
        preview: 'Generates a clip and imports it as an asset.',
        actions: [{ type: 'effect', target: { kind: 'project' }, parameters: { action: 'generate-video', prompt, durationSeconds: 4 } }],
      },
    ],
  },
  {
    id: 'speed',
    weight: 6,
    summary: 'Change playback speed',
    patterns: [/speed\s*(it\s*)?(up|down)/i, /\d+(\.\d+)?\s*x\b/i, /slow\s*motion/i, /slow-?mo/i, /faster|slower/i],
    build: (prompt, ctx) => {
      const factor = multiplier(prompt) ?? (/down|slower|slow/i.test(prompt) ? 0.5 : 2)
      return [
        {
          title: `Set speed to ${factor}×`,
          description: `Play ${describeScope(ctx.snapshot)} at ${factor}× — the clip length changes to match.`,
          capability: 'command-parse',
          preview: `Sets clip speed to ${factor}×.`,
          actions: [{ type: 'speed', target: videoTarget(ctx.snapshot), parameters: { speed: factor } }],
        },
      ]
    },
  },
  {
    id: 'volume',
    weight: 6,
    summary: 'Adjust levels',
    patterns: [/volume/i, /louder|quieter/i, /\bmute\b/i, /turn\s*(it\s*)?(up|down)/i],
    build: (prompt) => {
      const mute = /\bmute\b/i.test(prompt)
      const level = percentage(prompt) ?? (/louder|up\b/i.test(prompt) ? 1.4 : 0.6)
      return [
        {
          title: mute ? 'Mute audio' : `Set volume to ${Math.round(level * 100)}%`,
          description: mute ? 'Silence the audio track.' : 'Change the gain on the audio track.',
          capability: 'command-parse',
          preview: mute ? 'Mutes every audio clip.' : `Sets audio clip volume to ${level.toFixed(2)}.`,
          actions: [
            { type: 'volume', target: audioTarget(), parameters: mute ? { muted: true } : { volume: level } },
          ],
        },
      ]
    },
  },
  {
    id: 'fade',
    weight: 5,
    summary: 'Add fades',
    patterns: [/fade\s*(in|out)/i, /fade\s*to\s*black/i, /\bfades?\b/i],
    build: (prompt, ctx) => {
      const inOnly = /fade\s*in/i.test(prompt) && !/fade\s*out/i.test(prompt)
      const outOnly = /fade\s*out|fade\s*to\s*black/i.test(prompt) && !/fade\s*in/i.test(prompt)
      const value = 0.6
      return [
        {
          title: 'Add fades',
          description: inOnly ? 'Fade in at the start of each clip.' : outOnly ? 'Fade out at the end of each clip.' : 'Fade in and out on each clip.',
          capability: 'command-parse',
          preview: `Sets ${inOnly ? 'fade in' : outOnly ? 'fade out' : 'fade in and out'} to ${value}s.`,
          actions: [
            {
              type: 'fade',
              target: videoTarget(ctx.snapshot),
              parameters: { fadeIn: outOnly ? undefined : value, fadeOut: inOnly ? undefined : value },
            },
          ],
        },
      ]
    },
  },
  {
    id: 'blur-glow',
    weight: 5,
    summary: 'Add a look effect',
    patterns: [/\bblur\b/i, /\bglow\b/i, /\bbloom\b/i, /vignette/i, /\bgrain\b/i, /sharpen/i, /glitch|vhs/i, /dreamy/i],
    build: (prompt, ctx) => {
      const target = videoTarget(ctx.snapshot)
      const specs: { type: string; preset: string; params: Record<string, number>; label: string }[] = []
      if (/\bblur\b/i.test(prompt)) specs.push({ type: 'blur', preset: 'blur-soft', params: { radius: 6 }, label: 'Blur' })
      if (/\bglow\b|\bbloom\b|dreamy/i.test(prompt))
        specs.push({ type: 'glow', preset: 'glow-bloom', params: { intensity: 0.5, radius: 26, threshold: 0.6 }, label: 'Glow' })
      if (/vignette/i.test(prompt))
        specs.push({ type: 'vignette', preset: 'vignette-classic', params: { amount: 0.4, softness: 0.55 }, label: 'Vignette' })
      if (/\bgrain\b/i.test(prompt))
        specs.push({ type: 'grain', preset: 'grain-16mm', params: { amount: 0.42, size: 2 }, label: 'Grain' })
      if (/sharpen/i.test(prompt)) specs.push({ type: 'sharpen', preset: 'sharpen-crisp', params: { amount: 0.4 }, label: 'Sharpen' })
      if (/glitch|vhs/i.test(prompt))
        specs.push({ type: 'distortion', preset: 'distortion-vhs', params: { chroma: 0.5, wave: 0.35 }, label: 'Distortion' })

      return specs.map((spec) => ({
        title: `Add ${spec.label}`,
        description: `Apply the ${spec.label} effect to ${describeScope(ctx.snapshot)}.`,
        capability: 'command-parse' as const,
        preview: `Adds a ${spec.label} effect.`,
        actions: [
          { type: 'effect' as const, target, parameters: { effectType: spec.type, presetId: spec.preset, params: spec.params } },
        ],
      }))
    },
  },
  {
    id: 'highlights',
    weight: 7,
    summary: 'Find the strongest moments',
    patterns: [/best\s*moments/i, /highlight/i, /find\s+the\s+good/i, /interesting\s*parts/i, /analy[sz]e/i],
    build: () => [
      {
        title: 'Analyse the footage',
        description: 'Sample the video for shot changes and the audio for energy, then mark what stands out.',
        capability: 'analyze-media',
        preview: 'Adds scene markers to each analysed asset. Nothing on the timeline changes.',
        actions: [{ type: 'effect', target: { kind: 'project' }, parameters: { action: 'analyze' } }],
      },
    ],
  },
  {
    id: 'split',
    weight: 5,
    summary: 'Cut the clip',
    patterns: [/\bsplit\b/i, /\bcut\s+(at|here|it)\b/i, /\bslice\b/i],
    build: (prompt, ctx) => [
      {
        title: 'Split at the playhead',
        description: 'Cut every clip under the playhead into two.',
        capability: 'command-parse',
        preview: 'Splits clips at the current playhead position.',
        actions: [{ type: 'split', target: videoTarget(ctx.snapshot), parameters: { at: 'playhead' } }],
      },
    ],
  },
  {
    id: 'delete',
    weight: 5,
    summary: 'Remove clips',
    patterns: [/\bdelete\b/i, /\bremove\s+(this|that|the)?\s*clip/i, /get\s+rid\s+of/i],
    build: () => [
      {
        title: 'Delete selection',
        description: 'Remove the selected clips and close the gap they leave behind.',
        capability: 'command-parse',
        preview: 'Ripple-deletes the selected clips.',
        actions: [{ type: 'delete', target: { kind: 'selection' }, parameters: { ripple: true } }],
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export const EXAMPLE_PROMPTS = [
  'Make this feel cinematic.',
  'Remove the background.',
  'Turn this into a 30 second social video.',
  'Create a dramatic intro.',
  'Add subtitles.',
  'Make the colors warmer.',
  'Remove the silence.',
  'Create a fast-paced montage.',
  'Add background music.',
  'Create a futuristic environment.',
  'Make this look like a Hollywood trailer.',
]

export function buildPlan(prompt: string, ctx: PlanContext): PlanDraft {
  const trimmed = prompt.trim()
  const matched = INTENTS.filter((intent) => intent.patterns.some((pattern) => pattern.test(trimmed))).sort(
    (a, b) => b.weight - a.weight,
  )

  if (matched.length === 0) {
    return {
      summary: 'I could not map that to an operation yet',
      reasoning:
        'The built-in planner works from a fixed vocabulary of editing operations. Connect a language-model provider in Settings › AI to handle open-ended instructions, or try one of these:',
      operations: [],
      suggestions: [
        'Make this feel cinematic.',
        'Remove the silence.',
        'Add subtitles.',
        'Turn this into a 30 second social video.',
      ],
    }
  }

  const seen = new Set<string>()
  const operations: AIOperation[] = []
  for (const intent of matched) {
    for (const input of intent.build(trimmed, ctx)) {
      const key = `${input.capability}:${input.title}`
      if (seen.has(key)) continue
      seen.add(key)
      operations.push(makeOperation(input, ctx))
    }
  }

  const primary = matched[0]
  const count = operations.length
  return {
    summary: `I'll make ${count} ${count === 1 ? 'change' : 'changes'}.`,
    reasoning: `${primary.summary}. Reviewed against ${describeScope(ctx.snapshot)} across ${ctx.snapshot.duration.toFixed(1)}s of timeline.`,
    operations,
  }
}
