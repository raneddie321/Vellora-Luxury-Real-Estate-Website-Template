import { createId } from '@/lib/id'
import type { AIJob, BaseJob, GPUJob, Job, JobStatus, RenderJob } from '@/lib/types'

/**
 * In-memory job queue.
 *
 * Everything expensive in Editime — an AI call, an export, and one day a GPU
 * matting pass — is modelled as a job with the same lifecycle. Today they run
 * in the tab; the moment a backend exists, only `JobRunner` changes: the store,
 * the progress UI and the job history keep working as-is.
 *
 * See ARCHITECTURE.md § "Job system".
 */

export type JobListener = (jobs: Job[]) => void

export interface JobRunner<T extends Job = Job> {
  run(job: T, report: (progress: number, patch?: Partial<T>) => void, signal: AbortSignal): Promise<Partial<T>>
}

const MAX_HISTORY = 40

class JobQueue {
  private jobs: Job[] = []
  private controllers = new Map<string, AbortController>()
  private listeners = new Set<JobListener>()

  subscribe(listener: JobListener): () => void {
    this.listeners.add(listener)
    listener(this.jobs)
    return () => this.listeners.delete(listener)
  }

  list(): Job[] {
    return this.jobs
  }

  private emit() {
    this.jobs = this.jobs.slice(0, MAX_HISTORY)
    const snapshot = [...this.jobs]
    this.listeners.forEach((listener) => listener(snapshot))
  }

  /**
   * Job variants differ by their `kind` discriminant, so a generic patch cannot
   * narrow to one of them. Merging on the shared base and re-asserting keeps the
   * public API typed without leaking `any` to callers.
   */
  private patch(id: string, patch: Partial<BaseJob> & Record<string, unknown>) {
    this.jobs = this.jobs.map((job) => (job.id === id ? ({ ...job, ...patch } as Job) : job))
    this.emit()
  }

  create<T extends Job>(input: Omit<T, 'id' | 'status' | 'progress' | 'createdAt'>): T {
    const job = {
      ...input,
      id: createId('job'),
      status: 'queued' as JobStatus,
      progress: 0,
      createdAt: new Date().toISOString(),
    } as T
    this.jobs = [job, ...this.jobs]
    this.emit()
    return job
  }

  async execute<T extends Job>(job: T, runner: JobRunner<T>): Promise<T> {
    const controller = new AbortController()
    this.controllers.set(job.id, controller)
    this.patch(job.id, { status: 'processing', startedAt: new Date().toISOString(), progress: 0.01 })

    try {
      const result = await runner.run(
        job,
        (progress, patch) =>
          this.patch(job.id, {
            progress: Math.max(0, Math.min(1, progress)),
            ...(patch as Record<string, unknown>),
          }),
        controller.signal,
      )
      if (controller.signal.aborted) {
        this.patch(job.id, { status: 'cancelled', completedAt: new Date().toISOString() })
        return { ...job, ...result, status: 'cancelled' } as T
      }
      this.patch(job.id, {
        ...(result as Record<string, unknown>),
        status: 'completed',
        progress: 1,
        completedAt: new Date().toISOString(),
      })
      return { ...job, ...result, status: 'completed', progress: 1 } as T
    } catch (error) {
      const cancelled = controller.signal.aborted
      const message = error instanceof Error ? error.message : 'The job failed for an unknown reason.'
      this.patch(job.id, {
        status: cancelled ? 'cancelled' : 'failed',
        error: cancelled ? undefined : message,
        completedAt: new Date().toISOString(),
      })
      throw error
    } finally {
      this.controllers.delete(job.id)
    }
  }

  cancel(id: string) {
    this.controllers.get(id)?.abort()
    const job = this.jobs.find((j) => j.id === id)
    if (job && (job.status === 'queued' || job.status === 'processing')) {
      this.patch(id, { status: 'cancelled', completedAt: new Date().toISOString() })
    }
  }

  clearFinished() {
    this.jobs = this.jobs.filter((job) => job.status === 'queued' || job.status === 'processing')
    this.emit()
  }
}

export const jobQueue = new JobQueue()

export const createAIJob = (input: Omit<AIJob, 'id' | 'status' | 'progress' | 'createdAt' | 'kind'>) =>
  jobQueue.create<AIJob>({ ...input, kind: 'ai' } as Omit<AIJob, 'id' | 'status' | 'progress' | 'createdAt'>)

export const createRenderJob = (
  input: Omit<RenderJob, 'id' | 'status' | 'progress' | 'createdAt' | 'kind'>,
) => jobQueue.create<RenderJob>({ ...input, kind: 'render' } as Omit<RenderJob, 'id' | 'status' | 'progress' | 'createdAt'>)

/**
 * GPU jobs are not executed in the MVP. The factory exists so the queue, the
 * progress UI and the history are already correct on the day a worker lands.
 */
export const createGPUJob = (input: Omit<GPUJob, 'id' | 'status' | 'progress' | 'createdAt' | 'kind'>) =>
  jobQueue.create<GPUJob>({ ...input, kind: 'gpu' } as Omit<GPUJob, 'id' | 'status' | 'progress' | 'createdAt'>)
