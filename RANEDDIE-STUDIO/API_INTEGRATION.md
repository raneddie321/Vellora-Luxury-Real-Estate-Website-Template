# API integration

How to replace `MockAIProvider` with real providers, one capability at a time.

Nothing here is required to run Editime. The app works with no keys — this
document is about lifting the specific ceilings the built-in engine has.

---

## The contract

Every AI feature goes through one interface, `src/lib/ai/provider.ts`:

```ts
export interface AIProvider {
  readonly id: string
  readonly name: string
  readonly description: string

  capabilities(): CapabilityStatus[]

  generateEditPlan(request: EditPlanRequest): Promise<AIEditPlan>
  chat(messages: AIMessage[], context: TimelineSnapshotForAI): Promise<string>
  analyzeMedia(request: AnalyzeMediaRequest): Promise<SceneAnalysis>
  generateCaption(request): Promise<{ segments: CaptionSegment[]; transcribed: boolean }>

  removeBackground(request): Promise<GeneratedAssetResult>
  generateImage(request): Promise<GeneratedAssetResult>
  generateVideo(request): Promise<GeneratedAssetResult>
  generateVoice(request): Promise<GeneratedAssetResult>
  generateSound(request): Promise<GeneratedAssetResult>
}
```

Two rules, and the product's honesty depends on both:

1. **If you cannot do it, throw.** Raise `CapabilityUnavailableError(capability,
   message, requirement)`. Never return a plausible-looking fake — the UI is
   built to display "Requires API" gracefully, and a fabricated result is worse
   than a missing feature.
2. **`capabilities()` is the source of truth.** The badges in the editor, the
   command bar and Settings › AI all read it. If it says `ready`, the call must
   work.

```ts
type CapabilityAvailability = 'ready' | 'demo' | 'requires-api' | 'unavailable'
```

| Value | Meaning in the UI |
| --- | --- |
| `ready` | Runs now, for real |
| `demo` | Runs now, with a stated limitation (e.g. caption timings without transcription) |
| `requires-api` | Interface exists, refuses to run, names the missing credential |
| `unavailable` | Not supported by this provider at all |

---

## 1. Connecting a language model (easiest, biggest win)

This replaces the deterministic planner, so instructions outside its fixed
vocabulary start working.

**No code changes needed.** Add to `.env.local` and restart:

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-5
```

or

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Confirm it took effect at **Settings › AI** — it names the active provider and
model, and every capability badge updates.

### What changes

- `/api/ai/status` reports `configured: true`, and `registry.ts` swaps
  `MockAIProvider` for `RemoteAIProvider`.
- `/api/ai/plan` sends the timeline snapshot plus your instruction, and validates
  the response against the action vocabulary before it can reach the executor.
- `/api/ai/chat` handles the conversational replies.
- Media analysis **stays local** — there is no reason to upload a waveform to
  answer a question the browser already knows.

### What is sent

A compact JSON summary — project name, duration, aspect ratio, fps, track and
clip ids with labels and times, asset names and durations — plus your prompt.
**Never the media itself.**

### Adding a different model provider

`src/lib/ai/server/language-model.ts` uses plain `fetch`, no vendor SDK. Add one
class and one branch:

```ts
class MyModel implements LanguageModel {
  readonly id = 'mymodel'
  constructor(readonly model: string, private readonly apiKey: string) {}

  async complete({ system, messages, maxTokens, json, signal }) {
    const response = await fetch('https://api.example.com/v1/chat', {
      method: 'POST',
      signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: this.model, system, messages, max_tokens: maxTokens }),
    })
    if (!response.ok) throw new Error(await response.text())
    const data = await response.json()
    return data.output_text.trim()
  }
}
```

Then extend `getLanguageModel()` and the `LanguageProviderId` union in
`src/lib/ai/server/config.ts`.

### Prompt and validation

`PLAN_SYSTEM_PROMPT` in `src/lib/ai/server/plan-schema.ts` documents the full
action vocabulary given to the model. `parsePlanResponse` validates the result:
unknown action types are dropped, strings are length-capped, and an unparseable
response returns `fallback: 'local'` so the client uses the deterministic planner
and labels the plan `local-fallback`.

**Treat model output as untrusted input.** If you extend the vocabulary, extend
the validator in the same commit.

---

## 2. Media generation

`/api/ai/generate` is the single endpoint for background removal, image, video,
voice, music and sound effects. It currently answers **501** with the exact
credential each capability needs, because shipping an unverifiable integration
would be worse than shipping none.

To implement one, edit `src/app/api/ai/generate/route.ts`:

```ts
async function runGeneration(capability: AICapability, body: Record<string, unknown>) {
  switch (capability) {
    case 'background-removal': {
      const output = await replicate('<owner>/<model>:<version>', {
        image: body.imageUrl,
      })
      return { url: output, mimeType: 'image/png' }
    }
    // …
  }
}
```

Return this shape, and the client imports the result as an ordinary asset:

```ts
{
  url: string            // publicly fetchable, or a data: URL
  mimeType: string
  durationSeconds?: number
  width?: number
  height?: number
}
```

Anything else (including a non-2xx) is surfaced to the user as
"Requires API" with the reason attached.

### Provider notes

| Capability | Suggested provider | Env var | Notes |
| --- | --- | --- | --- |
| `background-removal` | Replicate (RVM, BiRefNet) | `REPLICATE_API_TOKEN` | Video matting is per-frame; run it as a `GPUJob`, not inline |
| `image-generation` | Replicate / fal | `REPLICATE_API_TOKEN` or `FAL_API_KEY` | Pass the project aspect ratio through |
| `video-generation` | Replicate / fal | same | Minutes, not seconds — must be a job |
| `voice-generation` | ElevenLabs | `ELEVENLABS_API_KEY` | Return MP3/WAV; the importer probes duration |
| `music-generation` | Replicate (MusicGen) | `REPLICATE_API_TOKEN` | Pass the sequence length as the target duration |
| `sound-effects` | ElevenLabs / Replicate | either | Short one-shots |

`getServerAIConfig()` already maps each capability to its required credential;
once a key is present the capability reports `ready` and the UI stops labelling
it. **Make sure the implementation actually exists before the key flips the
badge** — that pairing is what keeps the app honest.

### Long-running generations

Anything over a few seconds should return a job id rather than blocking:

```
POST /api/ai/generate      → { jobId }
GET  /api/ai/jobs/:id      → { status, progress, result? }
```

`src/lib/jobs/queue.ts` already models this lifecycle; see
`ARCHITECTURE.md § Job system`.

---

## 3. Caption transcription

The one place where "Demo Mode" is doing real work with a real limit.

**Today:** `deriveCaptionTimings` detects speech activity from decoded audio and
produces genuine, correctly-timed caption clips with **empty text**. The UI says
why.

**To add words**, implement transcription and return `transcribed: true`:

```ts
async generateCaption({ assetId, duration, waveform }) {
  const audio = await getBlobStore().get(key)          // client-side
  const form = new FormData()
  form.append('file', audio, 'audio.wav')
  form.append('model', 'whisper-1')
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'segment')

  const response = await fetch('/api/ai/transcribe', { method: 'POST', body: form })
  const data = await response.json()

  return {
    transcribed: true,
    segments: data.segments.map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
      confidence: s.confidence,
    })),
  }
}
```

Add a matching `/api/ai/transcribe` route that holds the key server-side, and
update the `caption` entry in `getServerAIConfig()` so the badge flips from Demo
Mode to Ready.

This is the one capability that uploads media. Say so in your own privacy copy.

---

## 4. Writing a provider from scratch

```ts
// src/lib/ai/my-provider.ts
import { CapabilityUnavailableError, type AIProvider } from './provider'
import { analyzeLocally, deriveCaptionTimings } from './local-engine'

export class MyProvider implements AIProvider {
  readonly id = 'my-provider'
  readonly name = 'My Provider'
  readonly description = 'What it does and where it runs.'

  capabilities() {
    return [
      { capability: 'edit-plan', availability: 'ready', credits: 1, estimatedSeconds: 2 },
      { capability: 'image-generation', availability: 'requires-api',
        note: 'Set MY_API_KEY to enable.', credits: 15, estimatedSeconds: 20 },
      // …one entry per capability. Omissions read as unavailable.
    ]
  }

  async generateEditPlan(request) { /* … */ }
  async chat(messages, snapshot) { /* … */ }

  // Keep local work local — it is faster and it does not upload anything.
  async analyzeMedia(request) { return analyzeLocally(request, this.id) }
  async generateCaption(request) {
    if (!request.waveform?.length) {
      throw new CapabilityUnavailableError('caption', 'This asset has no decoded audio.')
    }
    return deriveCaptionTimings(request.waveform, request.duration)
  }

  async generateImage() {
    throw new CapabilityUnavailableError(
      'image-generation', 'Image generation is not configured.', 'MY_API_KEY',
    )
  }
  // …the rest
}
```

Register it in `src/lib/ai/registry.ts`:

```ts
if (status.provider === 'my-provider') {
  setProvider(new MyProvider(status.capabilities))
}
```

---

## 5. Cost and credits

`CAPABILITY_CREDITS` in `src/lib/ai/provider.ts` holds the demo cost table. The
plan UI reads it, shows the total before anything runs, and refuses to apply a
plan the balance cannot cover.

To meter real usage:

1. Replace `LocalCreditRepository` with a server-backed `CreditRepository`.
2. Have `/api/ai/*` deduct on success, not on request.
3. Keep the pre-flight estimate — showing cost *before* execution is the part
   users actually care about.

---

## 6. Security checklist

- [ ] Keys live in `.env.local`, which is git-ignored. Never `NEXT_PUBLIC_*`.
- [ ] Read them only under `src/lib/ai/server/`, which is marked `server-only`.
- [ ] `/api/ai/status` returns booleans and requirement strings, never values.
- [ ] Validate every model response before it reaches the executor.
- [ ] Cap prompt length (`MAX_PROMPT` in `/api/ai/plan`) and rate-limit the
      routes before exposing them publicly.
- [ ] Do not log request bodies containing user content.
- [ ] If you add transcription, update your privacy copy — it is the one path
      that uploads media.
