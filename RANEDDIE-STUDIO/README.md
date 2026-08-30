# Editime — by RANEDDIE STUDIO

**Create what you imagine.**

An AI-native creative studio for video, VFX, motion, audio and beyond. This
repository is the **first working MVP**: a real multi-track video editor with an
AI creative director built into it, running entirely in the browser with no
account, no upload and no API key required.

---

## What this actually does

Everything in this list runs today, on your machine, with zero configuration:

| Area | What works |
| --- | --- |
| **Timeline** | Multi-track editing with drag, trim, split, ripple delete, snapping, frame-accurate scrubbing, per-track mute/hide/lock, and a 60-step undo history |
| **Preview** | Canvas compositor with transforms, crops, fades, transitions, effects and animated text — the same code path the exporter uses |
| **Media** | Import MP4 / MOV / WEBM / MP3 / WAV / PNG / JPG / WEBP, with real metadata probing, poster frames and decoded audio waveforms |
| **AI assistant** | Natural-language instructions become a reviewable **edit plan**; each operation states what it changes, how long it takes and what it costs before you apply it |
| **AI analysis** | Silence detection, speech-segment detection and shot-change detection, computed from your actual decoded media |
| **Effects** | Colour, blur, glow, vignette, grain, sharpen and distortion — 16 presets, composited on canvas (sharpen and distortion are true per-pixel passes) |
| **Text & captions** | 8 text presets, 6 caption presets, 5 animations, full typographic control |
| **Templates** | 17 production-ready starts across 9 categories, with labelled slots for media you have not imported yet |
| **Export** | A genuine render: the timeline is composited and captured to a real MP4 or WebM file you can play |
| **Command bar** | ⌘/Ctrl + K, with capability badges so you never hit a wall after pressing enter |

### What needs an external provider

These features have finished interfaces, wired-up UI and honest labelling — they
are marked **Requires API** in the app and refuse to run rather than faking a
result:

- Background removal / matting
- Image generation
- Video generation
- AI voice (text-to-speech)
- AI music and sound effects
- Caption **transcription** (timings are detected locally and are real; the words
  need a speech-to-text provider, so generated captions arrive empty and ready to
  type into)

See [`API_INTEGRATION.md`](./API_INTEGRATION.md) for how to connect each one.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>, then click **Watch Demo** (or **Open demo project**
on the dashboard). The demo project generates three video shots, an audio bed, a
title card, titles and captions **on your machine** in about five seconds —
nothing is downloaded.

Requires **Node 18.18+** (Node 22 recommended) and a Chromium-based or Firefox
browser for the export path.

### Production build

```bash
npm run build
npm start
```

### Checks

```bash
npm run lint        # ESLint (flat config, next/core-web-vitals + typescript)
npm run typecheck   # tsc --noEmit
npm run check       # lint + typecheck + build
```

### End-to-end tests

Both drive a real browser against the production build.

```bash
npm run build && npm start -- --port 3210    # in one terminal

npm run test:smoke    # 22 checks: routes, demo generation, compositor output,
                      # playback, drag/trim, AI plan, undo, shortcuts, mobile
npm run test:studio   # 13 checks: project creation, file import, templates,
                      # persistence across reload, duplicate/rename/delete
npm run test:export   # renders WebM and MP4, then decodes each result to prove
                      # the file actually plays
```

`test:export` runs the render in real time, so a 15-second sequence takes about
15 seconds per container. All three fail the build on any console error.

Point them elsewhere with `BASE_URL`, and at a specific browser binary with
`PW_EXECUTABLE`.

---

## Environment variables

Copy `.env.example` to `.env.local`. **Nothing is required** — with no keys the
app runs on the built-in engine and every feature is explorable.

| Variable | Purpose |
| --- | --- |
| `AI_PROVIDER` | `mock` (default), `anthropic` or `openai` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | Language model for open-ended instructions |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | Alternative language model |
| `REPLICATE_API_TOKEN` | Matting, image/video/music generation |
| `ELEVENLABS_API_KEY` | Voice and sound effects |
| `FAL_API_KEY` | Alternative image/video generation |
| `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_URL` | Branding and metadata |
| `NEXT_PUBLIC_DEFAULT_AI_CREDITS` | Starting credit balance (default 500) |
| `NEXT_PUBLIC_FFMPEG_CORE_URL` | Override the ffmpeg.wasm core CDN |

Secrets are read **only** on the server, in `src/lib/ai/server/config.ts`, which
is marked `server-only` — importing it from a client component is a build error.
The browser learns what is configured through `GET /api/ai/status`, which returns
booleans and requirement strings, never values.

---

## Architecture at a glance

```
src/
├─ app/                    Routes: landing, pricing, dashboard, projects,
│  │                       assets, templates, settings, editor, /api/ai/*
│  └─ api/ai/              Server-only AI endpoints (status, plan, chat, generate)
├─ components/
│  ├─ ui/                  shadcn/ui-style primitives on Radix
│  ├─ landing/             Marketing surfaces
│  ├─ studio/              Dashboard, projects, assets, templates, settings
│  └─ editor/              Top bar, panels, preview, timeline, assistant,
│                          inspector, command bar, export
└─ lib/
   ├─ types/               Domain models — no React, no storage
   ├─ timeline/            Pure timeline operations (split, trim, move, snap)
   ├─ media/               Probe, import, compositor, playback, export, ffmpeg
   ├─ effects/             Effect catalogue + the three-stage render pipeline
   ├─ ai/                  Provider interface, planner, executor, local engine
   ├─ jobs/                Job queue (AI, render, GPU)
   ├─ persistence/         Repository interfaces + localStorage/IndexedDB impl
   ├─ store/               Zustand stores (editor, projects, credits, UI)
   ├─ templates/           Template catalogue + application
   ├─ auth/  billing/      Placeholder contracts for future providers
   └─ demo/                Demo media factory + demo project
```

Three ideas hold it together:

1. **Pure operations.** Everything that changes a timeline lives in
   `lib/timeline/operations.ts` as a pure function. The store is the only thing
   that decides when to run one.
2. **One mutation path.** Every edit — a drag, an inspector slider, an applied AI
   operation — goes through `commit(label, updater)`, so undo, autosave and the
   dirty flag are correct by construction.
3. **One renderer.** `renderFrame` in `lib/media/compositor.ts` draws the preview
   *and* every exported frame. There is no second render path that could disagree
   with what you see.

Full detail in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Where your data lives

- **Projects** — `localStorage`, as JSON, behind a `ProjectRepository` interface.
- **Media** — IndexedDB, as blobs, behind a `BlobStore` interface.
- **Credits** — `localStorage`, a local ledger; nothing is billed.
- **Nothing is uploaded.** With no AI provider configured there are no outbound
  requests at all. With one configured, only a compact timeline summary and your
  instruction are sent — never your media.

Swapping in a database and object storage means implementing two interfaces and
changing one line in `src/lib/persistence/index.ts`.

---

## Deployment

The app builds to a standard Next.js output and deploys anywhere Next 16 runs
(Vercel, a Node container, a self-hosted server).

```bash
npm run build
npm start           # or: next start -p $PORT
```

Notes for production:

- Set `AI_PROVIDER` and the matching key as **server** environment variables.
- `/api/ai/*` routes are `runtime: 'nodejs'` and `dynamic: 'force-dynamic'`.
- Export runs in the user's browser, so no server GPU or FFmpeg install is
  needed. If you want faster-than-real-time renders, implement the
  `BackendExporter` contract — see `ARCHITECTURE.md § Render workers`.
- The MP4 fallback fetches the ffmpeg.wasm core from jsDelivr on first use. Set
  `NEXT_PUBLIC_FFMPEG_CORE_URL` to self-host it if your CSP forbids that.

---

## Known limits

Stated plainly, because the point of this build is that it does not pretend:

- **Export runs in real time.** A 60-second sequence takes about 60 seconds to
  write. The dialog says so before you start.
- **WebM files carry no duration header.** MediaRecorder writes them as a live
  stream, so some players show the length as unknown. MP4 does not have this
  problem, and the app tells you when it applies.
- **The built-in planner has a fixed vocabulary.** It handles the common editing
  instructions well and says so honestly when a request falls outside it.
  Connecting a language model removes the limit.
- **Generative features need providers.** See the table above.
- **Mobile does not host the timeline.** Phones get a purpose-built layout with
  preview, transport, a linear clip list, media import and the assistant.
- **The MP4-via-ffmpeg fallback is untested in CI here** because the sandbox this
  was built in blocks the CDN. The graceful-degradation path *is* tested: the app
  delivers WebM and states exactly why.

---

## Documentation

| File | Contents |
| --- | --- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Frontend, media pipeline, AI provider, job system, GPU workers, storage, database migration path |
| [`API_INTEGRATION.md`](./API_INTEGRATION.md) | Replacing `MockAIProvider` with a real provider, endpoint by endpoint |
| [`CUSTOMER_SETUP.md`](./CUSTOMER_SETUP.md) | Non-developer setup, first project, troubleshooting |
| [`CHANGELOG.md`](./CHANGELOG.md) | Release history |

---

## Licence

Provided as-is for evaluation. No warranty. Pricing shown in the application is
illustrative — no payment provider is connected and no card details are collected
anywhere in this codebase.
