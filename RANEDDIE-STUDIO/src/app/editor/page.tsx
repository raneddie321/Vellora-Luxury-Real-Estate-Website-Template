import { redirect } from 'next/navigation'

/** `/editor` has no project to open — send people somewhere that does. */
export default function EditorIndexPage() {
  redirect('/projects')
}
