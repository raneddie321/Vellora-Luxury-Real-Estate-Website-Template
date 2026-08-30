/**
 * Demo media factory.
 *
 * The demo project ships with real, playable media — it is generated on the
 * user's machine the first time they open it, rather than being bundled (which
 * would bloat the repository) or faked (which would be dishonest). The video is
 * recorded from a canvas with MediaRecorder, the audio is synthesised with
 * WebAudio and encoded as a real WAV, and the still is a real PNG.
 *
 * Everything produced here is an ordinary asset: it can be trimmed, graded,
 * exported and deleted like any file the user imports.
 */

export interface GeneratedMedia {
  name: string
  blob: Blob
  mimeType: string
  duration: number
  width: number
  height: number
  kind: 'video' | 'audio' | 'image'
}

type Painter = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void

const VIDEO_W = 1280
const VIDEO_H = 720
const CLIP_SECONDS = 4

/* ------------------------------------------------------------------ */
/* Painters — each is a distinct, recognisable "shot"                  */
/* ------------------------------------------------------------------ */

const skyline: Painter = (ctx, t, w, h) => {
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#0a1030')
  sky.addColorStop(0.55, '#2a1a4a')
  sky.addColorStop(1, '#FF6B35')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  // Sun.
  ctx.save()
  ctx.globalAlpha = 0.9
  const sunY = h * 0.72 - t * 6
  const glow = ctx.createRadialGradient(w * 0.68, sunY, 0, w * 0.68, sunY, h * 0.4)
  glow.addColorStop(0, 'rgba(255,190,120,0.95)')
  glow.addColorStop(1, 'rgba(255,107,53,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  // Three parallax skyline layers drifting at different rates.
  const layers = [
    { depth: 0.25, color: '#1b1436', height: 0.34, speed: 14, seed: 3 },
    { depth: 0.55, color: '#120d26', height: 0.46, speed: 26, seed: 7 },
    { depth: 1, color: '#08060f', height: 0.58, speed: 44, seed: 11 },
  ]
  for (const layer of layers) {
    ctx.fillStyle = layer.color
    const offset = (t * layer.speed) % 140
    for (let i = -1; i < w / 70 + 2; i++) {
      const x = i * 70 - offset
      const seedy = Math.abs(Math.sin((i + layer.seed) * 12.9898) * 43758.5453) % 1
      const buildingH = h * layer.height * (0.5 + seedy * 0.7)
      ctx.fillRect(x, h - buildingH, 54, buildingH)
      // Lit windows.
      ctx.fillStyle = 'rgba(255,200,140,0.5)'
      for (let wy = h - buildingH + 14; wy < h - 10; wy += 22) {
        for (let wx = x + 8; wx < x + 46; wx += 16) {
          const lit = Math.abs(Math.sin((wx + wy + layer.seed) * 0.7 + t * 0.6)) > 0.72
          if (lit) ctx.fillRect(wx, wy, 6, 9)
        }
      }
      ctx.fillStyle = layer.color
    }
  }
}

const studio: Painter = (ctx, t, w, h) => {
  ctx.fillStyle = '#0b0c10'
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2
  const key = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.75)
  key.addColorStop(0, 'rgba(124,107,255,0.55)')
  key.addColorStop(0.5, 'rgba(60,50,140,0.22)')
  key.addColorStop(1, 'rgba(8,9,11,0)')
  ctx.fillStyle = key
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(cx, cy)
  for (let i = 0; i < 5; i++) {
    const radius = h * (0.16 + i * 0.085)
    ctx.rotate(t * (0.14 + i * 0.05))
    ctx.strokeStyle = `rgba(${120 + i * 24}, ${200 - i * 18}, 255, ${0.42 - i * 0.06})`
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(0, 0, radius, i * 0.6, i * 0.6 + Math.PI * 1.35)
    ctx.stroke()
  }
  ctx.restore()

  // Subject silhouette.
  ctx.fillStyle = '#05060a'
  ctx.beginPath()
  ctx.ellipse(cx, cy - h * 0.06, h * 0.11, h * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(cx - h * 0.24, h)
  ctx.quadraticCurveTo(cx, cy + h * 0.02, cx + h * 0.24, h)
  ctx.closePath()
  ctx.fill()
}

const macro: Painter = (ctx, t, w, h) => {
  ctx.fillStyle = '#07080b'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate(Math.sin(t * 0.35) * 0.09)

  const bw = w * 0.44
  const bh = h * 0.44
  const body = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2)
  body.addColorStop(0, '#2a2d36')
  body.addColorStop(0.5, '#4a4f5c')
  body.addColorStop(1, '#191b21')
  ctx.fillStyle = body
  roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 28)
  ctx.fill()

  // Specular sweep travelling across the surface.
  const sweep = ((t / CLIP_SECONDS) * 2.4 - 0.7) * bw
  const spec = ctx.createLinearGradient(sweep - 90, 0, sweep + 90, 0)
  spec.addColorStop(0, 'rgba(255,255,255,0)')
  spec.addColorStop(0.5, 'rgba(255,255,255,0.45)')
  spec.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.save()
  roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 28)
  ctx.clip()
  ctx.fillStyle = spec
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh)
  ctx.restore()

  ctx.strokeStyle = 'rgba(255,107,53,0.85)'
  ctx.lineWidth = 3
  roundRect(ctx, -bw / 2 + 18, -bh / 2 + 18, bw - 36, bh - 36, 18)
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, 0, w, h * 0.1)
  ctx.fillRect(0, h * 0.9, w, h * 0.1)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const SHOTS: { name: string; paint: Painter }[] = [
  { name: 'Demo — Skyline.webm', paint: skyline },
  { name: 'Demo — Studio.webm', paint: studio },
  { name: 'Demo — Product Macro.webm', paint: macro },
]

/* ------------------------------------------------------------------ */
/* Video                                                               */
/* ------------------------------------------------------------------ */

function pickVideoMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
  ]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? null
}

export const canGenerateDemoVideo = () => pickVideoMime() !== null

/**
 * Records all shots at once from a single animation loop, so the whole set
 * takes one clip-length of wall time rather than three.
 */
async function renderShots(onProgress: (ratio: number) => void): Promise<GeneratedMedia[]> {
  const mimeType = pickVideoMime()
  if (!mimeType) return []

  const rigs = SHOTS.map((shot) => {
    const canvas = document.createElement('canvas')
    canvas.width = VIDEO_W
    canvas.height = VIDEO_H
    const ctx = canvas.getContext('2d', { alpha: false })!
    const stream = canvas.captureStream(30)
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 })
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    return { shot, canvas, ctx, stream, recorder, chunks }
  })

  const stopped = rigs.map(
    (rig) =>
      new Promise<void>((resolve) => {
        rig.recorder.onstop = () => resolve()
      }),
  )

  // Paint one frame before recording so no rig starts on an empty canvas.
  for (const rig of rigs) rig.shot.paint(rig.ctx, 0, VIDEO_W, VIDEO_H)
  rigs.forEach((rig) => rig.recorder.start(200))

  const started = performance.now()
  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = (performance.now() - started) / 1000
      for (const rig of rigs) rig.shot.paint(rig.ctx, elapsed, VIDEO_W, VIDEO_H)
      onProgress(Math.min(1, elapsed / CLIP_SECONDS))
      if (elapsed >= CLIP_SECONDS) {
        resolve()
        return
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

  await new Promise((resolve) => setTimeout(resolve, 250))
  rigs.forEach((rig) => rig.recorder.stop())
  await Promise.all(stopped)
  rigs.forEach((rig) => rig.stream.getTracks().forEach((track) => track.stop()))

  return rigs.map((rig) => ({
    name: rig.shot.name.replace('.webm', mimeType.startsWith('video/mp4') ? '.mp4' : '.webm'),
    blob: new Blob(rig.chunks, { type: mimeType }),
    mimeType,
    duration: CLIP_SECONDS,
    width: VIDEO_W,
    height: VIDEO_H,
    kind: 'video' as const,
  }))
}

/* ------------------------------------------------------------------ */
/* Audio                                                               */
/* ------------------------------------------------------------------ */

/** Encodes an AudioBuffer as a 16-bit PCM WAV — a real, portable audio file. */
function encodeWav(buffer: AudioBuffer): Blob {
  const channels = Math.min(2, buffer.numberOfChannels)
  const length = buffer.length * channels * 2
  const view = new DataView(new ArrayBuffer(44 + length))

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, buffer.sampleRate, true)
  view.setUint32(28, buffer.sampleRate * channels * 2, true)
  view.setUint16(32, channels * 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length, true)

  const data = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c))
  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, data[c][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }
  return new Blob([view.buffer], { type: 'audio/wav' })
}

/**
 * Renders a short ambient bed offline: a slow chord pad, a pulse on the beat,
 * and two deliberate gaps so the silence-detection and caption features have
 * something genuine to find.
 */
async function renderAudioBed(durationSeconds: number): Promise<GeneratedMedia | null> {
  const Ctor =
    (typeof window !== 'undefined' && (window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext)) ||
    null
  if (!Ctor) return null

  const sampleRate = 44100
  const ctx = new Ctor(2, Math.ceil(sampleRate * durationSeconds), sampleRate)
  const master = ctx.createGain()
  master.gain.value = 0.5
  master.connect(ctx.destination)

  // Two intentional gaps of near-silence.
  const gaps = [
    { start: 4.2, end: 5.4 },
    { start: 9.0, end: 10.1 },
  ]
  const envelope = ctx.createGain()
  envelope.gain.setValueAtTime(0, 0)
  envelope.gain.linearRampToValueAtTime(1, 0.8)
  for (const gap of gaps) {
    envelope.gain.setValueAtTime(1, gap.start - 0.15)
    envelope.gain.linearRampToValueAtTime(0.008, gap.start)
    envelope.gain.setValueAtTime(0.008, gap.end)
    envelope.gain.linearRampToValueAtTime(1, gap.end + 0.2)
  }
  envelope.gain.setValueAtTime(1, durationSeconds - 1.2)
  envelope.gain.linearRampToValueAtTime(0, durationSeconds)
  envelope.connect(master)

  // Chord pad — A minor 9 voicing.
  for (const frequency of [110, 164.81, 220, 261.63, 329.63]) {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = frequency
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(420, 0)
    filter.frequency.linearRampToValueAtTime(1900, durationSeconds * 0.65)
    filter.frequency.linearRampToValueAtTime(700, durationSeconds)
    filter.Q.value = 6
    const gain = ctx.createGain()
    gain.gain.value = 0.055
    osc.connect(filter).connect(gain).connect(envelope)
    osc.start(0)
    osc.stop(durationSeconds)
  }

  // Pulse on every half-second.
  for (let time = 0.5; time < durationSeconds - 0.4; time += 0.5) {
    if (gaps.some((gap) => time > gap.start && time < gap.end)) continue
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, time)
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.16)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(0.42, time + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22)
    osc.connect(gain).connect(envelope)
    osc.start(time)
    osc.stop(time + 0.3)
  }

  const rendered = await ctx.startRendering()
  return {
    name: 'Demo — Ambient Bed.wav',
    blob: encodeWav(rendered),
    mimeType: 'audio/wav',
    duration: durationSeconds,
    width: 0,
    height: 0,
    kind: 'audio',
  }
}

/* ------------------------------------------------------------------ */
/* Still                                                               */
/* ------------------------------------------------------------------ */

async function renderTitleCard(): Promise<GeneratedMedia | null> {
  const canvas = document.createElement('canvas')
  canvas.width = VIDEO_W
  canvas.height = VIDEO_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const gradient = ctx.createLinearGradient(0, 0, VIDEO_W, VIDEO_H)
  gradient.addColorStop(0, '#08090b')
  gradient.addColorStop(0.55, '#161226')
  gradient.addColorStop(1, '#3a1a10')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, VIDEO_W, VIDEO_H)

  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  for (let x = 0; x < VIDEO_W; x += 48) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, VIDEO_H)
    ctx.stroke()
  }
  for (let y = 0; y < VIDEO_H; y += 48) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(VIDEO_W, y)
    ctx.stroke()
  }

  ctx.fillStyle = '#FF6B35'
  ctx.fillRect(VIDEO_W / 2 - 120, VIDEO_H / 2 + 54, 240, 3)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#F2F3F5'
  ctx.font = '800 74px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText('RANEDDIE STUDIO', VIDEO_W / 2, VIDEO_H / 2 - 6)
  ctx.fillStyle = 'rgba(242,243,245,0.55)'
  ctx.font = '500 26px ui-sans-serif, system-ui, sans-serif'
  ctx.letterSpacing = '6px'
  ctx.fillText('CREATE WHAT YOU IMAGINE', VIDEO_W / 2, VIDEO_H / 2 + 92)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return null
  return {
    name: 'Demo — Title Card.png',
    blob,
    mimeType: 'image/png',
    duration: 0,
    width: VIDEO_W,
    height: VIDEO_H,
    kind: 'image',
  }
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export interface DemoMediaBundle {
  media: GeneratedMedia[]
  /** True when the browser refused to record video and only stills were made. */
  videoSkipped: boolean
}

export async function generateDemoMedia(
  onProgress: (ratio: number, label: string) => void,
): Promise<DemoMediaBundle> {
  const media: GeneratedMedia[] = []

  onProgress(0.02, 'Drawing the title card…')
  const card = await renderTitleCard()
  if (card) media.push(card)

  onProgress(0.1, 'Composing the audio bed…')
  const audio = await renderAudioBed(14)
  if (audio) media.push(audio)

  const canRecord = canGenerateDemoVideo()
  if (canRecord) {
    onProgress(0.2, 'Recording three demo shots…')
    const shots = await renderShots((ratio) =>
      onProgress(0.2 + ratio * 0.75, `Recording three demo shots… ${Math.round(ratio * 100)}%`),
    )
    media.push(...shots)
  }

  onProgress(1, 'Done')
  return { media, videoSkipped: !canRecord }
}
