'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AudioLines, HardDrive, Image as ImageIcon, Images, Search, Video } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/studio/studio-shell'
import { getBlobStore, getProjectRepository } from '@/lib/persistence'
import type { Asset, AssetKind } from '@/lib/types'
import { formatBytes, formatDuration, formatRelativeTime } from '@/lib/utils'

interface AssetRow {
  asset: Asset
  projectId: string
  projectName: string
}

const KIND_ICON: Record<AssetKind, React.ElementType> = {
  video: Video,
  audio: AudioLines,
  image: ImageIcon,
}

export function AssetsView() {
  const [rows, setRows] = useState<AssetRow[]>([])
  const [usage, setUsage] = useState<{ bytes: number; count: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<'all' | AssetKind>('all')
  // Bumping this re-runs the loader without duplicating its state writes.
  const [reloadToken, setReloadToken] = useState(0)

  const reload = () => {
    setLoading(true)
    setReloadToken((token) => token + 1)
  }

  useEffect(() => {
    let cancelled = false
    readLibrary().then(
      (data) => {
        if (cancelled) return
        setRows(data.rows)
        setUsage(data.usage)
        setError(null)
        setLoading(false)
      },
      (caught: unknown) => {
        if (cancelled) return
        setError(caught instanceof Error ? caught.message : 'Could not read your media library.')
        setLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (kind !== 'all' && row.asset.kind !== kind) return false
      if (!needle) return true
      return (
        row.asset.name.toLowerCase().includes(needle) || row.projectName.toLowerCase().includes(needle)
      )
    })
  }, [rows, query, kind])

  return (
    <>
      <PageHeader
        title="Assets"
        description="Every file imported into any project on this device. Media is stored in IndexedDB and never uploaded."
        actions={
          usage ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-2">
              <HardDrive className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs">
                <span className="font-semibold tabular">{formatBytes(usage.bytes)}</span>{' '}
                <span className="text-muted-foreground">across {usage.count} files</span>
              </span>
            </div>
          ) : null
        }
      />

      <div className="px-5 py-6 sm:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assets or projects"
              className="pl-8"
              aria-label="Search assets"
            />
          </div>
          <Segmented
            aria-label="Filter by media type"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'all', label: 'All' },
              { value: 'video', label: 'Video' },
              { value: 'audio', label: 'Audio' },
              { value: 'image', label: 'Images' },
            ]}
          />
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/[0.07] px-4 py-3 text-xs">
            {error}{' '}
            <button onClick={reload} className="font-medium text-destructive underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-1">
            <EmptyState
              icon={Images}
              title={rows.length === 0 ? 'No media imported yet' : 'Nothing matches those filters'}
              description={
                rows.length === 0
                  ? 'Media is imported inside a project. Open a project and drop files onto the Media panel.'
                  : 'Try a different search term or media type.'
              }
              action={
                rows.length === 0 ? (
                  <Button asChild>
                    <Link href="/projects">Go to projects</Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('')
                      setKind('all')
                    }}
                  >
                    Reset filters
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface-1">
            {visible.map(({ asset, projectId, projectName }) => {
              const Icon = KIND_ICON[asset.kind]
              return (
                <li key={`${projectId}-${asset.id}`} className="flex items-center gap-3 p-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded border border-border bg-surface-2">
                    {asset.thumbnailDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local data URL
                      <img src={asset.thumbnailDataUrl} alt="" className="size-full object-cover" loading="lazy" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-muted-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-medium">{asset.name}</p>
                      {asset.demo && <Badge variant="ai">Demo</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-2xs text-muted-foreground">
                      {asset.kind} · {formatBytes(asset.size)}
                      {asset.duration > 0 && ` · ${formatDuration(asset.duration)}`}
                      {asset.width && asset.height && ` · ${asset.width}×${asset.height}`}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <Link
                      href={`/editor/${projectId}`}
                      className="truncate text-2xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {projectName}
                    </Link>
                    <p className="mt-0.5 text-2xs text-muted-foreground/70">
                      {formatRelativeTime(asset.createdAt)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}

/**
 * Reads every project's asset list plus the blob store's usage.
 * Pure data access — no React state — so the effect above only has to decide
 * what to do with the result.
 */
async function readLibrary(): Promise<{
  rows: AssetRow[]
  usage: { bytes: number; count: number }
}> {
  const repository = getProjectRepository()
  const summaries = await repository.list()
  const projects = await Promise.all(summaries.map((summary) => repository.get(summary.id)))

  const rows: AssetRow[] = []
  for (const project of projects) {
    if (!project) continue
    for (const asset of project.assets) {
      rows.push({ asset, projectId: project.id, projectName: project.name })
    }
  }

  const usage = await getBlobStore()
    .usage()
    .catch(() => ({ bytes: 0, count: 0 }))
  return { rows, usage }
}
