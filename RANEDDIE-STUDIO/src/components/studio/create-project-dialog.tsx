'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Segmented } from '@/components/ui/segmented'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjectsStore } from '@/lib/store/projects-store'
import { TEMPLATES } from '@/lib/templates'
import type { AspectRatio, Fps, ResolutionPreset } from '@/lib/types'

const ASPECTS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:5', label: '4:5' },
]

export function CreateProjectDialog({
  open,
  onOpenChange,
  trigger,
  defaultTemplateId,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  defaultTemplateId?: string
}) {
  const router = useRouter()
  const create = useProjectsStore((s) => s.create)

  const [name, setName] = useState('Untitled project')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9')
  const [resolution, setResolution] = useState<ResolutionPreset>('1080p')
  const [fps, setFps] = useState<Fps>(30)
  const [templateId, setTemplateId] = useState<string>(defaultTemplateId ?? 'none')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const id = await create({
        name,
        aspectRatio,
        resolution,
        fps,
        templateId: templateId === 'none' ? undefined : templateId,
      })
      onOpenChange?.(false)
      router.push(`/editor/${id}`)
    } catch (error) {
      toast.error('Could not create the project', {
        description: error instanceof Error ? error.message : 'Your existing projects are unaffected.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Frame settings can be changed at any time from the editor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onFocus={(event) => event.target.select()}
              autoFocus
              required
              maxLength={80}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Aspect ratio</Label>
            <Segmented
              aria-label="Aspect ratio"
              value={aspectRatio}
              onChange={setAspectRatio}
              options={ASPECTS}
              className="w-full [&>button]:flex-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="project-resolution">Resolution</Label>
              <Select
                value={resolution}
                onValueChange={(value) => setResolution(value as ResolutionPreset)}
              >
                <SelectTrigger id="project-resolution">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4K">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-fps">Frame rate</Label>
              <Select value={String(fps)} onValueChange={(value) => setFps(Number(value) as Fps)}>
                <SelectTrigger id="project-fps">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 fps</SelectItem>
                  <SelectItem value="25">25 fps</SelectItem>
                  <SelectItem value="30">30 fps</SelectItem>
                  <SelectItem value="60">60 fps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-template">Start from a template</Label>
            <Select
              value={templateId}
              onValueChange={(value) => {
                setTemplateId(value)
                const template = TEMPLATES.find((t) => t.id === value)
                if (template) {
                  setAspectRatio(template.blueprint.aspectRatio)
                  setResolution(template.blueprint.resolution)
                  setFps(template.blueprint.fps)
                }
              }}
            >
              <SelectTrigger id="project-template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="none">Blank timeline</SelectItem>
                {TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} · {template.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-2xs text-muted-foreground">
              Templates create labelled slots for media you have not imported yet.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange?.(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Plus />}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
