import type { AICapability } from './ai'
import type { Fps, ResolutionPreset } from './media'

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface BaseJob {
  id: string
  status: JobStatus
  /** 0..1 */
  progress: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  error?: string
  label: string
}

export interface AIJob extends BaseJob {
  kind: 'ai'
  capability: AICapability
  prompt?: string
  credits: number
  result?: unknown
}

export type ExportContainer = 'mp4' | 'webm'
export type ExportQuality = 'draft' | 'standard' | 'high' | 'max'
export type ExportStage =
  | 'preparing'
  | 'processing'
  | 'rendering'
  | 'transcoding'
  | 'complete'
  | 'failed'

export interface ExportOptions {
  container: ExportContainer
  resolution: ResolutionPreset
  fps: Fps
  quality: ExportQuality
  includeAudio: boolean
  filename: string
}

export interface RenderJob extends BaseJob {
  kind: 'render'
  projectId: string
  options: ExportOptions
  stage: ExportStage
  /** Object URL of the produced file, valid for the lifetime of the tab. */
  outputUrl?: string
  outputSize?: number
  outputMimeType?: string
  /** Which engine actually produced the file — surfaced in the UI, never guessed. */
  engine?: 'browser-canvas' | 'ffmpeg-wasm' | 'backend-worker'
}

/**
 * A placeholder contract for work that must eventually run on a GPU worker
 * (background removal, diffusion, neural upscale). Nothing in the MVP executes
 * these; the type exists so queue plumbing and UI states are written once.
 */
export interface GPUJob extends BaseJob {
  kind: 'gpu'
  operation: 'matting' | 'diffusion' | 'upscale' | 'interpolate' | 'depth'
  device: 'cpu' | 'webgpu' | 'remote-gpu'
  payload: Record<string, unknown>
  outputUrl?: string
}

export type Job = AIJob | RenderJob | GPUJob

export const isTerminal = (status: JobStatus): boolean =>
  status === 'completed' || status === 'failed' || status === 'cancelled'
