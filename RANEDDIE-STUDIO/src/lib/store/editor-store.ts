'use client'

import { create } from 'zustand'
import { createId } from '@/lib/id'
import { getAIProvider } from '@/lib/ai/registry'
import { CapabilityUnavailableError } from '@/lib/ai/provider'
import { ActionNotApplicableError, executeAction, executeOperation } from '@/lib/ai/executor'
import { computeSuggestions } from '@/lib/ai/suggestions'
import { sampleFrameDifferences } from '@/lib/ai/local-engine'
import { ensureWaveform } from '@/lib/media/import'
import { resolveAssetUrl, releaseAsset } from '@/lib/media/asset-cache'
import { getProjectRepository } from '@/lib/persistence'
import { applyTemplate } from '@/lib/templates'
import { createMediaClip, createTrack, fillPlaceholder } from '@/lib/timeline/factories'
import {
  addClip,
  addTrack,
  allClips,
  canHostClip,
  closeGaps,
  duplicateClip,
  findClip,
  moveClip as moveClipOp,
  removeClips,
  removeTrack as removeTrackOp,
  rippleDelete,
  setClipDuration as setClipDurationOp,
  setClipSpeed as setClipSpeedOp,
  splitAt,
  trimClip as trimClipOp,
  updateClip as updateClipOp,
  updateTrack as updateTrackOp,
} from '@/lib/timeline/operations'
import { isMediaClip } from '@/lib/types'
import type {
  AIAction,
  AIEditPlan,
  AIMessage,
  AIOperation,
  AISuggestion,
  Asset,
  Clip,
  MediaClip,
  Project,
  ProjectSettings,
  Template,
  TimelineSnapshotForAI,
  Track,
  TrackKind,
} from '@/lib/types'
import { clamp, debounce, deepClone } from '@/lib/utils'
import { emptyHistory, pushHistory, redo as redoHistory, undo as undoHistory, type HistoryState } from './history'
import { spendCredits } from './credits-store'

/**
 * The editor store.
 *
 * One rule holds the whole design together: *every* mutation goes through
 * `commit(label, updater)`. Dragging a clip, typing in the inspector and
 * applying an AI operation all take the same path, so undo, autosave and the
 * dirty flag are correct by construction rather than by discipline.
 */

export type PreviewQuality = 'draft' | 'balanced' | 'full'
export type EditorTool = 'select' | 'razor'

export interface EditorState {
  /* ---- Document ---- */
  project: Project | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  saving: boolean
  savedAt: string | null

  /* ---- Playback ---- */
  playhead: number
  playing: boolean
  volume: number
  muted: boolean
  playbackRate: number
  previewQuality: PreviewQuality
  showGuides: boolean
  loop: boolean

  /* ---- Timeline view ---- */
  zoom: number
  selection: string[]
  tool: EditorTool
  snapEnabled: boolean

  /* ---- History ---- */
  history: HistoryState

  /* ---- AI ---- */
  messages: AIMessage[]
  plans: AIEditPlan[]
  activePlanId: string | null
  aiBusy: boolean
  dismissedSuggestions: string[]

  /* ---- Actions ---- */
  loadProject: (id: string) => Promise<void>
  setProject: (project: Project) => void
  closeProject: () => void
  commit: (label: string, updater: (project: Project) => Project) => void
  undo: () => string | null
  redo: () => string | null

  setPlayhead: (time: number) => void
  scrub: (time: number) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  stepFrames: (frames: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setPlaybackRate: (rate: number) => void
  setPreviewQuality: (quality: PreviewQuality) => void
  toggleGuides: () => void
  toggleLoop: () => void

  setZoom: (zoom: number) => void
  setTool: (tool: EditorTool) => void
  toggleSnap: () => void
  select: (ids: string[]) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void

  addAssets: (assets: Asset[]) => void
  removeAsset: (assetId: string) => void
  updateAsset: (assetId: string, patch: Partial<Asset>) => void

  addAssetToTimeline: (assetId: string, options?: { trackId?: string; start?: number }) => string | null
  fillPlaceholderWithAsset: (clipId: string, assetId: string) => void
  moveClip: (clipId: string, start: number, trackId?: string) => void
  trimClip: (clipId: string, edge: 'start' | 'end', time: number) => void
  splitAtPlayhead: () => void
  deleteSelected: (ripple?: boolean) => void
  duplicateSelected: () => void
  updateClip: (clipId: string, patch: Partial<Clip>) => void
  setClipSpeed: (clipId: string, speed: number) => void
  setClipDuration: (clipId: string, duration: number) => void

  addTrack: (kind: TrackKind) => void
  removeTrack: (trackId: string) => void
  updateTrack: (trackId: string, patch: Partial<Track>) => void
  closeTrackGaps: (trackId: string) => void

  renameProject: (name: string) => void
  updateSettings: (patch: Partial<ProjectSettings>) => void
  applyTemplateToProject: (template: Template) => void

  sendPrompt: (prompt: string) => Promise<void>
  applyOperation: (planId: string, operationId: string) => Promise<void>
  applyPlan: (planId: string) => Promise<void>
  skipOperation: (planId: string, operationId: string) => void
  runAction: (action: AIAction, label: string) => Promise<void>
  dismissSuggestion: (id: string) => void
  suggestions: () => AISuggestion[]
  snapshotForAI: () => TimelineSnapshotForAI
}

const MIN_ZOOM = 4
const MAX_ZOOM = 400

const saveProject = debounce((project: Project) => {
  void getProjectRepository()
    .save(project)
    .then(() => useEditorStore.setState({ saving: false, savedAt: new Date().toISOString() }))
    .catch((error: unknown) => {
      useEditorStore.setState({
        saving: false,
        error: error instanceof Error ? error.message : 'Could not save your project.',
      })
    })
}, 700)

function persist(project: Project) {
  useEditorStore.setState({ saving: true })
  saveProject(project)
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  status: 'idle',
  error: null,
  saving: false,
  savedAt: null,

  playhead: 0,
  playing: false,
  volume: 1,
  muted: false,
  playbackRate: 1,
  previewQuality: 'balanced',
  showGuides: false,
  loop: false,

  zoom: 60,
  selection: [],
  tool: 'select',
  snapEnabled: true,

  history: emptyHistory(),

  messages: [],
  plans: [],
  activePlanId: null,
  aiBusy: false,
  dismissedSuggestions: [],

  /* ------------------------------------------------------------------ */
  /* Document                                                            */
  /* ------------------------------------------------------------------ */

  async loadProject(id) {
    set({ status: 'loading', error: null })
    try {
      const project = await getProjectRepository().get(id)
      if (!project) {
        set({ status: 'error', error: 'That project could not be found. It may have been deleted.' })
        return
      }
      set({
        project,
        status: 'ready',
        playhead: 0,
        playing: false,
        selection: [],
        history: emptyHistory(),
        messages: [
          {
            id: createId('msg'),
            role: 'assistant',
            content: `Opened "${project.name}". Tell me what you want this to feel like, or pick one of the prompts below.`,
            createdAt: new Date().toISOString(),
            status: 'complete',
          },
        ],
        plans: [],
        activePlanId: null,
        dismissedSuggestions: [],
      })
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Could not open this project.',
      })
    }
  },

  setProject(project) {
    set({ project, status: 'ready', error: null })
  },

  closeProject() {
    set({ project: null, status: 'idle', playing: false, selection: [], history: emptyHistory() })
  },

  commit(label, updater) {
    const { project, history } = get()
    if (!project) return
    const next = updater(deepClone(project))
    next.duration = next.timeline.duration
    next.updatedAt = new Date().toISOString()
    set({
      project: next,
      history: pushHistory(history, label, project),
      // Drop selections pointing at clips the edit removed.
      selection: get().selection.filter((id) => findClip(next.timeline, id)),
    })
    persist(next)
  },

  undo() {
    const { project, history } = get()
    if (!project) return null
    const result = undoHistory(history, project)
    if (!result) return null
    set({
      project: result.project,
      history: result.history,
      selection: get().selection.filter((id) => findClip(result.project.timeline, id)),
    })
    persist(result.project)
    return result.label
  },

  redo() {
    const { project, history } = get()
    if (!project) return null
    const result = redoHistory(history, project)
    if (!result) return null
    set({
      project: result.project,
      history: result.history,
      selection: get().selection.filter((id) => findClip(result.project.timeline, id)),
    })
    persist(result.project)
    return result.label
  },

  /* ------------------------------------------------------------------ */
  /* Playback                                                            */
  /* ------------------------------------------------------------------ */

  setPlayhead(time) {
    const duration = get().project?.timeline.duration ?? 0
    set({ playhead: clamp(time, 0, Math.max(0, duration)) })
  },

  scrub(time) {
    const duration = get().project?.timeline.duration ?? 0
    set({ playhead: clamp(time, 0, Math.max(0, duration)), playing: false })
  },

  play() {
    const { project, playhead } = get()
    if (!project || project.timeline.duration <= 0) return
    // Restarting from the end is what a play button should do.
    set({ playing: true, playhead: playhead >= project.timeline.duration - 0.05 ? 0 : playhead })
  },

  pause() {
    set({ playing: false })
  },

  togglePlay() {
    if (get().playing) get().pause()
    else get().play()
  },

  stepFrames(frames) {
    const { project, playhead } = get()
    if (!project) return
    const step = frames / project.settings.fps
    get().setPlayhead(playhead + step)
    set({ playing: false })
  },

  setVolume(volume) {
    set({ volume: clamp(volume, 0, 1), muted: volume === 0 })
  },

  toggleMute() {
    set({ muted: !get().muted })
  },

  setPlaybackRate(rate) {
    set({ playbackRate: clamp(rate, 0.25, 4) })
  },

  setPreviewQuality(previewQuality) {
    set({ previewQuality })
  },

  toggleGuides() {
    set({ showGuides: !get().showGuides })
  },

  toggleLoop() {
    set({ loop: !get().loop })
  },

  /* ------------------------------------------------------------------ */
  /* Timeline view                                                       */
  /* ------------------------------------------------------------------ */

  setZoom(zoom) {
    set({ zoom: clamp(zoom, MIN_ZOOM, MAX_ZOOM) })
  },
  setTool(tool) {
    set({ tool })
  },
  toggleSnap() {
    set({ snapEnabled: !get().snapEnabled })
  },
  select(ids) {
    set({ selection: ids })
  },
  toggleSelect(id) {
    const selection = get().selection
    set({ selection: selection.includes(id) ? selection.filter((s) => s !== id) : [...selection, id] })
  },
  clearSelection() {
    set({ selection: [] })
  },

  /* ------------------------------------------------------------------ */
  /* Assets                                                              */
  /* ------------------------------------------------------------------ */

  addAssets(assets) {
    get().commit(assets.length === 1 ? `Import ${assets[0].name}` : `Import ${assets.length} files`, (project) => ({
      ...project,
      assets: [...project.assets, ...assets],
    }))
  },

  removeAsset(assetId) {
    const project = get().project
    if (!project) return
    const clipIds = allClips(project.timeline)
      .filter((clip) => isMediaClip(clip) && clip.assetId === assetId)
      .map((clip) => clip.id)

    const name = project.assets.find((a) => a.id === assetId)?.name ?? 'asset'
    get().commit(`Remove ${name}`, (draft) => ({
      ...draft,
      assets: draft.assets.filter((a) => a.id !== assetId),
      timeline: clipIds.length ? removeClips(draft.timeline, clipIds) : draft.timeline,
    }))
    releaseAsset(assetId)
  },

  updateAsset(assetId, patch) {
    const project = get().project
    if (!project) return
    // Metadata refreshes (waveform, analysis) are not user edits — no history.
    const next: Project = {
      ...project,
      assets: project.assets.map((a) => (a.id === assetId ? { ...a, ...patch } : a)),
      updatedAt: new Date().toISOString(),
    }
    set({ project: next })
    persist(next)
  },

  /* ------------------------------------------------------------------ */
  /* Clips                                                               */
  /* ------------------------------------------------------------------ */

  addAssetToTimeline(assetId, options = {}) {
    const project = get().project
    if (!project) return null
    const asset = project.assets.find((a) => a.id === assetId)
    if (!asset) return null

    let trackId = options.trackId
    let timeline = project.timeline
    const wantedKind: TrackKind = asset.kind === 'audio' ? 'audio' : 'video'

    if (trackId) {
      const track = timeline.tracks.find((t) => t.id === trackId)
      if (!track || track.kind !== wantedKind) trackId = undefined
    }
    if (!trackId) {
      const existing = timeline.tracks.find((t) => t.kind === wantedKind)
      if (existing) trackId = existing.id
      else {
        const track = createTrack(wantedKind)
        timeline = addTrack(timeline, track)
        trackId = track.id
      }
    }

    const track = timeline.tracks.find((t) => t.id === trackId)
    const start =
      options.start ??
      (track ? track.clips.reduce((end, clip) => Math.max(end, clip.start + clip.duration), 0) : 0)
    const clip = createMediaClip(asset, trackId, start)

    get().commit(`Add ${asset.name}`, (draft) => ({
      ...draft,
      timeline: addClip(trackId === undefined ? draft.timeline : timeline, trackId!, clip),
    }))
    set({ selection: [clip.id] })
    return clip.id
  },

  fillPlaceholderWithAsset(clipId, assetId) {
    const project = get().project
    if (!project) return
    const found = findClip(project.timeline, clipId)
    const asset = project.assets.find((a) => a.id === assetId)
    if (!found || !asset || found.clip.kind !== 'placeholder') return
    if (!canHostClip(found.track.kind, { ...found.clip })) return

    const filled = fillPlaceholder(found.clip, asset)
    filled.duration = found.clip.duration
    if (asset.kind !== 'image') {
      filled.outPoint = Math.min(asset.duration, filled.inPoint + found.clip.duration * filled.speed)
      filled.duration = Math.min(found.clip.duration, (filled.outPoint - filled.inPoint) / filled.speed)
    }
    get().commit(`Fill "${found.clip.label}"`, (draft) => ({
      ...draft,
      timeline: updateClipOp(draft.timeline, clipId, filled),
    }))
  },

  moveClip(clipId, start, trackId) {
    get().commit('Move clip', (project) => ({
      ...project,
      timeline: moveClipOp(project.timeline, clipId, { start, trackId }),
    }))
  },

  trimClip(clipId, edge, time) {
    const project = get().project
    if (!project) return
    const found = findClip(project.timeline, clipId)
    const clip = found?.clip
    const asset = clip && isMediaClip(clip) ? project.assets.find((a) => a.id === clip.assetId) : undefined
    get().commit('Trim clip', (draft) => ({
      ...draft,
      timeline: trimClipOp(draft.timeline, clipId, {
        edge,
        time,
        fps: draft.settings.fps,
        sourceDuration: asset && asset.kind !== 'image' ? asset.duration : undefined,
      }),
    }))
  },

  splitAtPlayhead() {
    const { project, playhead, selection } = get()
    if (!project) return
    const trackIds = selection.length
      ? [...new Set(selection.map((id) => findClip(project.timeline, id)?.track.id).filter(Boolean) as string[])]
      : undefined
    get().commit('Split clip', (draft) => ({
      ...draft,
      timeline: splitAt(draft.timeline, playhead, draft.settings.fps, trackIds),
    }))
  },

  deleteSelected(ripple = false) {
    const selection = get().selection
    if (selection.length === 0) return
    get().commit(selection.length === 1 ? 'Delete clip' : `Delete ${selection.length} clips`, (project) => ({
      ...project,
      timeline: ripple ? rippleDelete(project.timeline, selection) : removeClips(project.timeline, selection),
    }))
    set({ selection: [] })
  },

  duplicateSelected() {
    const { project, selection } = get()
    if (!project || selection.length === 0) return
    const newIds: string[] = []
    get().commit('Duplicate clip', (draft) => {
      let timeline = draft.timeline
      for (const id of selection) {
        const result = duplicateClip(timeline, id)
        timeline = result.timeline
        if (result.newId) newIds.push(result.newId)
      }
      return { ...draft, timeline }
    })
    if (newIds.length) set({ selection: newIds })
  },

  updateClip(clipId, patch) {
    get().commit('Edit clip', (project) => ({
      ...project,
      // The caller narrows to the clip it is editing; the operation only merges.
      timeline: updateClipOp<Clip>(project.timeline, clipId, patch),
    }))
  },

  setClipSpeed(clipId, speed) {
    get().commit('Change speed', (project) => ({
      ...project,
      timeline: setClipSpeedOp(project.timeline, clipId, speed),
    }))
  },

  setClipDuration(clipId, duration) {
    get().commit('Change duration', (project) => ({
      ...project,
      timeline: setClipDurationOp(project.timeline, clipId, duration),
    }))
  },

  /* ------------------------------------------------------------------ */
  /* Tracks                                                              */
  /* ------------------------------------------------------------------ */

  addTrack(kind) {
    const project = get().project
    if (!project) return
    const count = project.timeline.tracks.filter((t) => t.kind === kind).length
    const track = createTrack(kind, `${kindLabel(kind)} ${count + 1}`)
    get().commit(`Add ${kindLabel(kind).toLowerCase()} track`, (draft) => ({
      ...draft,
      timeline: addTrack(draft.timeline, track),
    }))
  },

  removeTrack(trackId) {
    get().commit('Delete track', (project) => ({
      ...project,
      timeline: removeTrackOp(project.timeline, trackId),
    }))
  },

  updateTrack(trackId, patch) {
    get().commit('Edit track', (project) => ({
      ...project,
      timeline: updateTrackOp(project.timeline, trackId, patch),
    }))
  },

  closeTrackGaps(trackId) {
    get().commit('Close gaps', (project) => ({
      ...project,
      timeline: closeGaps(project.timeline, trackId),
    }))
  },

  /* ------------------------------------------------------------------ */
  /* Project                                                             */
  /* ------------------------------------------------------------------ */

  renameProject(name) {
    get().commit('Rename project', (project) => ({ ...project, name }))
  },

  updateSettings(patch) {
    get().commit('Change project settings', (project) => ({
      ...project,
      settings: { ...project.settings, ...patch },
      aspectRatio: patch.aspectRatio ?? project.aspectRatio,
    }))
  },

  applyTemplateToProject(template) {
    get().commit(`Apply "${template.name}"`, (project) => applyTemplate(project, template))
    set({ selection: [], playhead: 0 })
  },

  /* ------------------------------------------------------------------ */
  /* AI                                                                  */
  /* ------------------------------------------------------------------ */

  snapshotForAI() {
    const { project, selection } = get()
    if (!project) {
      return {
        projectName: '',
        duration: 0,
        aspectRatio: '16:9',
        fps: 30,
        selection: [],
        tracks: [],
        assets: [],
      }
    }
    return {
      projectName: project.name,
      duration: Number(project.timeline.duration.toFixed(2)),
      aspectRatio: project.aspectRatio,
      fps: project.settings.fps,
      selection,
      tracks: project.timeline.tracks.map((track) => ({
        id: track.id,
        kind: track.kind,
        name: track.name,
        clips: track.clips.map((clip) => ({
          id: clip.id,
          kind: clip.kind,
          label: clip.label,
          start: Number(clip.start.toFixed(2)),
          duration: Number(clip.duration.toFixed(2)),
          assetKind: clip.kind === 'media' ? clip.assetKind : undefined,
        })),
      })),
      assets: project.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        kind: asset.kind,
        duration: Number(asset.duration.toFixed(2)),
      })),
    }
  },

  async sendPrompt(prompt) {
    const trimmed = prompt.trim()
    if (!trimmed || get().aiBusy) return

    const userMessage: AIMessage = {
      id: createId('msg'),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
      status: 'complete',
    }
    const thinking: AIMessage = {
      id: createId('msg'),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      status: 'streaming',
    }
    set({ messages: [...get().messages, userMessage, thinking], aiBusy: true })

    const provider = getAIProvider()
    const snapshot = get().snapshotForAI()

    try {
      const plan = await provider.generateEditPlan({ prompt: trimmed, snapshot })
      const reply = await provider.chat([...get().messages, userMessage], snapshot)

      set((state) => ({
        aiBusy: false,
        plans: plan.operations.length > 0 ? [plan, ...state.plans] : state.plans,
        activePlanId: plan.operations.length > 0 ? plan.id : state.activePlanId,
        messages: state.messages.map((message) =>
          message.id === thinking.id
            ? {
                ...message,
                content: reply,
                status: 'complete',
                planId: plan.operations.length > 0 ? plan.id : undefined,
              }
            : message,
        ),
      }))
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'The assistant could not respond.'
      set((state) => ({
        aiBusy: false,
        messages: state.messages.map((message) =>
          message.id === thinking.id
            ? { ...message, content: detail, status: 'error' }
            : message,
        ),
      }))
    }
  },

  async applyOperation(planId, operationId) {
    const { project, plans, playhead, selection } = get()
    if (!project) return
    const plan = plans.find((p) => p.id === planId)
    const operation = plan?.operations.find((o) => o.id === operationId)
    if (!plan || !operation || operation.status === 'applied') return

    setOperationStatus(set, planId, operationId, { status: 'applying', error: undefined })

    try {
      const result = await executeOperation(project, operation, {
        provider: getAIProvider(),
        playhead,
        selection,
        waveformFor: (asset) => resolveWaveform(asset),
        frameDifferencesFor: (asset) => resolveFrameDifferences(asset),
      })

      // Route through commit so the AI edit joins the same undo stack.
      get().commit(`AI · ${operation.title}`, () => result.project)
      spendCredits(operation.credits, operation.capability, operation.title, project.id)
      setOperationStatus(set, planId, operationId, {
        status: 'applied',
        preview: result.notes.join(' ') || operation.preview,
      })
      syncPlanStatus(set, planId)
    } catch (error) {
      const message =
        error instanceof CapabilityUnavailableError
          ? `${error.message}${error.requirement ? ` (${error.requirement})` : ''}`
          : error instanceof ActionNotApplicableError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'This operation could not be applied.'
      setOperationStatus(set, planId, operationId, { status: 'failed', error: message })
      syncPlanStatus(set, planId)
    }
  },

  async applyPlan(planId) {
    const plan = get().plans.find((p) => p.id === planId)
    if (!plan) return
    set((state) => ({
      plans: state.plans.map((p) => (p.id === planId ? { ...p, status: 'applying' } : p)),
    }))
    for (const operation of plan.operations) {
      if (operation.status === 'applied' || operation.status === 'skipped') continue
      // eslint-disable-next-line no-await-in-loop -- operations are order-dependent
      await get().applyOperation(planId, operation.id)
    }
    syncPlanStatus(set, planId)
  },

  skipOperation(planId, operationId) {
    setOperationStatus(set, planId, operationId, { status: 'skipped' })
    syncPlanStatus(set, planId)
  },

  async runAction(action, label) {
    const { project, playhead, selection } = get()
    if (!project) return
    const result = await executeAction(project, action, {
      provider: getAIProvider(),
      playhead,
      selection,
      waveformFor: (asset) => resolveWaveform(asset),
      frameDifferencesFor: (asset) => resolveFrameDifferences(asset),
    })
    get().commit(label, () => result.project)
  },

  dismissSuggestion(id) {
    set({ dismissedSuggestions: [...get().dismissedSuggestions, id] })
  },

  suggestions() {
    const { project, selection, dismissedSuggestions } = get()
    if (!project) return []
    return computeSuggestions(project, selection).filter((s) => !dismissedSuggestions.includes(s.id))
  },
}))

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type SetState = (partial: Partial<EditorState> | ((state: EditorState) => Partial<EditorState>)) => void

function setOperationStatus(set: SetState, planId: string, operationId: string, patch: Partial<AIOperation>) {
  set((state) => ({
    plans: state.plans.map((plan) =>
      plan.id === planId
        ? {
            ...plan,
            operations: plan.operations.map((op) => (op.id === operationId ? { ...op, ...patch } : op)),
          }
        : plan,
    ),
  }))
}

function syncPlanStatus(set: SetState, planId: string) {
  set((state) => ({
    plans: state.plans.map((plan) => {
      if (plan.id !== planId) return plan
      const statuses = plan.operations.map((op) => op.status)
      const applied = statuses.filter((s) => s === 'applied').length
      const failed = statuses.filter((s) => s === 'failed').length
      const settled = statuses.every((s) => s === 'applied' || s === 'failed' || s === 'skipped')
      let status: AIEditPlan['status'] = plan.status
      if (!settled) status = statuses.includes('applying') ? 'applying' : 'draft'
      else if (failed === statuses.length) status = 'failed'
      else if (applied === statuses.length) status = 'applied'
      else status = 'partial'
      return { ...plan, status }
    }),
  }))
}

/** Computes and caches a waveform on the project's asset record. */
async function resolveWaveform(asset: Asset): Promise<number[] | undefined> {
  if (asset.waveform?.length) return asset.waveform
  const waveform = await ensureWaveform(asset)
  if (waveform) useEditorStore.getState().updateAsset(asset.id, { waveform })
  return waveform
}

const frameDifferenceCache = new Map<string, number[]>()

async function resolveFrameDifferences(asset: Asset): Promise<number[] | undefined> {
  if (asset.kind !== 'video') return undefined
  const cached = frameDifferenceCache.get(asset.id)
  if (cached) return cached
  try {
    const url = await resolveAssetUrl(asset)
    const differences = await sampleFrameDifferences(url, asset.duration)
    frameDifferenceCache.set(asset.id, differences)
    return differences
  } catch {
    return undefined
  }
}

const kindLabel = (kind: TrackKind) =>
  kind === 'video' ? 'Video' : kind === 'audio' ? 'Audio' : kind === 'text' ? 'Text' : 'Caption'

/* ------------------------------------------------------------------ */
/* Selectors — keep component re-renders narrow                        */
/* ------------------------------------------------------------------ */

export const useProject = () => useEditorStore((s) => s.project)
export const usePlayhead = () => useEditorStore((s) => s.playhead)
export const useSelection = () => useEditorStore((s) => s.selection)
export const useIsPlaying = () => useEditorStore((s) => s.playing)

export function useSelectedClip(): { clip: Clip; track: Track } | null {
  const project = useEditorStore((s) => s.project)
  const selection = useEditorStore((s) => s.selection)
  if (!project || selection.length !== 1) return null
  const found = findClip(project.timeline, selection[0])
  return found ? { clip: found.clip, track: found.track } : null
}

export const useSelectedMediaClip = (): MediaClip | null => {
  const selected = useSelectedClip()
  return selected?.clip.kind === 'media' ? selected.clip : null
}
