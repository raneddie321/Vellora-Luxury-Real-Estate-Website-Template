'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Clock3, LayoutTemplate, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { CreateProjectDialog } from '@/components/studio/create-project-dialog'
import { PageHeader } from '@/components/studio/studio-shell'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/templates'
import type { Template } from '@/lib/types'
import { cn, formatDuration } from '@/lib/utils'

export function TemplatesView() {
  const params = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [selected, setSelected] = useState<Template | null>(
    () => TEMPLATES.find((template) => template.id === params.get('open')) ?? null,
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return TEMPLATES.filter((template) => {
      if (category !== 'All' && template.category !== category) return false
      if (!needle) return true
      return (
        template.name.toLowerCase().includes(needle) ||
        template.description.toLowerCase().includes(needle) ||
        template.tags.some((tag) => tag.includes(needle))
      )
    })
  }, [query, category])

  return (
    <>
      <PageHeader
        title="Templates"
        description={`${TEMPLATES.length} production-ready starts. Applying one sets the frame, lays out text and transitions, and creates labelled slots for media you have not imported yet.`}
      />

      <div className="px-5 py-6 sm:px-8">
        <div className="mb-4 flex flex-col gap-3">
          <div className="relative sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates"
              className="pl-8"
              aria-label="Search templates"
            />
          </div>

          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Template categories">
            {['All', ...TEMPLATE_CATEGORIES].map((item) => (
              <button
                key={item}
                role="tab"
                aria-selected={category === item}
                onClick={() => setCategory(item)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  category === item
                    ? 'border-primary/40 bg-primary/12 font-medium text-primary'
                    : 'border-border text-muted-foreground hover:bg-surface-2 hover:text-foreground',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-1">
            <EmptyState
              icon={LayoutTemplate}
              title="Nothing matches"
              description="Try a different search term or category."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setCategory('All')
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelected(template)}
                className="group overflow-hidden rounded-lg border border-border bg-surface-1 text-left transition-colors hover:border-muted-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div
                  className="relative flex h-28 items-end p-3"
                  style={{
                    background: `linear-gradient(140deg, ${template.gradient[0]}, ${template.gradient[1]})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="relative flex w-full items-end justify-between gap-2">
                    <span className="rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {template.aspectRatio}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white tabular">
                      <Clock3 className="size-2.5" />
                      {formatDuration(template.duration)}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium">{template.name}</p>
                    <Badge variant="outline" className="shrink-0">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-2xs leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <CreateProjectDialog
          open
          onOpenChange={(open) => !open && setSelected(null)}
          defaultTemplateId={selected.id}
        />
      )}
    </>
  )
}
