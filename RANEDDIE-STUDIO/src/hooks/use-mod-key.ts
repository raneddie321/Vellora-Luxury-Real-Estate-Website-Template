'use client'

import { useSyncExternalStore } from 'react'
import { isMac } from '@/lib/utils'

// The platform never changes during a session, so there is nothing to subscribe to.
const subscribe = () => () => undefined
const getSnapshot = () => (isMac() ? '⌘' : 'Ctrl')
// The server cannot know the platform; render the neutral value and let the
// client swap it during hydration without a setState-in-effect.
const getServerSnapshot = () => 'Ctrl'

/** Returns `⌘` on Apple platforms and `Ctrl` everywhere else. */
export function useModKey(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
