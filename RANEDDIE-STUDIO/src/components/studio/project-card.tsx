'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Film, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useProjectsStore } from '@/lib/store/projects-store'
import type { ProjectSummary } from '@/lib/types'
import { cn, formatDuration, formatRelativeTime, hashString, pluralize } from '@/lib/utils'

const GRADIENTS = [
  'from-[#FF6B35]/30 to-[#7C1D0B]/40',
  'from-[#7C6BFF]/30 to-[#211A63]/40',
  'from-[#00E5B0]/25 to-[#04473A]/40',
  'from-[#FF3D77]/25 to-[#4A0B29]/40',
  'from-[#3D5AFE]/25 to-[#0B1445]/40',
  'from-[#F5A623]/25 to-[#2B1400]/40',
]

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const router = useRouter()
  const remove = useProjectsStore((s) => s.remove)
  const duplicate = useProjectsStore((s) => s.duplicate)
  const rename = useProjectsStore((s) => s.rename)
  const busyId = useProjectsStore((s) => s.busyId)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [draftName, setDraftName] = useState(project.name)

  const busy = busyId === project.id
  const gradient = GRADIENTS[hashString(project.id) % GRADIENTS.length]

  return (
    <>
      <article
        className={cn(
          'group relative overflow-hidden rounded-lg border border-border bg-surface-1 transition-colors hover:border-muted-foreground/25',
          busy && 'pointer-events-none opacity-60',
        )}
      >
        <Link
          href={`/editor/${project.id}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="relative aspect-video overflow-hidden bg-surface-2">
            {project.thumbnailDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL from IndexedDB, not a remote asset
              <img
                src={project.thumbnailDataUrl}
                alt=""
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className={cn('flex size-full items-center justify-center bg-gradient-to-br', gradient)}>
                <Film className="size-6 text-white/40" aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-2.5">
              <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white tabular">
                {formatDuration(project.duration)}
              </span>
              <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                {project.aspectRatio}
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-start gap-2 p-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/editor/${project.id}`}
                className="truncate text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {project.name}
              </Link>
              {project.isDemo && <Badge variant="ai">Demo</Badge>}
            </div>
            <p className="mt-1 truncate text-2xs text-muted-foreground">
              {formatRelativeTime(project.updatedAt)} · {pluralize(project.clipCount, 'clip')} ·{' '}
              {pluralize(project.assetCount, 'asset')}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${project.name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => router.push(`/editor/${project.id}`)}>
                <Film /> Open
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setDraftName(project.name)
                  setRenameOpen(true)
                }}
              >
                <Pencil /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={async () => {
                  const id = await duplicate(project.id)
                  if (id) toast.success('Project duplicated')
                }}
              >
                <Copy /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </article>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              await rename(project.id, draftName.trim() || project.name)
              setRenameOpen(false)
            }}
            className="space-y-4"
          >
            <Input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              autoFocus
              maxLength={80}
              aria-label="Project name"
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{project.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              The project and any media only it uses will be removed from this browser. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setConfirmOpen(false)
                await remove(project.id)
                toast.success('Project deleted')
              }}
            >
              <Trash2 /> Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
