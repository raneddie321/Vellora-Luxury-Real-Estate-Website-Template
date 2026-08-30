import type { ExportOptions, ExportStage, Project, RenderJob } from '@/lib/types'

export interface ExportProgress {
  stage: ExportStage
  /** 0..1 within the whole job. */
  progress: number
  message: string
}

export interface ExportResult {
  blob: Blob
  mimeType: string
  /** What actually produced the file. Never guessed — the UI prints this. */
  engine: RenderJob['engine']
  /** Set when the delivered container differs from the requested one. */
  containerNotice?: string
  durationSeconds: number
}

export interface Exporter {
  readonly id: string
  readonly label: string
  /** Whether this exporter can run right now, and why not if it can't. */
  availability(): Promise<{ available: boolean; reason?: string }>
  export(
    project: Project,
    options: ExportOptions,
    handlers: {
      onProgress: (progress: ExportProgress) => void
      signal: AbortSignal
    },
  ): Promise<ExportResult>
}

export class ExportError extends Error {
  constructor(
    message: string,
    readonly recoverable = true,
    readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'ExportError'
  }
}

export const QUALITY_BITRATE: Record<ExportOptions['quality'], number> = {
  draft: 2_500_000,
  standard: 6_000_000,
  high: 12_000_000,
  max: 24_000_000,
}

export const QUALITY_CRF: Record<ExportOptions['quality'], number> = {
  draft: 30,
  standard: 24,
  high: 20,
  max: 17,
}
