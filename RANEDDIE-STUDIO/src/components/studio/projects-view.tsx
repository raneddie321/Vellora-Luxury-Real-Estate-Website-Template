'use client'

import { useEffect, useMemo, useState } from 'react'
import { Film, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateProjectDialog } from '@/components/studio/create-project-dialog'
import { DemoLauncher } from '@/components/studio/demo-launcher'
import { ProjectCard } from '@/components/studio/project-card'
import { PageHeader } from '@/components/studio/studio-shell'
import { useProjectsStore } from '@/lib/store/projects-store'

type SortKey = 'updated' | 'created' | 'name'

export function ProjectsView() {
  const projects = useProjectsStore((s) => s.projects)
  const status = useProjectsStore((s) => s.status)
  const error = useProjectsStore((s) => s.error)
  const refresh = useProjectsStore((s) => s.refresh)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('updated')
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = needle
      ? projects.filter((project) => project.name.toLowerCase().includes(needle))
      : projects
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'created') return b.createdAt.localeCompare(a.createdAt)
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [projects, query, sort])

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project is stored in this browser. Duplicating shares media rather than copying it."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> New Project
          </Button>
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
              placeholder="Search projects"
              className="pl-8"
              aria-label="Search projects"
            />
          </div>
          <Segmented
            aria-label="Sort projects"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'updated', label: 'Last edited' },
              { value: 'created', label: 'Newest' },
              { value: 'name', label: 'Name' },
            ]}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/[0.07] px-4 py-3 text-xs text-foreground"
          >
            {error}{' '}
            <button onClick={() => void refresh()} className="font-medium text-destructive underline">
              Retry
            </button>
          </div>
        )}

        {status === 'loading' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-1">
            <EmptyState
              icon={Film}
              title={query ? 'No projects match that search' : 'No projects yet'}
              description={
                query
                  ? 'Try a different name, or clear the search to see everything.'
                  : 'Start from a blank timeline, a template, or generate the demo project to see the whole product working.'
              }
              action={
                query ? (
                  <Button variant="outline" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2">
                    <DemoLauncher label="Generate demo project" />
                    <Button onClick={() => setCreateOpen(true)}>
                      <Plus /> New Project
                    </Button>
                  </div>
                )
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
