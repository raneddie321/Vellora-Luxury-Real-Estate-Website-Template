import type { Metadata } from 'next'
import { Info, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SettingRow, SettingsSection } from '@/components/studio/settings-nav'
import { LOCAL_USER } from '@/lib/auth'

export const metadata: Metadata = { title: 'Account settings' }

export default function AccountSettingsPage() {
  return (
    <>
      <SettingsSection
        title="Account"
        description="This build is single-user and offline. No sign-in, no server-side profile."
      >
        <div className="flex items-center gap-3 rounded-md border border-border bg-surface-2 p-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-surface-3 text-muted-foreground">
            <UserRound className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{LOCAL_USER.name}</p>
            <p className="mt-0.5 text-2xs text-muted-foreground">
              Local session · no account required
            </p>
          </div>
          <Badge variant="outline">Free plan</Badge>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-md border border-border bg-surface-2 px-3 py-2.5">
          <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-2xs leading-relaxed text-muted-foreground">
            Authentication is deliberately not implemented. The contract a real provider would satisfy
            lives in <code className="rounded bg-surface-3 px-1 py-0.5 font-mono">src/lib/auth/index.ts</code>{' '}
            — implement <code className="rounded bg-surface-3 px-1 py-0.5 font-mono">AuthProvider</code> and
            swap it in with <code className="rounded bg-surface-3 px-1 py-0.5 font-mono">setAuthProvider()</code>.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Privacy" description="What actually happens to your media.">
        <div className="space-y-1">
          <SettingRow
            label="Media storage"
            hint="Video, audio and images are written to IndexedDB in this browser and are never uploaded."
            control={
              <span className="inline-flex items-center gap-1.5 text-2xs text-success">
                <ShieldCheck className="size-3.5" aria-hidden="true" /> Local only
              </span>
            }
          />
          <SettingRow
            label="AI requests"
            hint="With no provider configured, nothing leaves the device. With one configured, only a compact timeline summary and your instruction are sent — never the media itself."
            control={<Badge variant="outline">Summary only</Badge>}
          />
          <SettingRow
            label="Analytics"
            hint="No analytics, telemetry or third-party scripts are loaded by this application."
            control={<Badge variant="success">None</Badge>}
          />
        </div>
      </SettingsSection>
    </>
  )
}
