import {
  createCaptionClip,
  createEffect,
  createMediaClip,
  createProject,
  createTextClip,
  createTrack,
  createTransition,
} from '@/lib/timeline/factories'
import { addClip, normalize } from '@/lib/timeline/operations'
import { EFFECT_PRESETS } from '@/lib/effects'
import { importMedia } from '@/lib/media/import'
import { getCaptionPreset, getTextPreset, resolveTextStyle } from '@/lib/text/presets'
import { getProjectRepository } from '@/lib/persistence'
import type { Asset, MediaClip, Project, Timeline } from '@/lib/types'
import { generateDemoMedia } from './media-factory'

export const DEMO_PROJECT_NAME = 'Demo — Neon Skyline'
const DEMO_FLAG_KEY = 'rs:demo:project-id'

/**
 * Builds the demo project.
 *
 * It contains everything the product claims to do: three video clips with real
 * motion, an audio bed with deliberate silences, transitions, effects, animated
 * text and captions. All of it is generated locally on first open — nothing is
 * downloaded and nothing is faked.
 */
export async function createDemoProject(
  onProgress: (ratio: number, label: string) => void,
): Promise<Project> {
  const bundle = await generateDemoMedia((ratio, label) => onProgress(ratio * 0.7, label))

  onProgress(0.72, 'Importing generated media…')
  const assets: Asset[] = []
  for (let i = 0; i < bundle.media.length; i++) {
    const item = bundle.media[i]
    // eslint-disable-next-line no-await-in-loop -- imports touch shared decoders
    const asset = await importMedia(Object.assign(item.blob, { name: item.name }), {
      demo: true,
      name: item.name,
    })
    assets.push(asset)
    onProgress(0.72 + ((i + 1) / bundle.media.length) * 0.2, `Importing ${item.name}…`)
  }

  onProgress(0.94, 'Laying out the timeline…')
  const project = createProject({
    name: DEMO_PROJECT_NAME,
    aspectRatio: '16:9',
    resolution: '1080p',
    fps: 30,
    assets,
    isDemo: true,
  })
  project.timeline = buildDemoTimeline(assets)
  project.duration = project.timeline.duration
  project.thumbnailDataUrl = assets.find((a) => a.kind === 'video')?.thumbnailDataUrl

  await getProjectRepository().save(project)
  if (typeof localStorage !== 'undefined') localStorage.setItem(DEMO_FLAG_KEY, project.id)
  onProgress(1, 'Ready')
  return project
}

function buildDemoTimeline(assets: Asset[]): Timeline {
  const videos = assets.filter((a) => a.kind === 'video')
  const image = assets.find((a) => a.kind === 'image')
  const audio = assets.find((a) => a.kind === 'audio')

  const videoTrack = createTrack('video', 'Video 1')
  const audioTrack = createTrack('audio', 'Music')
  const textTrack = createTrack('text', 'Titles')
  const captionTrack = createTrack('caption', 'Captions')

  let timeline: Timeline = normalize({
    tracks: [textTrack, captionTrack, videoTrack, audioTrack],
    duration: 0,
  })

  const preset = (id: string) => EFFECT_PRESETS.find((p) => p.id === id)!
  const cinematic = preset('color-cinematic')
  const vignette = preset('vignette-classic')
  const grain = preset('grain-fine')
  const bloom = preset('glow-bloom')
  const warm = preset('color-warm')

  /* ---- Video ------------------------------------------------------ */
  let cursor = 0
  const shotStyles = [
    [createEffect('color', cinematic.params, cinematic.name, cinematic.id), createEffect('vignette', vignette.params, vignette.name, vignette.id)],
    [createEffect('color', warm.params, warm.name, warm.id), createEffect('grain', grain.params, grain.name, grain.id)],
    [createEffect('glow', bloom.params, bloom.name, bloom.id), createEffect('vignette', vignette.params, vignette.name, vignette.id)],
  ]

  videos.forEach((asset, index) => {
    const clip: MediaClip = createMediaClip(asset, videoTrack.id, cursor, {
      duration: asset.duration,
      outPoint: asset.duration,
      effects: shotStyles[index % shotStyles.length],
      transitionIn:
        index === 0
          ? createTransition('fade', 0.7)
          : createTransition(index % 2 === 0 ? 'zoom' : 'dissolve', 0.55),
      volume: 0,
      muted: true,
      fadeIn: index === 0 ? 0.4 : 0,
    })
    timeline = addClip(timeline, videoTrack.id, clip)
    cursor += asset.duration
  })

  if (image) {
    const outro: MediaClip = createMediaClip(image, videoTrack.id, cursor, {
      duration: 3,
      outPoint: 3,
      transitionIn: createTransition('fade', 0.8),
      fadeOut: 0.8,
    })
    timeline = addClip(timeline, videoTrack.id, outro)
    cursor += 3
  }

  const total = cursor

  /* ---- Audio ------------------------------------------------------ */
  if (audio) {
    const length = Math.min(audio.duration, total)
    timeline = addClip(
      timeline,
      audioTrack.id,
      createMediaClip(audio, audioTrack.id, 0, {
        duration: length,
        outPoint: length,
        volume: 0.55,
        fadeIn: 0.8,
        fadeOut: 1.2,
      }),
    )
  }

  /* ---- Titles ----------------------------------------------------- */
  const kicker = getTextPreset('kicker')
  const heading = getTextPreset('heading')
  const lowerThird = getTextPreset('lower-third')
  const statement = getTextPreset('statement')

  timeline = addClip(
    timeline,
    textTrack.id,
    createTextClip(textTrack.id, 0.6, 'AN AI-NATIVE CREATIVE STUDIO', {
      duration: 2.6,
      preset: 'kicker',
      style: resolveTextStyle(kicker?.style),
      animation: 'blur-in',
    }),
  )
  timeline = addClip(
    timeline,
    textTrack.id,
    createTextClip(textTrack.id, 4.4, 'Create what you imagine.', {
      duration: 3.2,
      preset: 'heading',
      style: resolveTextStyle(heading?.style),
      animation: 'slide-up',
    }),
  )
  timeline = addClip(
    timeline,
    textTrack.id,
    createTextClip(textTrack.id, 8.6, 'Shot 03 · Product macro', {
      duration: 2.8,
      preset: 'lower-third',
      style: resolveTextStyle(lowerThird?.style),
      animation: 'slide-up',
    }),
  )
  if (image) {
    timeline = addClip(
      timeline,
      textTrack.id,
      createTextClip(textTrack.id, Math.max(0, total - 2.6), 'EDITIME', {
        duration: 2.4,
        preset: 'statement',
        style: resolveTextStyle({ ...statement?.style, fontSize: 108 }),
        animation: 'pop',
      }),
    )
  }

  /* ---- Captions --------------------------------------------------- */
  // Authored text, so the demo shows a finished caption pass. Captions you
  // generate yourself arrive with real timings and empty text until a
  // speech-to-text provider is connected.
  const captionPreset = getCaptionPreset('clean')
  const lines: { start: number; duration: number; text: string }[] = [
    { start: 0.8, duration: 2.4, text: 'Editime turns an instruction into an edit plan.' },
    { start: 3.6, duration: 2.6, text: 'You review every operation before it touches the timeline.' },
    { start: 6.6, duration: 2.4, text: 'Colour, pacing, captions and sound — all editable by hand.' },
    { start: 9.4, duration: 2.6, text: 'Then export a real file, straight from the browser.' },
  ]
  for (const line of lines) {
    if (line.start >= total) continue
    timeline = addClip(
      timeline,
      captionTrack.id,
      createCaptionClip(captionTrack.id, line.start, Math.min(line.duration, total - line.start), line.text, {
        preset: 'clean',
        style: resolveTextStyle(captionPreset?.style),
      }),
    )
  }

  return normalize(timeline)
}

/** The id of the demo project this browser already generated, if any. */
export function getExistingDemoProjectId(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(DEMO_FLAG_KEY)
}

export function forgetDemoProject() {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(DEMO_FLAG_KEY)
}
