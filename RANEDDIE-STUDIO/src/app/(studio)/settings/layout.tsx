import { PageHeader } from '@/components/studio/studio-shell'
import { SettingsNav } from '@/components/studio/settings-nav'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Preferences are stored per device. Nothing here leaves your browser."
      />
      <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[190px_minmax(0,1fr)]">
        <SettingsNav />
        <div className="max-w-[760px] space-y-4">{children}</div>
      </div>
    </>
  )
}
