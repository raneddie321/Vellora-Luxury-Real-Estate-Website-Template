'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initAIProvider } from '@/lib/ai/registry'
import { useCreditsStore } from '@/lib/store/credits-store'
import { useUIStore } from '@/lib/store/ui-store'

/**
 * Client-side bootstrap: restore preferences, load the credit ledger and ask
 * the server which AI provider is actually configured. All three are
 * non-blocking — the app is fully usable before any of them resolve.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useUIStore((s) => s.hydrate)
  const loadCredits = useCreditsStore((s) => s.load)

  useEffect(() => {
    hydrate()
    void loadCredits()
    void initAIProvider()
  }, [hydrate, loadCredits])

  return (
    <TooltipProvider delayDuration={280} skipDelayDuration={200}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              'group border border-border bg-surface-2 text-foreground shadow-float rounded-md text-sm',
            description: 'text-muted-foreground text-xs',
            actionButton: 'bg-primary text-primary-foreground text-xs rounded px-2 py-1',
            cancelButton: 'bg-surface-3 text-muted-foreground text-xs rounded px-2 py-1',
          },
        }}
      />
    </TooltipProvider>
  )
}
