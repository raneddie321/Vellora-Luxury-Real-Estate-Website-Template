import { NextResponse } from 'next/server'
import { getLanguageModel } from '@/lib/ai/server/language-model'
import type { AIMessage, TimelineSnapshotForAI } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM = `You are RAN, the creative director inside Editime, a professional AI video editor.

Speak like a senior editor sitting next to the user: concise, concrete, no filler, no emoji.
You can read the timeline snapshot you are given. Refer to real clips and durations from it.
Never claim you have changed anything — the user applies edit plans themselves.
If a request needs an external model the studio has not configured, say exactly which one and stop.
Keep answers under 90 words unless the user asks for detail.`

export async function POST(request: Request) {
  let body: { messages: AIMessage[]; snapshot: TimelineSnapshotForAI }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const model = getLanguageModel()
  if (!model) {
    return NextResponse.json(
      { error: 'No language model is configured on the server.', fallback: 'local' },
      { status: 503 },
    )
  }

  const messages = (body.messages ?? [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-12)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content.slice(0, 4000) }))

  if (messages.length === 0) {
    return NextResponse.json({ error: 'No messages to respond to.' }, { status: 400 })
  }

  try {
    const reply = await model.complete({
      system: `${SYSTEM}\n\nTimeline snapshot:\n${JSON.stringify(body.snapshot)}`,
      messages,
      maxTokens: 600,
    })
    return NextResponse.json({ reply })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The assistant request failed.'
    return NextResponse.json({ error: message, fallback: 'local' }, { status: 502 })
  }
}
