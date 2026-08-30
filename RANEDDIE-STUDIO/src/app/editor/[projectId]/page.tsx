import type { Metadata } from 'next'
import { EditorView } from '@/components/editor/editor-view'

export const metadata: Metadata = {
  title: 'Editor',
  robots: { index: false, follow: false },
}

export default async function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  return <EditorView projectId={projectId} />
}
