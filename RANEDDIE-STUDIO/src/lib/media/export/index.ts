import { BackendExporter } from './backend-exporter'
import { BrowserExporter } from './browser-exporter'
import type { Exporter } from './types'

export * from './types'
export { BrowserExporter, BackendExporter }

/**
 * Export engines in preference order. The first one that reports itself
 * available handles the job; the UI names whichever actually ran.
 */
export function getExporters(): Exporter[] {
  return [new BrowserExporter(), new BackendExporter(process.env.NEXT_PUBLIC_RENDER_WORKER_URL)]
}

export async function pickExporter(): Promise<
  { exporter: Exporter; reason?: string } | { exporter: null; reason: string }
> {
  const exporters = getExporters()
  // Availability checks are independent, so probe them together and then apply
  // the preference order to the results.
  const results = await Promise.all(
    exporters.map(async (exporter) => ({ exporter, ...(await exporter.availability()) })),
  )
  const first = results.find((result) => result.available)
  if (first) return { exporter: first.exporter }
  const reasons = results
    .filter((result) => result.reason)
    .map((result) => `${result.exporter.label}: ${result.reason}`)
  return {
    exporter: null,
    reason: reasons.join(' ') || 'No export engine is available in this browser.',
  }
}
