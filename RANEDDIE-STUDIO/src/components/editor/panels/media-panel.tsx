'use client'

import { useCallback, useRef, useState } from 'react'
import { AudioLines, Image as ImageIcon, Loader2, Plus, Trash2, Upload, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Hint } from '@/components/ui/tooltip'
import { ACCEPT_ATTRIBUTE } from '@/lib/media/constants'
import { importMedia } from '@/lib/media/import'
import { useEditorStore } from '@/lib/store/editor-store'
import type { Asset, AssetKind } from '@/lib/types'
import { cn, formatBytes, formatDuration } from '@/lib/utils'

interface UploadState {
  id: string
  name: string
  progress: number
  error?: string
}

const KIND_ICON: Record<AssetKind, React.ElementType> = {
  video: Video,
  audio: AudioLines,
  image: ImageIcon,
}

export function MediaPanel() {
  const project = useEditorStore((s) => s.project)
  const addAssets = useEditorStore((s) => s.addAssets)
  const removeAsset = useEditorStore((s) => s.removeAsset)
  const addAssetToTimeline = useEditorStore((s) => s.addAssetToTimeline)

  const inputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<UploadState[]>([])
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files)
      if (list.length === 0) return

      const pending: UploadState[] = list.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        progress: 0,
      }))
      setUploads((current) => [...current, ...pending])

      const imported: Asset[] = []
      for (let i = 0; i < list.length; i++) {
        const file = list[i]
        const upload = pending[i]
        try {
          /* eslint-disable no-await-in-loop -- decoders are shared, keep imports serial */
          const asset = await importMedia(file, {
            onProgress: ({ progress }) =>
              setUploads((current) =>
                current.map((item) => (item.id === upload.id ? { ...item, progress } : item)),
              ),
          })
          /* eslint-enable no-await-in-loop */
          imported.push(asset)
          setUploads((current) => current.filter((item) => item.id !== upload.id))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'This file could not be imported.'
          setUploads((current) =>
            current.map((item) => (item.id === upload.id ? { ...item, error: message } : item)),
          )
          toast.error(`Could not import "${file.name}"`, { description: message })
        }
      }

      if (imported.length > 0) {
        addAssets(imported)
        toast.success(
          imported.length === 1 ? `Imported ${imported[0].name}` : `Imported ${imported.length} files`,
        )
      }
    },
    [addAssets],
  )

  const assets = project?.assets ?? []

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-2.5">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            if (event.dataTransfer.files.length) void handleFiles(event.dataTransfer.files)
          }}
          className={cn(
            'rounded-md border border-dashed p-4 text-center transition-colors',
            dragOver ? 'border-primary bg-primary/[0.08]' : 'border-border bg-surface-2',
          )}
        >
          <Upload className="mx-auto size-4 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-xs font-medium">Drop media here</p>
          <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">
            MP4, MOV, WEBM, MP3, WAV, PNG, JPG, WEBP · up to 512 MB
          </p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => inputRef.current?.click()}>
            <Plus /> Choose files
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTRIBUTE}
            className="sr-only"
            aria-label="Import media files"
            onChange={(event) => {
              if (event.target.files) void handleFiles(event.target.files)
              event.target.value = ''
            }}
          />
        </div>
      </div>

      {uploads.length > 0 && (
        <ul className="shrink-0 space-y-1.5 px-2.5 pb-2.5">
          {uploads.map((upload) => (
            <li key={upload.id} className="rounded-md border border-border bg-surface-2 p-2">
              <div className="flex items-center gap-2">
                {upload.error ? null : <Loader2 className="size-3 shrink-0 animate-spin text-primary" />}
                <p className="min-w-0 flex-1 truncate text-2xs">{upload.name}</p>
                <span className="shrink-0 font-mono text-2xs tabular text-muted-foreground">
                  {Math.round(upload.progress * 100)}%
                </span>
              </div>
              {upload.error ? (
                <p className="mt-1 text-2xs text-destructive">{upload.error}</p>
              ) : (
                <Progress value={upload.progress * 100} className="mt-1.5" />
              )}
            </li>
          ))}
        </ul>
      )}

      <ScrollArea className="min-h-0 flex-1">
        {assets.length === 0 ? (
          <EmptyState
            compact
            icon={Video}
            title="No media yet"
            description="Import files above, or generate the demo project from the dashboard to get real footage instantly."
          />
        ) : (
          <ul className="space-y-1 p-2.5 pt-0">
            {assets.map((asset) => {
              const Icon = KIND_ICON[asset.kind]
              return (
                <li key={asset.id}>
                  <div
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('application/x-editime-asset', asset.id)
                      event.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="group flex cursor-grab items-center gap-2 rounded-md border border-transparent p-1.5 transition-colors hover:border-border hover:bg-surface-2 active:cursor-grabbing"
                  >
                    <div className="relative size-9 shrink-0 overflow-hidden rounded border border-border bg-surface-3">
                      {asset.thumbnailDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- local data URL
                        <img src={asset.thumbnailDataUrl} alt="" className="size-full object-cover" loading="lazy" />
                      ) : (
                        <span className="flex size-full items-center justify-center text-muted-foreground">
                          <Icon className="size-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-2xs font-medium">{asset.name}</p>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {asset.duration > 0 ? `${formatDuration(asset.duration)} · ` : ''}
                        {formatBytes(asset.size)}
                      </p>
                    </div>

                    <div className="flex shrink-0 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      <Hint label="Add to timeline">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => addAssetToTimeline(asset.id)}
                          aria-label={`Add ${asset.name} to the timeline`}
                        >
                          <Plus />
                        </Button>
                      </Hint>
                      <Hint label="Remove from project">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeAsset(asset.id)}
                          aria-label={`Remove ${asset.name}`}
                          className="hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </Hint>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </ScrollArea>

      {assets.length > 0 && (
        <p className="shrink-0 border-t border-border px-2.5 py-2 text-[10px] leading-relaxed text-muted-foreground">
          Drag an asset onto a track, or onto a template slot to fill it.
        </p>
      )}
    </div>
  )
}
