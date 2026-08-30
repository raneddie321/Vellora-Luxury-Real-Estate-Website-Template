import { idbBlobStore } from './idb'
import { LocalCreditRepository, LocalProjectRepository } from './local-repository'
import type { BlobStore, CreditRepository, ProjectRepository } from './types'

export * from './types'
export { idbBlobStore }

const DEFAULT_CREDITS = Number(process.env.NEXT_PUBLIC_DEFAULT_AI_CREDITS ?? 500)

let projectRepository: ProjectRepository | null = null
let creditRepository: CreditRepository | null = null

/**
 * Single seam for storage. Point these at an HTTP-backed implementation and the
 * whole application moves to a server with no other changes.
 */
export function getProjectRepository(): ProjectRepository {
  projectRepository ??= new LocalProjectRepository()
  return projectRepository
}

export function getCreditRepository(): CreditRepository {
  creditRepository ??= new LocalCreditRepository(Number.isFinite(DEFAULT_CREDITS) ? DEFAULT_CREDITS : 500)
  return creditRepository
}

export function getBlobStore(): BlobStore {
  return idbBlobStore
}
