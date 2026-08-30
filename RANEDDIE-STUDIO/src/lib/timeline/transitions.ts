import type { TransitionType } from '@/lib/types'

export interface TransitionDefinition {
  type: TransitionType
  name: string
  description: string
  /** Whether the transition needs a duration control. */
  timed: boolean
  defaultDuration: number
  directions?: ('left' | 'right' | 'up' | 'down')[]
}

export const TRANSITIONS: TransitionDefinition[] = [
  {
    type: 'cut',
    name: 'Cut',
    description: 'A hard change with no blend. The default between clips.',
    timed: false,
    defaultDuration: 0,
  },
  {
    type: 'fade',
    name: 'Fade',
    description: 'Fades through the project background colour.',
    timed: true,
    defaultDuration: 0.5,
  },
  {
    type: 'dissolve',
    name: 'Dissolve',
    description: 'Cross-blends the outgoing and incoming clips.',
    timed: true,
    defaultDuration: 0.6,
  },
  {
    type: 'slide',
    name: 'Slide',
    description: 'Pushes the incoming clip in from one edge.',
    timed: true,
    defaultDuration: 0.45,
    directions: ['left', 'right', 'up', 'down'],
  },
  {
    type: 'zoom',
    name: 'Zoom',
    description: 'Scales the incoming clip up as it fades in.',
    timed: true,
    defaultDuration: 0.5,
  },
]

export const getTransition = (type: TransitionType) =>
  TRANSITIONS.find((t) => t.type === type) ?? TRANSITIONS[0]

/**
 * Geometric offset/scale a transition contributes at progress `t` (0→1).
 * Opacity is handled separately by `clipOpacityAt` so fades compose correctly.
 */
export function transitionGeometry(
  type: TransitionType,
  progress: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
): { offsetX: number; offsetY: number; scale: number } {
  const eased = 1 - (1 - progress) ** 3
  switch (type) {
    case 'slide': {
      const distance = (1 - eased) * 1
      switch (direction) {
        case 'left':
          return { offsetX: distance, offsetY: 0, scale: 1 }
        case 'right':
          return { offsetX: -distance, offsetY: 0, scale: 1 }
        case 'up':
          return { offsetX: 0, offsetY: distance, scale: 1 }
        default:
          return { offsetX: 0, offsetY: -distance, scale: 1 }
      }
    }
    case 'zoom':
      return { offsetX: 0, offsetY: 0, scale: 1 + (1 - eased) * 0.18 }
    default:
      return { offsetX: 0, offsetY: 0, scale: 1 }
  }
}
