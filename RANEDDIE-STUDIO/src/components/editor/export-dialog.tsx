'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  RotateCcw,
  X,
} from 'lucide-react'
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
import { Field } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { Segmented } from '@/components/ui/segmented'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { getCompositionSize } from '@/lib/media/composition'
import { pickExporter, type ExportProgress, type ExportResult } from '@/lib/media/export'
import { useEditorStore } from '@/lib/store/editor-store'
import type { ExportContainer, ExportQuality, Fps, ResolutionPreset } from '@/lib/types'
import { formatBytes, formatDuration } from '@/lib/utils'

const STAGE_LABEL: Record<ExportProgress['stage'], string> = {
  preparing: 'Preparing',
  processing: 'Processing',
  rendering: 'Rendering',
  transcoding: 'Transcoding',
  complete: 'Complete',
  failed: 'Failed',
}

const STAGES: ExportProgress['stage'][] = ['preparing', 'processing', 'rendering', 'complete']

/**
 * The export workflow.
 *
 * This runs a genuine render: the timeline is composited frame by frame and
 * captured to a real file. Because the browser records in real time, the dialog
 * says so up front rather than implying an instant export.
 */
export function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const project = useEditorStore((s) => s.project)
  const pause = useEditorStore((s) => s.pause)

  // This component is mounted when the dialog opens, so the project's own
  // settings can seed the form directly instead of being synced by an effect.
  const [container, setContainer] = useState<ExportContainer>('mp4')
  const [resolution, setResolution] = useState<ResolutionPreset>(
    () => project?.settings.resolution ?? '1080p',
  )
  const [fps, setFps] = useState<Fps>(() => project?.settings.fps ?? 30)
  const [quality, setQuality] = useState<ExportQuality>('high')
  const [includeAudio, setIncludeAudio] = useState(true)

  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [result, setResult] = useState<ExportResult | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [engineNote, setEngineNote] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Check availability up front so the button never lies about what will happen.
    let cancelled = false
    void pickExporter().then(({ exporter, reason }) => {
      if (!cancelled) setEngineNote(exporter ? null : (reason ?? null))
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Object URLs must be revoked or the rendered file leaks for the tab's life.
  useEffect(() => {
    if (!downloadUrl) return
    return () => URL.revokeObjectURL(downloadUrl)
  }, [downloadUrl])

  const running = progress !== null && progress.stage !== 'complete' && progress.stage !== 'failed'

  async function startExport() {
    if (!project) return
    pause()
    setDownloadUrl(null)
    setResult(null)
    setError(null)
    setProgress({ stage: 'preparing', progress: 0, message: 'Starting…' })

    const controller = new AbortController()
    abortRef.current = controller

    const { exporter, reason } = await pickExporter()
    if (!exporter) {
      setError(reason)
      setProgress({ stage: 'failed', progress: 0, message: 'No export engine available.' })
      return
    }

    try {
      const output = await exporter.export(
        project,
        {
          container,
          resolution,
          fps,
          quality,
          includeAudio,
          filename: `${project.name.replace(/[^\w\-]+/g, '-').toLowerCase()}`,
        },
        { onProgress: setProgress, signal: controller.signal },
      )
      setDownloadUrl(URL.createObjectURL(output.blob))
      setResult(output)
      setProgress({ stage: 'complete', progress: 1, message: 'Export complete.' })
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Rendering failed. Your project is safe. Try again.'
      setError(message)
      setProgress({ stage: 'failed', progress: 0, message })
    } finally {
      abortRef.current = null
    }
  }

  function close() {
    if (running) abortRef.current?.abort()
    onOpenChange(false)
  }

  if (!project) return null
  const size = getCompositionSize(project.settings.aspectRatio, resolution)
  const duration = project.timeline.duration

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-lg" hideClose={running}>
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>
            The browser renders in real time — a {formatDuration(duration)} sequence takes about{' '}
            {formatDuration(duration)} to write. Keep this tab in the foreground while it runs.
          </DialogDescription>
        </DialogHeader>

        {engineNote && !running && !result && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/[0.07] px-3 py-2.5">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-2xs leading-relaxed">{engineNote}</p>
          </div>
        )}

        {!progress && (
          <div className="space-y-4">
            <Field label="Format">
              <Segmented
                aria-label="Container format"
                className="w-full [&>button]:flex-1"
                value={container}
                onChange={setContainer}
                options={[
                  { value: 'mp4', label: 'MP4' },
                  { value: 'webm', label: 'WebM' },
                ]}
              />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Resolution" htmlFor="export-resolution">
                <Select value={resolution} onValueChange={(v) => setResolution(v as ResolutionPreset)}>
                  <SelectTrigger id="export-resolution" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="4K">4K</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Frame rate" htmlFor="export-fps">
                <Select value={String(fps)} onValueChange={(v) => setFps(Number(v) as Fps)}>
                  <SelectTrigger id="export-fps" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Quality" htmlFor="export-quality">
                <Select value={quality} onValueChange={(v) => setQuality(v as ExportQuality)}>
                  <SelectTrigger id="export-quality" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium">Include audio</p>
                <p className="mt-0.5 text-2xs text-muted-foreground">
                  Mixes every clip through WebAudio into the recording.
                </p>
              </div>
              <Switch checked={includeAudio} onCheckedChange={setIncludeAudio} aria-label="Include audio" />
            </div>

            <dl className="space-y-1 rounded-md border border-border bg-surface-2 px-3 py-2.5 text-2xs">
              <Row label="Output" value={`${size.width} × ${size.height} @ ${fps} fps`} />
              <Row label="Duration" value={formatDuration(duration)} />
              <Row label="Aspect" value={project.settings.aspectRatio} />
            </dl>

            <div className="flex items-start gap-2 rounded-md border border-border bg-surface-2 px-3 py-2.5">
              <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-2xs leading-relaxed text-muted-foreground">
                {container === 'mp4'
                  ? 'If your browser cannot record H.264 directly, the WebM result is converted with ffmpeg.wasm — that downloads roughly 32 MB the first time. Should neither be possible, you still get the WebM file and the app tells you why.'
                  : 'WebM is written straight from the browser recorder, so the file carries no duration header: it plays, but some players show its length as unknown. Choose MP4 for a fully seekable file.'}
              </p>
            </div>
          </div>
        )}

        {progress && (
          <div className="space-y-4">
            <ol className="flex items-center gap-1" aria-label="Export progress">
              {STAGES.map((stage) => {
                const index = STAGES.indexOf(stage)
                const currentIndex = STAGES.indexOf(
                  progress.stage === 'transcoding' ? 'rendering' : progress.stage,
                )
                const done = progress.stage === 'complete' || index < currentIndex
                const active = index === currentIndex && progress.stage !== 'complete'
                return (
                  <li key={stage} className="flex flex-1 items-center gap-1">
                    <span
                      className={`flex h-6 flex-1 items-center justify-center rounded text-[10px] font-medium ${
                        done
                          ? 'bg-success/15 text-success'
                          : active
                            ? 'bg-ai/15 text-ai'
                            : 'bg-surface-3 text-muted-foreground'
                      }`}
                    >
                      {STAGE_LABEL[stage]}
                    </span>
                  </li>
                )
              })}
            </ol>

            <div className="space-y-1.5">
              <Progress
                value={progress.progress * 100}
                tone={progress.stage === 'failed' ? 'destructive' : progress.stage === 'complete' ? 'success' : 'ai'}
              />
              <div className="flex justify-between text-2xs text-muted-foreground">
                <span>{progress.message}</span>
                <span className="tabular">{Math.round(progress.progress * 100)}%</span>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/[0.07] px-3 py-2.5"
              >
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium">Rendering failed. Your project is safe.</p>
                  <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-2 rounded-md border border-success/30 bg-success/[0.06] px-3 py-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" /> Export complete
                </p>
                <dl className="space-y-1 text-2xs">
                  <Row label="Size" value={formatBytes(result.blob.size)} />
                  <Row label="Type" value={result.mimeType} />
                  <Row label="Rendered by" value={result.engine ?? 'browser-canvas'} />
                </dl>
                {result.containerNotice && (
                  <p className="flex items-start gap-1.5 rounded bg-warning/10 px-2 py-1.5 text-[10px] leading-relaxed text-warning">
                    <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                    {result.containerNotice}
                  </p>
                )}
                <Badge variant="outline">Files are handed to your browser, never stored by the studio</Badge>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!progress && (
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button onClick={() => void startExport()} disabled={duration <= 0 || Boolean(engineNote)}>
                <Download /> Start export
              </Button>
            </>
          )}

          {running && (
            <Button variant="secondary" onClick={() => abortRef.current?.abort()}>
              <X /> Cancel render
            </Button>
          )}

          {progress?.stage === 'failed' && (
            <>
              <Button variant="ghost" onClick={close}>
                Close
              </Button>
              <Button onClick={() => void startExport()}>
                <RotateCcw /> Try again
              </Button>
            </>
          )}

          {result && downloadUrl && (
            <>
              <Button variant="ghost" onClick={close}>
                Done
              </Button>
              <Button asChild>
                <a
                  href={downloadUrl}
                  download={`${project.name.replace(/[^\w\-]+/g, '-').toLowerCase()}.${
                    result.mimeType.includes('mp4') ? 'mp4' : 'webm'
                  }`}
                >
                  <Download /> Download file
                </a>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-mono tabular text-foreground">{value}</dd>
    </div>
  )
}
