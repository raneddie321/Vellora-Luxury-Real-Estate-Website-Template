import { createId } from '@/lib/id'
import { deepClone } from '@/lib/utils'
import type { CreditState, Project, ProjectSummary } from '@/lib/types'
import { PROJECT_SCHEMA_VERSION } from '@/lib/types'
import { idbBlobStore } from './idb'
import { StorageError, type CreditRepository, type ProjectRepository } from './types'

const INDEX_KEY = 'rs:projects:index'
const PROJECT_KEY = (id: string) => `rs:project:${id}`
const CREDITS_KEY = 'rs:credits'

function readJSON<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    // Corrupt entry: fall back rather than taking the whole app down.
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    const quota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    throw new StorageError(
      quota
        ? 'Your browser storage is full. Delete a project or clear cached media in Settings › Storage.'
        : 'Could not write to local storage.',
      error,
      !quota,
    )
  }
}

const summarize = (project: Project): ProjectSummary => ({
  id: project.id,
  name: project.name,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  duration: project.duration,
  aspectRatio: project.aspectRatio,
  thumbnailDataUrl: project.thumbnailDataUrl,
  isDemo: project.isDemo,
  assetCount: project.assets.length,
  clipCount: project.timeline.tracks.reduce((n, t) => n + t.clips.length, 0),
})

/** Forward-migrates a stored project to the current schema. */
function migrate(project: Project): Project {
  if (project.schemaVersion === PROJECT_SCHEMA_VERSION) return project
  // v0 stores had no schemaVersion; nothing structural changed yet.
  return { ...project, schemaVersion: PROJECT_SCHEMA_VERSION }
}

export class LocalProjectRepository implements ProjectRepository {
  async list(): Promise<ProjectSummary[]> {
    const index = readJSON<ProjectSummary[]>(INDEX_KEY, [])
    return [...index].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async get(id: string): Promise<Project | null> {
    const project = readJSON<Project | null>(PROJECT_KEY(id), null)
    return project ? migrate(project) : null
  }

  async save(project: Project): Promise<void> {
    const next: Project = { ...project, updatedAt: new Date().toISOString() }
    writeJSON(PROJECT_KEY(next.id), next)
    const index = readJSON<ProjectSummary[]>(INDEX_KEY, [])
    const summary = summarize(next)
    const position = index.findIndex((p) => p.id === next.id)
    if (position >= 0) index[position] = summary
    else index.unshift(summary)
    writeJSON(INDEX_KEY, index)
  }

  async delete(id: string): Promise<void> {
    const project = await this.get(id)
    if (typeof localStorage !== 'undefined') localStorage.removeItem(PROJECT_KEY(id))
    writeJSON(
      INDEX_KEY,
      readJSON<ProjectSummary[]>(INDEX_KEY, []).filter((p) => p.id !== id),
    )
    // Drop blobs that only this project referenced. Duplicated projects share
    // their assets by reference, so a blob is only safe to remove once no
    // remaining project points at it.
    if (project) {
      const others = await this.list()
      const remaining = await Promise.all(others.map((summary) => this.get(summary.id)))
      const stillUsed = new Set<string>()
      for (const other of remaining) {
        for (const asset of other?.assets ?? []) {
          if (asset.source.type === 'idb') stillUsed.add(asset.source.key)
        }
      }
      const orphaned = project.assets.filter(
        (asset) => asset.source.type === 'idb' && !stillUsed.has(asset.source.key),
      )
      await Promise.all(
        orphaned.map((asset) =>
          asset.source.type === 'idb'
            ? idbBlobStore.delete(asset.source.key).catch(() => undefined)
            : Promise.resolve(),
        ),
      )
    }
  }

  async duplicate(id: string, name?: string): Promise<string> {
    const project = await this.get(id)
    if (!project) throw new StorageError('That project no longer exists.', undefined, false)
    const copy = deepClone(project)
    copy.id = createId('proj')
    copy.name = name ?? `${project.name} copy`
    copy.createdAt = new Date().toISOString()
    copy.updatedAt = copy.createdAt
    copy.isDemo = false
    // Assets are shared by reference: the same IndexedDB blob backs both
    // projects, and `delete` only removes blobs no project still points at.
    await this.save(copy)
    return copy.id
  }

  async rename(id: string, name: string): Promise<void> {
    const project = await this.get(id)
    if (!project) throw new StorageError('That project no longer exists.', undefined, false)
    project.name = name
    await this.save(project)
  }
}

export class LocalCreditRepository implements CreditRepository {
  constructor(private readonly initialBalance: number) {}

  async read(): Promise<CreditState> {
    return readJSON<CreditState>(CREDITS_KEY, { balance: this.initialBalance, history: [] })
  }

  async write(state: CreditState): Promise<void> {
    writeJSON(CREDITS_KEY, state)
  }
}
