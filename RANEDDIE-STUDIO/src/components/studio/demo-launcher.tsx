'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { createDemoProject, getExistingDemoProjectId } from '@/lib/demo'
import { getProjectRepository } from '@/lib/persistence'
import { useProjectsStore } from '@/lib/store/projects-store'

/**
 * Generates the demo project on demand. The media is produced locally with
 * MediaRecorder and WebAudio, so the dialog reports honest progress rather than
 * a decorative spinner — and the whole thing takes about five seconds.
 */
export function DemoLauncher({
  variant = 'outline',
  size = 'default',
  className,
  label = 'Watch Demo',
}: {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  label?: string
}) {
  const router = useRouter()
  const refresh = useProjectsStore((s) => s.refresh)
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('Preparing…')

  async function launch() {
    const existingId = getExistingDemoProjectId()
    if (existingId) {
      const existing = await getProjectRepository().get(existingId)
      if (existing) {
        router.push(`/editor/${existing.id}`)
        return
      }
    }

    setOpen(true)
    setProgress(0)
    setStage('Preparing…')
    try {
      const project = await createDemoProject((ratio, label) => {
        setProgress(Math.round(ratio * 100))
        setStage(label)
      })
      await refresh()
      setOpen(false)
      router.push(`/editor/${project.id}`)
    } catch (error) {
      setOpen(false)
      toast.error('The demo project could not be generated', {
        description:
          error instanceof Error
            ? error.message
            : 'Your browser may not support canvas recording. You can still create a project and import your own media.',
      })
    }
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => void launch()}>
        <PlayCircle />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={() => undefined}>
        <DialogContent hideClose className="max-w-sm" onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-ai" />
              Building the demo project
            </DialogTitle>
            <DialogDescription>
              Three video shots, an audio bed, titles and captions — all generated on your machine.
              Nothing is downloaded.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Progress value={progress} tone="ai" />
            <div className="flex justify-between text-2xs text-muted-foreground">
              <span>{stage}</span>
              <span className="tabular">{progress}%</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
