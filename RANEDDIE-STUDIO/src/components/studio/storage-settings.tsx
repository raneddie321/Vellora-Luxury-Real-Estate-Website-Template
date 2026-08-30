'use client'

import { useEffect, useState } from 'react'
import { HardDrive, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { SettingRow, SettingsSection } from '@/components/studio/settings-nav'
import { getBlobStore, getProjectRepository } from '@/lib/persistence'
import { forgetDemoProject } from '@/lib/demo'
import { releaseAll } from '@/lib/media/asset-cache'
import { useProjectsStore } from '@/lib/store/projects-store'
import { formatBytes } from '@/lib/utils'

export function StorageSettings() {
  const refresh = useProjectsStore((s) => s.refresh)
  const [usage, setUsage] = useState<{ bytes: number; count: number } | null>(null)
  const [quota, setQuota] = useState<{ usage: number; quota: number } | null>(null)
  const [projectCount, setProjectCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  // Bumping this re-runs the measurement without duplicating its state writes.
  const [reloadToken, setReloadToken] = useState(0)

  const reload = () => {
    setLoading(true)
    setReloadToken((token) => token + 1)
  }

  useEffect(() => {
    let cancelled = false
    readStorage().then((data) => {
      if (cancelled) return
      setUsage(data.usage)
      setProjectCount(data.projectCount)
      setQuota(data.quota)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  async function clearEverything() {
    setClearing(true)
    try {
      const summaries = await getProjectRepository().list()
      for (const summary of summaries) {
        // eslint-disable-next-line no-await-in-loop -- deletes must be sequential to reconcile blob use
        await getProjectRepository().delete(summary.id)
      }
      await getBlobStore().clear()
      releaseAll()
      forgetDemoProject()
      await refresh()
      reload()
      toast.success('Local studio data cleared')
    } catch (error) {
      toast.error('Could not clear everything', {
        description: error instanceof Error ? error.message : 'Some data may remain.',
      })
    } finally {
      setClearing(false)
      setConfirmOpen(false)
    }
  }

  const percent = quota && quota.quota > 0 ? Math.min(100, (quota.usage / quota.quota) * 100) : null

  return (
    <>
      <SettingsSection
        title="Local storage"
        description="Projects live in localStorage; media blobs live in IndexedDB. Both are scoped to this browser profile."
      >
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Measuring…
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-surface-2 p-3">
              <div className="flex items-center gap-2">
                <HardDrive className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <p className="text-xs font-medium">Media library</p>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight tabular">
                {formatBytes(usage?.bytes ?? 0)}
              </p>
              <p className="mt-1 text-2xs text-muted-foreground">
                {usage?.count ?? 0} files across {projectCount} project{projectCount === 1 ? '' : 's'}
              </p>

              {percent !== null && quota && (
                <div className="mt-3 space-y-1.5">
                  <Progress value={percent} />
                  <p className="text-2xs text-muted-foreground">
                    {formatBytes(quota.usage)} of about {formatBytes(quota.quota)} available to this origin
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <SettingRow
                label="Refresh usage"
                hint="Recomputes from the actual stored blobs rather than a cached figure."
                control={
                  <Button variant="outline" size="sm" onClick={reload}>
                    <RefreshCw /> Refresh
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Danger zone"
        description="These actions are immediate and cannot be undone."
      >
        <SettingRow
          label="Delete all projects and media"
          hint="Removes every project, every imported file and the generated demo assets from this browser."
          control={
            <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 /> Clear everything
            </Button>
          }
        />
      </SettingsSection>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear all local studio data?</DialogTitle>
            <DialogDescription>
              {projectCount} project{projectCount === 1 ? '' : 's'} and {formatBytes(usage?.bytes ?? 0)} of media
              will be deleted from this browser. There is no recovery.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={clearing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void clearEverything()} disabled={clearing}>
              {clearing ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Measures what the studio is actually holding on this device.
 * Pure data access, kept out of the component so no state is written
 * synchronously from the effect that starts it.
 */
async function readStorage(): Promise<{
  usage: { bytes: number; count: number }
  projectCount: number
  quota: { usage: number; quota: number } | null
}> {
  const [usage, projects] = await Promise.all([
    getBlobStore()
      .usage()
      .catch(() => ({ bytes: 0, count: 0 })),
    getProjectRepository()
      .list()
      .catch(() => []),
  ])

  let quota: { usage: number; quota: number } | null = null
  if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate().catch(() => null)
    if (estimate?.usage != null && estimate.quota != null) {
      quota = { usage: estimate.usage, quota: estimate.quota }
    }
  }

  return { usage, projectCount: projects.length, quota }
}
