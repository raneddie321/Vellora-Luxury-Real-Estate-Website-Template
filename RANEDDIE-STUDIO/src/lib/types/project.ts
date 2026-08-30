import type { Asset, AspectRatio, ProjectSettings } from './media'
import type { Timeline } from './timeline'

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  /** Seconds, mirrored from `timeline.duration` for cheap listing. */
  duration: number
  aspectRatio: AspectRatio
  settings: ProjectSettings
  assets: Asset[]
  timeline: Timeline
  /** Poster frame for project cards. */
  thumbnailDataUrl?: string
  templateId?: string
  isDemo?: boolean
  /** Schema version, so stored projects can be migrated forward. */
  schemaVersion: number
}

export type ProjectSummary = Pick<
  Project,
  'id' | 'name' | 'createdAt' | 'updatedAt' | 'duration' | 'aspectRatio' | 'thumbnailDataUrl' | 'isDemo'
> & {
  assetCount: number
  clipCount: number
}

export const PROJECT_SCHEMA_VERSION = 1
