'use client'

import { create } from 'zustand'
import { getProjectRepository } from '@/lib/persistence'
import { createProject } from '@/lib/timeline/factories'
import { applyTemplate, getTemplate } from '@/lib/templates'
import type { AspectRatio, Fps, ProjectSummary, ResolutionPreset } from '@/lib/types'

interface CreateProjectInput {
  name: string
  aspectRatio: AspectRatio
  resolution: ResolutionPreset
  fps: Fps
  templateId?: string
}

interface ProjectsStore {
  projects: ProjectSummary[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  busyId: string | null

  refresh: () => Promise<void>
  create: (input: CreateProjectInput) => Promise<string>
  remove: (id: string) => Promise<void>
  duplicate: (id: string) => Promise<string | null>
  rename: (id: string, name: string) => Promise<void>
}

const message = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  projects: [],
  status: 'idle',
  error: null,
  busyId: null,

  async refresh() {
    set({ status: get().status === 'ready' ? 'ready' : 'loading', error: null })
    try {
      set({ projects: await getProjectRepository().list(), status: 'ready' })
    } catch (error) {
      set({ status: 'error', error: message(error, 'Could not read your projects.') })
    }
  },

  async create(input) {
    const project = createProject({
      name: input.name.trim() || 'Untitled project',
      aspectRatio: input.aspectRatio,
      resolution: input.resolution,
      fps: input.fps,
    })
    const template = input.templateId ? getTemplate(input.templateId) : undefined
    const finished = template ? applyTemplate(project, template) : project
    await getProjectRepository().save(finished)
    await get().refresh()
    return finished.id
  },

  async remove(id) {
    set({ busyId: id })
    try {
      await getProjectRepository().delete(id)
      await get().refresh()
    } catch (error) {
      set({ error: message(error, 'Could not delete this project.') })
    } finally {
      set({ busyId: null })
    }
  },

  async duplicate(id) {
    set({ busyId: id })
    try {
      const newId = await getProjectRepository().duplicate(id)
      await get().refresh()
      return newId
    } catch (error) {
      set({ error: message(error, 'Could not duplicate this project.') })
      return null
    } finally {
      set({ busyId: null })
    }
  },

  async rename(id, name) {
    set({ busyId: id })
    try {
      await getProjectRepository().rename(id, name)
      await get().refresh()
    } catch (error) {
      set({ error: message(error, 'Could not rename this project.') })
    } finally {
      set({ busyId: null })
    }
  },
}))
