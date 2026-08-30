import type { CapabilityStatus } from '@/lib/types'
import { MockAIProvider } from './mock-provider'
import { RemoteAIProvider } from './remote-provider'
import type { AIProvider } from './provider'

/**
 * Provider registry.
 *
 * The app boots on `MockAIProvider` so it is usable before any network call
 * resolves. `initAIProvider()` then asks the server what is configured and
 * upgrades in place. Everything downstream reads `getAIProvider()` and never
 * cares which one is active.
 */

export interface AIStatusResponse {
  provider: string
  model: string | null
  configured: boolean
  capabilities: CapabilityStatus[]
}

let current: AIProvider = new MockAIProvider()
let initPromise: Promise<AIProvider> | null = null
const listeners = new Set<(provider: AIProvider) => void>()

export const getAIProvider = (): AIProvider => current

export function onProviderChange(listener: (provider: AIProvider) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setProvider(provider: AIProvider) {
  current = provider
  listeners.forEach((listener) => listener(provider))
}

export function initAIProvider(): Promise<AIProvider> {
  if (initPromise) return initPromise
  initPromise = (async () => {
    if (typeof window === 'undefined') return current
    try {
      const response = await fetch('/api/ai/status', { cache: 'no-store' })
      if (!response.ok) return current
      const status = (await response.json()) as AIStatusResponse
      if (status.configured) {
        setProvider(new RemoteAIProvider(status.provider, status.model, status.capabilities))
      } else if (status.capabilities?.length) {
        // Still adopt the server's capability report so "Requires API" badges
        // reflect keys that exist for generation but not for planning.
        setProvider(new ServerInformedMockProvider(status.capabilities))
      }
    } catch {
      // Offline or route unavailable — the local provider is already correct.
    }
    return current
  })()
  return initPromise
}

/** MockAIProvider with the server's capability report layered on top. */
class ServerInformedMockProvider extends MockAIProvider {
  constructor(private readonly reported: CapabilityStatus[]) {
    super()
  }
  override capabilities(): CapabilityStatus[] {
    const local = super.capabilities()
    return local.map((entry) => this.reported.find((r) => r.capability === entry.capability) ?? entry)
  }
}

export { MockAIProvider, RemoteAIProvider }
