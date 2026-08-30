import type { AISuggestion, Project } from '@/lib/types'
import { findClip } from '@/lib/timeline/operations'

/**
 * Contextual suggestions.
 *
 * These are derived from the actual project state, not a fixed list, so the
 * assistant feels like it is watching the edit: select a graded-free clip and it
 * offers a grade; leave the timeline silent and it offers music.
 */
export function computeSuggestions(project: Project, selection: string[]): AISuggestion[] {
  const suggestions: AISuggestion[] = []
  const tracks = project.timeline.tracks
  const videoClips = tracks.filter((t) => t.kind === 'video').flatMap((t) => t.clips)
  const audioClips = tracks.filter((t) => t.kind === 'audio').flatMap((t) => t.clips)
  const captionClips = tracks.filter((t) => t.kind === 'caption').flatMap((t) => t.clips)
  const textClips = tracks.filter((t) => t.kind === 'text').flatMap((t) => t.clips)

  const selected = selection.length === 1 ? findClip(project.timeline, selection[0])?.clip : null

  if (selected?.kind === 'media' && selected.assetKind === 'video' && selected.effects.length === 0) {
    suggestions.push({
      id: 'grade-selected',
      title: 'Want to make this shot more cinematic?',
      detail: 'It has no grade yet. I can add contrast, a cool grade and a soft vignette.',
      prompt: 'Make this clip cinematic.',
      capability: 'command-parse',
    })
  }

  if (selected?.kind === 'media' && selected.duration > 12) {
    suggestions.push({
      id: 'tighten-selected',
      title: 'This shot runs long',
      detail: `${selected.duration.toFixed(1)}s on screen. I can find and cut the dead air.`,
      prompt: 'Remove the silence.',
      capability: 'silence-detection',
    })
  }

  if (videoClips.length > 0 && captionClips.length === 0) {
    suggestions.push({
      id: 'captions',
      title: 'Add captions',
      detail: 'Most feeds autoplay muted. I can lay timed caption clips from the audio.',
      prompt: 'Add subtitles.',
      capability: 'caption',
    })
  }

  if (videoClips.length > 0 && audioClips.length === 0) {
    suggestions.push({
      id: 'music',
      title: 'The timeline has no audio',
      detail: 'A music bed would carry the pacing. Needs a music provider.',
      prompt: 'Add background music.',
      capability: 'music-generation',
    })
  }

  if (project.aspectRatio === '16:9' && project.duration > 0 && project.duration <= 90) {
    suggestions.push({
      id: 'vertical',
      title: 'Cut a vertical version',
      detail: 'Reframe to 9:16 and trim to 30 seconds for social.',
      prompt: 'Turn this into a 30 second social video.',
      capability: 'aspect-convert',
    })
  }

  if (videoClips.length >= 3 && textClips.length === 0) {
    suggestions.push({
      id: 'intro',
      title: 'Open with a title',
      detail: 'A three-second title card gives the sequence a beginning.',
      prompt: 'Create a dramatic intro.',
      capability: 'command-parse',
    })
  }

  if (project.assets.some((a) => !a.analysis)) {
    suggestions.push({
      id: 'analyze',
      title: 'Analyse your footage',
      detail: 'I can find shot changes and silences so edits land on real boundaries.',
      prompt: 'Find the best moments.',
      capability: 'analyze-media',
    })
  }

  return suggestions.slice(0, 4)
}
