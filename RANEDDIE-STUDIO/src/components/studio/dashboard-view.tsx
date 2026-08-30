'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Clock3,
  Coins,
  Film,
  FolderOpen,
  LayoutTemplate,
  Plus,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusPill } from '@/components/ui/status-pill'
import { CreateProjectDialog } from '@/components/studio/create-project-dialog'
import { DemoLauncher } from '@/components/studio/demo-launcher'
import { ProjectCard } from '@/components/studio/project-card'
import { PageHeader } from '@/components/studio/studio-shell'
import { useCreditsStore, creditLabel } from '@/lib/store/credits-store'
import { useProjectsStore } from '@/lib/store/projects-store'
import { TEMPLATES } from '@/lib/templates'
import { formatRelativeTime } from '@/lib/utils'

export function DashboardView() {
  const params = useSearchParams()
  const projects = useProjectsStore((s) => s.projects)
  const status = useProjectsStore((s) => s.status)
  const refresh = useProjectsStore((s) => s.refresh)
  const balance = useCreditsStore((s) => s.balance)
  const history = useCreditsStore((s) => s.history)

  // `?new=1` is present on the first client render, so the dialog can simply
  // start open rather than being toggled by an effect.
  const [createOpen, setCreateOpen] = useState(() => params.get('new') === '1')

  useEffect(() => {
    void refresh()
  }, [refresh])

  const recent = projects.slice(0, 6)
  const featuredTemplates = TEMPLATES.slice(0, 4)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything here runs locally. Projects, media and credits live in this browser."
        actions={
          <>
            <DemoLauncher label="Open demo project" />
            <Button variant="secondary" onClick={() => setCreateOpen(true)}>
              <Plus /> New Project
            </Button>
            <Button asChild variant="ai">
              <Link href="/templates">
                <Sparkles /> Create with AI
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-8 px-5 py-6 sm:px-8">
        {/* Stat strip */}
        <section aria-label="Studio at a glance" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FolderOpen}
            label="Projects"
            value={status === 'loading' ? '—' : String(projects.length)}
            hint={projects.length === 0 ? 'Create your first one' : 'Stored in this browser'}
          />
          <StatCard
            icon={Coins}
            label="AI Credits"
            value={balance.toLocaleString()}
            hint="Demo ledger · nothing billed"
            tone="ai"
          />
          <StatCard
            icon={LayoutTemplate}
            label="Templates"
            value={String(TEMPLATES.length)}
            hint="Across 9 categories"
          />
          <StatCard
            icon={Film}
            label="Total runtime"
            value={
              status === 'loading'
                ? '—'
                : `${Math.round(projects.reduce((sum, p) => sum + p.duration, 0))}s`
            }
            hint="Across all projects"
          />
        </section>

        {/* Recent projects */}
        <section aria-labelledby="recent-projects">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="recent-projects" className="text-sm font-semibold tracking-tight">
                Recent projects
              </h2>
              <p className="mt-0.5 text-2xs text-muted-foreground">Pick up where you left off.</p>
            </div>
            {projects.length > 0 && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/projects">
                  View all <ArrowRight />
                </Link>
              </Button>
            )}
          </div>

          {status === 'loading' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface-1">
              <EmptyState
                icon={Film}
                title="No projects yet"
                description="Generate the demo project to see the whole product in about five seconds, or start from a blank timeline."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <DemoLauncher label="Generate demo project" />
                    <Button onClick={() => setCreateOpen(true)}>
                      <Plus /> New Project
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recent.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* Templates */}
          <section aria-labelledby="dash-templates">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 id="dash-templates" className="text-sm font-semibold tracking-tight">
                Start from a template
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/templates">
                  Browse all <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {featuredTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/templates?open=${template.id}`}
                  className="group overflow-hidden rounded-lg border border-border bg-surface-1 transition-colors hover:border-muted-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div
                    className="relative h-20"
                    style={{
                      background: `linear-gradient(135deg, ${template.gradient[0]}, ${template.gradient[1]})`,
                    }}
                  >
                    <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {template.aspectRatio}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-medium">{template.name}</p>
                    <p className="mt-0.5 truncate text-2xs text-muted-foreground">{template.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent exports / credit usage */}
          <section aria-labelledby="dash-activity" className="space-y-6">
            <div>
              <h2 id="dash-activity" className="mb-3 text-sm font-semibold tracking-tight">
                Recent AI activity
              </h2>
              <div className="rounded-lg border border-border bg-surface-1">
                {history.length === 0 ? (
                  <EmptyState
                    compact
                    icon={Sparkles}
                    title="No AI operations yet"
                    description="Applying an operation from an edit plan records it here with its credit cost."
                  />
                ) : (
                  <ul className="divide-y divide-border">
                    {history.slice(0, 5).map((entry) => (
                      <li key={entry.id} className="flex items-center gap-3 px-3 py-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-ai/12 text-ai">
                          <Sparkles className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{entry.description}</p>
                          <p className="mt-0.5 truncate text-2xs text-muted-foreground">
                            {creditLabel(entry.capability)} · {formatRelativeTime(entry.createdAt)}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-2xs tabular text-muted-foreground">
                          {entry.amount > 0 ? '+' : ''}
                          {entry.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-tight">Recent exports</h2>
              <div className="rounded-lg border border-border bg-surface-1">
                <EmptyState
                  compact
                  icon={Clock3}
                  title="Exports live in the editor"
                  description="Rendered files are handed straight to your browser's downloads and are not stored by the studio."
                  action={
                    <Badge variant="outline">
                      <StatusPill status="ready" label="By design" showIcon={false} />
                    </Badge>
                  }
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'default',
}: {
  icon: React.ElementType
  label: string
  value: string
  hint: string
  tone?: 'default' | 'ai'
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4">
      <div className="flex items-center gap-2">
        <Icon
          className={`size-3.5 ${tone === 'ai' ? 'text-ai' : 'text-muted-foreground'}`}
          aria-hidden="true"
        />
        <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2.5 text-2xl font-bold tracking-tight tabular">{value}</p>
      <p className="mt-1 text-2xs text-muted-foreground">{hint}</p>
    </div>
  )
}
