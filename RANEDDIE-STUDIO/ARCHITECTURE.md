# Architecture

How Editime is put together, and where each seam is for the things it does not
do yet.

---

## 1. Principles

Three decisions shape everything else.

### Pure operations

Every timeline mutation is a pure function in `src/lib/timeline/operations.ts`:

```ts
splitClip(timeline, clipId, time, fps): Timeline
trimClip(timeline, clipId, { edge, time, fps, sourceDuration }): Timeline
moveClip(timeline, clipId, { start, trackId }): Timeline
rippleDelete(timeline, clipIds): Timeline
```

They take a timeline and return a new one. No React, no storage, no DOM. That
makes them trivially testable, reusable by a future server-side renderer, and
impossible to couple to the UI by accident.

### One mutation path

The editor store exposes exactly one way to change a project:

```ts
commit(label: string, updater: (project: Project) => Project)
```

`commit` clones, applies, pushes the previous state onto the undo stack, prunes
stale selections and schedules a debounced save. A drag, an inspector slider and
an applied AI operation all go through it — which is why an AI edit is exactly as
undoable as a human one, and why autosave cannot drift out of sync with the
document.

### One renderer

`renderFrame(ctx, { project, time, size, sources, quality })` in
`src/lib/media/compositor.ts` is the single source of visual truth. The preview
calls it every animation frame; the exporter calls it for every exported frame.
There is no second render path that could disagree with what you see.

---

## 2. Frontend

Next.js 16 App Router, React 19, TypeScript strict, Tailwind 3, Radix primitives
in shadcn/ui style, Framer Motion for marketing surfaces only.

### Route groups

| Route | Kind | Purpose |
| --- | --- | --- |
| `/`, `/pricing` | Static | Marketing |
| `/(studio)/dashboard`, `/projects`, `/assets`, `/templates`, `/settings/*` | Static shell, client data | The studio, behind a shared sidebar |
| `/editor/[projectId]` | Dynamic | The editor, its own full-screen layout |
| `/api/ai/*` | Node runtime | Server-only AI endpoints |

### State

Four Zustand stores, deliberately separate:

- **`editor-store`** — the open project, playback, selection, timeline view,
  undo history, AI conversation and plans. The only store that mutates a project.
- **`projects-store`** — the project list and its CRUD operations.
- **`credits-store`** — the local credit ledger.
- **`ui-store`** — per-device preferences (theme, panel tab, assistant
  visibility), persisted straight to `localStorage`.

Components subscribe with narrow selectors (`useEditorStore((s) => s.playhead)`)
so a playhead tick does not re-render the media library.

### Rendering the timeline

Clips are absolutely-positioned elements: `left = start × zoom`,
`width = duration × zoom`. `ClipView` is memoised, because a 60-clip sequence
would otherwise re-render on every frame of playback.

Drag, trim and razor are pointer-event gestures on those elements. During a
gesture the store is *not* touched — a local ghost renders the proposed position
— and the committed change happens once on `pointerup`. Snapping is computed
against real clip boundaries and the playhead, with an 8-pixel tolerance
converted to seconds through the current zoom.

---

## 3. Media pipeline

```
File ──▶ importMedia ──▶ IndexedDB blob + Asset record
                          │
                          ├─ probeMedia      duration, width, height (browser demuxer)
                          ├─ thumbnails      poster frame via canvas
                          └─ computePeaks    decoded RMS peaks via WebAudio
```

Import lives in `src/lib/media/import.ts` and is shared by drag-and-drop upload
and the demo generator. Stages that can fail without invalidating the asset
(poster, waveform) fail soft: a video with no thumbnail is still a usable video.

### Playback

`PlaybackRuntime` (`src/lib/media/playback.ts`) holds one media element **per
clip**, not per asset, so a file used twice on the timeline plays correctly in
both places. Each animation frame it:

1. advances the clock from real elapsed time (so playback rate is honest even
   when a frame overruns its budget),
2. seeks or plays each element to match the timeline,
3. applies `clipGain × trackGain × masterVolume`,
4. calls `renderFrame`.

`src/lib/media/decode.ts` owns element loading. Attaching listeners *after*
setting `src` is a race — a cached blob URL can fire `loadeddata` before the
listener exists — so every load attaches first, checks `readyState`, and times
out loudly rather than hanging.

### Effects

Three stages, so the cheap ones stay free (`src/lib/effects/render.ts`):

| Stage | Effects | Cost |
| --- | --- | --- |
| `filter` | colour, blur | Folded into one canvas `filter` string |
| `composite` | glow, vignette, grain | Extra draw passes |
| `pixel` | sharpen, distortion | Real `getImageData` work |

Pixel-stage effects are genuine: sharpen is a 3×3 unsharp mask, distortion is a
channel shift plus a sine warp. They are **skipped at Draft preview quality**,
and the UI says so — export always runs at full quality regardless.

Colour temperature is approximated with sepia + hue rotation. It is a perceptual
warm/cool shift, not a colour-science-accurate white balance, and the code says
so where it is implemented.

### Export

`BrowserExporter` (`src/lib/media/export/browser-exporter.ts`) composites the
timeline into an offscreen canvas at the target resolution and captures it with
`MediaRecorder`, while WebAudio mixes every clip's audio into the same stream.

```
canvas.captureStream(fps) ─┐
                           ├─▶ MediaRecorder ─▶ Blob ─▶ [ffmpeg.wasm] ─▶ MP4
AudioContext destination ──┘                            (only if needed)
```

This is a real render that produces a playable file. It runs in **real time**,
which the dialog states before you start.

Container handling, in order:

1. If the browser can record H.264 in MP4 directly, do that.
2. Otherwise record WebM and transcode with `ffmpeg.wasm` (single-threaded core,
   fetched from a CDN on first use, ~32 MB).
3. If neither is possible, deliver the WebM **and say exactly why** the container
   differs. The app never claims to have produced a format it did not.

FFmpeg is isolated behind `FFmpegService` in `src/lib/media/ffmpeg.ts` so nothing
else in the codebase depends on it.

---

## 4. AI provider

Nothing in the application imports a vendor SDK. Every AI-shaped feature goes
through `AIProvider` (`src/lib/ai/provider.ts`):

```ts
interface AIProvider {
  capabilities(): CapabilityStatus[]
  generateEditPlan(request): Promise<AIEditPlan>
  chat(messages, snapshot): Promise<string>
  analyzeMedia(request): Promise<SceneAnalysis>
  generateCaption(request): Promise<{ segments; transcribed }>
  removeBackground(request): Promise<GeneratedAssetResult>
  generateImage(request): Promise<GeneratedAssetResult>
  generateVideo(request): Promise<GeneratedAssetResult>
  generateVoice(request): Promise<GeneratedAssetResult>
  generateSound(request): Promise<GeneratedAssetResult>
}
```

Two rules make it trustworthy:

1. A provider that cannot do something throws `CapabilityUnavailableError`. It
   never returns a plausible-looking fake.
2. `capabilities()` is the UI's only source for Ready / Demo Mode / Requires API
   badges, so the interface can never drift from the labels.

### Implementations

- **`MockAIProvider`** — the default. "Mock" does not mean fake: everything it
  reports as `ready` is real work done locally (silence detection, speech-segment
  detection, shot-change detection, deterministic planning).
- **`RemoteAIProvider`** — used when the server reports a configured model.
  Planning and conversation go through `/api/ai/*`; analysis stays local, because
  there is no reason to upload a waveform to answer a question the browser
  already knows. If a remote call fails it degrades to the deterministic planner
  and marks the plan's provider as `local-fallback`, so the UI can say what
  actually happened.

`registry.ts` boots on the mock provider and upgrades in place once
`/api/ai/status` resolves. Everything downstream reads `getAIProvider()`.

### Plans, actions, execution

```
prompt ──▶ planner ──▶ AIEditPlan { operations[] { actions[], credits, seconds } }
                              │
                        user reviews
                              │
                       executor.executeOperation
                              │
                       commit() ──▶ same undo history as a human edit
```

- **`planner.ts`** — the deterministic planner: ~20 intents matched by regex,
  each producing concrete operations. This is the piece an LLM replaces.
- **`executor.ts`** — the *only* bridge between a plan and a project. It uses the
  same pure operations a click uses, so an AI cannot reach a state a person could
  not reach by hand.
- **`plan-schema.ts`** (server) — validates language-model output against the
  action vocabulary before it can reach the executor. A model is untrusted input;
  unknown action types are dropped, and an unparseable response falls back to the
  deterministic planner.

### Local analysis engine

`src/lib/ai/local-engine.ts` is real signal processing over data the client
already decoded:

- **Silence detection** — an amplitude gate over normalised RMS peaks, with
  configurable threshold, minimum duration and padding.
- **Speech segments** — the inverse of silence, split so no caption outlives its
  readability.
- **Shot changes** — frame-to-frame luma difference over a 64×36 downscale,
  thresholded against the sequence mean.

Caption **timings** come from this and are genuine. Caption **text** does not:
transcription needs a speech-to-text provider, so generated captions arrive empty
and the UI says why. Inventing words the speaker never said would be worse than
an empty field.

---

## 5. Job system

Everything expensive is modelled as a job with one lifecycle
(`src/lib/jobs/queue.ts`):

```
queued ──▶ processing ──▶ completed
                      └──▶ failed
                      └──▶ cancelled
```

```ts
interface BaseJob {
  id: string
  status: JobStatus
  progress: number      // 0..1
  createdAt: string
  startedAt?: string
  completedAt?: string
  error?: string
  label: string
}
```

Three variants extend it: `AIJob` (capability, prompt, credits), `RenderJob`
(project, options, stage, output, engine) and `GPUJob` (operation, device,
payload).

Today jobs run in the tab. The queue, its subscription model, cancellation and
history are already written so that moving execution to a server changes only
`JobRunner` — the progress UI and job history keep working unchanged.

---

## 6. GPU workers (not implemented)

`GPUJob` exists as a contract, not a feature. The operations it anticipates —
`matting`, `diffusion`, `upscale`, `interpolate`, `depth` — are exactly the ones
that cannot run acceptably on a main thread.

The intended shape:

```
Browser ──POST /jobs──▶ Queue ──▶ GPU worker pool
   ▲                                   │
   └────── poll / SSE ──── status ──────┘
                                        │
                              Object storage ──▶ signed URL ──▶ asset import
```

Nothing in the client needs to change to adopt this: `createGPUJob` already
produces a well-formed job, and the asset pipeline already accepts a
`{ type: 'remote', url }` source.

### Render workers

`BackendExporter` (`src/lib/media/export/backend-exporter.ts`) is the same idea
for rendering. It reports itself unavailable until `RENDER_WORKER_URL` is
configured and **never pretends to have rendered anything**. `pickExporter()`
probes engines in preference order and the UI names whichever actually ran.

A server-side renderer would let exports run faster than real time, at higher
bit rates, and without keeping a browser tab open.

---

## 7. Storage

Two interfaces (`src/lib/persistence/types.ts`):

```ts
interface ProjectRepository {
  list(): Promise<ProjectSummary[]>
  get(id): Promise<Project | null>
  save(project): Promise<void>
  delete(id): Promise<void>
  duplicate(id, name?): Promise<string>
  rename(id, name): Promise<void>
}

interface BlobStore {
  put(key, blob): Promise<void>
  get(key): Promise<Blob | null>
  delete(key): Promise<void>
  usage(): Promise<{ bytes: number; count: number }>
  clear(): Promise<void>
}
```

The MVP ships `LocalProjectRepository` (localStorage) and `idbBlobStore`
(IndexedDB). Quota errors are caught and surfaced as actionable messages rather
than exceptions. Duplicated projects share their blobs by reference, and
`delete` only removes a blob once no remaining project points at it.

### Migrating to a database

1. Implement `ProjectRepository` against your API.
2. Implement `BlobStore` against S3/R2 with signed URLs.
3. Change the two factory functions in `src/lib/persistence/index.ts`.

Nothing in the UI or the stores changes. `Project.schemaVersion` and the
`migrate()` function in `local-repository.ts` are the forward-migration hook.

A reasonable first schema:

```sql
projects (id, owner_id, name, created_at, updated_at, duration,
          aspect_ratio, settings jsonb, timeline jsonb, schema_version)
assets   (id, project_id, name, kind, mime_type, size, duration,
          width, height, storage_key, thumbnail_url, waveform jsonb,
          analysis jsonb, created_at)
jobs     (id, owner_id, project_id, kind, status, progress, payload jsonb,
          error, created_at, started_at, completed_at)
credits  (id, owner_id, amount, balance_after, capability, description,
          project_id, job_id, created_at)
```

---

## 8. Authentication and billing

Both are deliberately unimplemented, and both have a written contract so the rest
of the app codes against a stable shape:

- `src/lib/auth/index.ts` — `AuthProvider` with `getSession()`, plus a
  `LocalAuthProvider` that reports `status: 'local'` (meaning "no authentication
  is configured", not "signed out"). Swap with `setAuthProvider()`.
- `src/lib/billing/plans.ts` — plan definitions and `isBillingEnabled()`, which
  returns `false` in this build. No payment processor is connected and no card
  details are collected anywhere in this codebase.

---

## 9. Performance

- **Memoised clips.** `ClipView` is a memo leaf; playhead ticks do not re-render
  it.
- **Preview quality scales the canvas.** Draft renders at 40% of the composition
  size and skips per-pixel effects; export ignores the setting entirely.
- **Waveforms are computed once** and cached on the asset record.
- **Filmstrips tile the poster frame** rather than decoding N frames per clip.
- **Tick capping.** The ruler never generates more than 2000 ticks, so an extreme
  zoom-out cannot lock the main thread.
- **Frame-difference sampling** runs on a 64×36 downscale, not full resolution.
- **No heavy libraries.** No charting library, no drag-and-drop framework, no
  animation engine in the editor. Framer Motion is used only on marketing pages.
- **Lazy FFmpeg.** The WASM core is fetched only when a transcode is genuinely
  needed, never during page load.

---

## 10. Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `aside`, `section`) with labels.
- One consistent `:focus-visible` treatment, defined once in `globals.css`.
- Every icon-only control has an `aria-label`; toggles expose `aria-pressed`.
- Radix supplies focus trapping and escape handling for dialogs, menus and
  popovers.
- The segmented control implements roving arrow-key focus as a `radiogroup`.
- Timeline clips are focusable with `aria-label` describing name and duration.
- `prefers-reduced-motion` is honoured globally, plus a manual override in
  Settings › Appearance.
- A skip link precedes the shell on every page.
