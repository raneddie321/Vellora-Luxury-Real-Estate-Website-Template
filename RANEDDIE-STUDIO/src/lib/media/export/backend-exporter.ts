import type { ExportOptions, Project } from '@/lib/types'
import { ExportError, type ExportProgress, type ExportResult, type Exporter } from './types'

/**
 * Placeholder for the server-side render path.
 *
 * The contract is written out in full so the frontend never has to change when
 * a worker appears: submit a job, poll it, download the result. It reports
 * itself as unavailable until `RENDER_WORKER_URL` is configured, and it never
 * pretends to have rendered anything.
 *
 * See ARCHITECTURE.md § "Render workers" for the queue design this targets.
 */
export class BackendExporter implements Exporter {
  readonly id = 'backend-worker'
  readonly label = 'Studio render (cloud)'

  constructor(private readonly endpoint: string | undefined) {}

  async availability() {
    if (!this.endpoint) {
      return {
        available: false,
        reason:
          'Cloud rendering is not configured. Set RENDER_WORKER_URL and deploy a render worker to enable faster-than-real-time exports.',
      }
    }
    return { available: true }
  }

  async export(
    _project: Project,
    _options: ExportOptions,
    _handlers: { onProgress: (progress: ExportProgress) => void; signal: AbortSignal },
  ): Promise<ExportResult> {
    throw new ExportError(
      'Cloud rendering is not available in this build. Use the browser renderer, or connect a render worker — see ARCHITECTURE.md.',
      false,
    )
  }
}
