import type { CreditState, Project, ProjectSummary } from '@/lib/types'

/**
 * Storage contracts.
 *
 * The MVP ships `LocalProjectRepository` (localStorage + IndexedDB). Swapping in
 * Postgres/S3 later means implementing these two interfaces and changing one
 * line in `persistence/index.ts` — no UI or store code changes.
 */
export interface ProjectRepository {
  list(): Promise<ProjectSummary[]>
  get(id: string): Promise<Project | null>
  save(project: Project): Promise<void>
  delete(id: string): Promise<void>
  /** Returns the id of the new copy. */
  duplicate(id: string, name?: string): Promise<string>
  rename(id: string, name: string): Promise<void>
}

export interface BlobStore {
  put(key: string, blob: Blob): Promise<void>
  get(key: string): Promise<Blob | null>
  delete(key: string): Promise<void>
  /** Total bytes held, for the Storage settings page. */
  usage(): Promise<{ bytes: number; count: number }>
  clear(): Promise<void>
}

export interface CreditRepository {
  read(): Promise<CreditState>
  write(state: CreditState): Promise<void>
}

export class StorageError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
    /** Whether retrying the same call could plausibly succeed. */
    readonly retryable = true,
  ) {
    super(message)
    this.name = 'StorageError'
  }
}
