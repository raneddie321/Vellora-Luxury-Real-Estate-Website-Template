/**
 * FFmpeg is isolated behind this service so nothing else in the app depends on
 * it. `@ffmpeg/ffmpeg` ships only a thin JS wrapper; the ~32 MB WASM core is
 * fetched from a CDN the first time it is genuinely needed, and never during a
 * page load. If the core cannot be fetched (offline, blocked CDN), every caller
 * gets a clear "unavailable" answer instead of a silent no-op.
 */

export interface TranscodeOptions {
  /** Target container. Only `mp4` is used by the exporter today. */
  container: 'mp4'
  /** Constant Rate Factor: lower is better quality. 18–28 is the useful range. */
  crf: number
  fps: number
  onProgress?: (ratio: number) => void
}

export interface FFmpegService {
  /** True once the WASM core is loaded and ready. */
  readonly ready: boolean
  /** Best-effort check that loading is even possible in this environment. */
  isSupported(): boolean
  load(onProgress?: (ratio: number) => void): Promise<void>
  transcode(input: Blob, options: TranscodeOptions): Promise<Blob>
  /** Frees the worker and WASM memory. */
  dispose(): void
}

export class FFmpegUnavailableError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = 'FFmpegUnavailableError'
  }
}

const CORE_VERSION = '0.12.6'
const CORE_BASE =
  process.env.NEXT_PUBLIC_FFMPEG_CORE_URL ??
  `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`

type FFmpegInstance = {
  loaded: boolean
  load: (config: { coreURL: string; wasmURL: string }) => Promise<boolean>
  writeFile: (path: string, data: Uint8Array) => Promise<boolean>
  readFile: (path: string) => Promise<Uint8Array | string>
  deleteFile: (path: string) => Promise<boolean>
  exec: (args: string[]) => Promise<number>
  on: (event: string, handler: (payload: { progress?: number }) => void) => void
  terminate: () => void
}

class WasmFFmpegService implements FFmpegService {
  private instance: FFmpegInstance | null = null
  private loading: Promise<void> | null = null
  private progressHandler: ((ratio: number) => void) | null = null

  get ready() {
    return Boolean(this.instance?.loaded)
  }

  isSupported() {
    return (
      typeof window !== 'undefined' &&
      typeof WebAssembly !== 'undefined' &&
      typeof Worker !== 'undefined'
    )
  }

  async load(onProgress?: (ratio: number) => void) {
    if (this.ready) return
    if (!this.isSupported()) {
      throw new FFmpegUnavailableError('This browser cannot run the FFmpeg WebAssembly core.')
    }
    if (this.loading) return this.loading

    this.loading = (async () => {
      try {
        const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
          import('@ffmpeg/ffmpeg'),
          import('@ffmpeg/util'),
        ])
        const ffmpeg = new FFmpeg() as unknown as FFmpegInstance
        ffmpeg.on('progress', ({ progress }) => {
          if (typeof progress === 'number') this.progressHandler?.(Math.max(0, Math.min(1, progress)))
        })
        onProgress?.(0.05)
        const coreURL = await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript')
        onProgress?.(0.4)
        const wasmURL = await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm')
        onProgress?.(0.9)
        await ffmpeg.load({ coreURL, wasmURL })
        this.instance = ffmpeg
        onProgress?.(1)
      } catch (error) {
        this.loading = null
        throw new FFmpegUnavailableError(
          'The FFmpeg core could not be downloaded. Check your connection, or export WebM instead.',
          error,
        )
      }
    })()

    return this.loading
  }

  async transcode(input: Blob, options: TranscodeOptions): Promise<Blob> {
    if (!this.instance) await this.load()
    const ffmpeg = this.instance
    if (!ffmpeg) throw new FFmpegUnavailableError('FFmpeg is not loaded.')

    this.progressHandler = options.onProgress ?? null
    const inputName = 'input.webm'
    const outputName = `output.${options.container}`

    try {
      const bytes = new Uint8Array(await input.arrayBuffer())
      await ffmpeg.writeFile(inputName, bytes)
      const exitCode = await ffmpeg.exec([
        '-i', inputName,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', String(options.crf),
        '-pix_fmt', 'yuv420p',
        '-r', String(options.fps),
        '-movflags', '+faststart',
        '-c:a', 'aac',
        '-b:a', '192k',
        outputName,
      ])
      if (exitCode !== 0) {
        throw new FFmpegUnavailableError(`FFmpeg exited with code ${exitCode}.`)
      }
      const data = await ffmpeg.readFile(outputName)
      const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data
      return new Blob([buffer as unknown as BlobPart], { type: 'video/mp4' })
    } finally {
      this.progressHandler = null
      await ffmpeg.deleteFile(inputName).catch(() => undefined)
      await ffmpeg.deleteFile(outputName).catch(() => undefined)
    }
  }

  dispose() {
    this.instance?.terminate()
    this.instance = null
    this.loading = null
  }
}

let service: FFmpegService | null = null

export function getFFmpegService(): FFmpegService {
  service ??= new WasmFFmpegService()
  return service
}
