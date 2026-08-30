# Changelog

All notable changes to Editime are recorded here. This project follows
[Semantic Versioning](https://semver.org/).

---

## [0.1.0] — First MVP

The first working release. A real multi-track video editor with an AI creative
director, running entirely in the browser.

### Editor

- Multi-track timeline with video, audio, text and caption tracks
- Drag to move, drag edges to trim, razor tool, split at playhead, ripple delete
- Snapping to clip boundaries and the playhead, with a visible snap indicator
- Per-track mute, hide, lock, height and gap-closing
- Frame-accurate scrubbing, zoom (wheel + buttons + zoom-to-fit), time ruler
- Clip filmstrips and real audio waveforms drawn from decoded peaks
- 60-step undo/redo covering every operation, including AI-applied ones
- Debounced autosave with a visible save state

### Preview

- Canvas compositor shared with the exporter — the preview is the render
- Transforms (scale, position, rotation, crop), opacity, fades and transitions
- Playback speed (0.25×–4×), loop, volume, safe-area guides
- Three preview quality levels; Draft skips per-pixel effects and says so

### Media

- Import MP4, MOV, WEBM, MP3, WAV, PNG, JPG, WEBP up to 512 MB
- Real metadata probing, poster frames and decoded waveforms
- Upload progress, empty states, and soft failures for non-essential stages
- IndexedDB blob storage with reference-counted cleanup on project delete

### AI

- **Edit plans**: instructions become a reviewable list of operations, each with
  a description, time estimate, credit cost, availability badge and preview
- Apply all, apply individually, or skip — nothing runs without a click
- Deterministic planner covering ~20 editing intents, replaceable by a language
  model with no other code changes
- Optional Anthropic and OpenAI integration via server-only routes
- Real local analysis: silence detection, speech-segment detection and
  shot-change detection over actually-decoded media
- Contextual suggestions derived from live project state
- Command bar (⌘/Ctrl + K) with capability badges
- Credit ledger with pre-flight cost estimates and usage history

### Creative tools

- 16 effect presets across colour, blur, glow, vignette, grain, sharpen and
  distortion, with a three-stage render pipeline
- 8 text presets and 5 animations, with full typographic control
- 6 caption presets; timings detected from real audio
- 5 transitions (cut, fade, dissolve, slide, zoom) with duration and direction
- 17 templates across 9 categories, with labelled slots for missing media

### Export

- Genuine in-browser render via canvas capture plus WebAudio mixing
- MP4 where the browser can record H.264, otherwise WebM with optional
  ffmpeg.wasm transcoding
- Staged progress, cancellation, retry, and an explicit statement of which engine
  produced the file
- Honest disclosure when the delivered container differs from the requested one

### Product surfaces

- Landing page, pricing page (clearly marked as a demonstration)
- Dashboard, projects, assets, templates
- Settings: account, appearance, AI, keyboard shortcuts, storage, billing
- Demo project generated locally in about five seconds
- Purpose-built mobile editor rather than a squeezed desktop timeline

### Architecture

- Pure timeline operations, isolated from React and storage
- Single `commit()` mutation path feeding undo, autosave and persistence
- `AIProvider` interface with mock and remote implementations
- `ProjectRepository` / `BlobStore` interfaces over localStorage and IndexedDB
- Job queue modelling AI, render and (future) GPU work with one lifecycle
- Placeholder contracts for authentication, billing and cloud rendering

### Testing

- `npm run test:smoke` — 22 end-to-end checks in a real browser, including
  compositor output, gesture editing, AI plan application and console cleanliness
- `npm run test:studio` — 13 checks covering project creation, media import,
  template slots, persistence across reload, and project duplicate/rename/delete
- `npm run test:export` — renders both containers and decodes each result to
  prove the file plays

### Known limits

- Export runs in real time
- WebM files carry no duration header (MP4 does)
- The built-in planner has a fixed vocabulary until a language model is connected
- Generative features (matting, image, video, voice, music) require providers
- Caption transcription requires a speech-to-text provider; timings are real,
  text arrives empty
- No authentication, no billing, no collaboration, no cloud sync
