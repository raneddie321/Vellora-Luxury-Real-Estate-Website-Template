import { NextResponse } from 'next/server'
import { getLanguageModel } from '@/lib/ai/server/language-model'
import { PLAN_SYSTEM_PROMPT, parsePlanResponse, toEditPlan } from '@/lib/ai/server/plan-schema'
import type { CapabilityStatus, EditPlanRequest } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_PROMPT = 2000

export async function POST(request: Request) {
  let body: EditPlanRequest & { capabilities?: CapabilityStatus[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const prompt = (body.prompt ?? '').trim()
  if (!prompt) return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 })
  if (prompt.length > MAX_PROMPT) {
    return NextResponse.json({ error: 'That instruction is too long.' }, { status: 413 })
  }

  const model = getLanguageModel()
  if (!model) {
    // The client falls back to its local planner; be explicit about why.
    return NextResponse.json(
      { error: 'No language model is configured on the server.', fallback: 'local' },
      { status: 503 },
    )
  }

  const capabilities = new Map((body.capabilities ?? []).map((c) => [c.capability as string, c]))

  try {
    const raw = await model.complete({
      system: PLAN_SYSTEM_PROMPT,
      json: true,
      messages: [
        {
          role: 'user',
          content: `Timeline snapshot:\n${JSON.stringify(body.snapshot, null, 2)}\n\nInstruction: ${prompt}`,
        },
      ],
    })
    const parsed = parsePlanResponse(raw, capabilities)
    if (!parsed) {
      return NextResponse.json(
        { error: 'The model returned a plan that could not be validated.', fallback: 'local' },
        { status: 502 },
      )
    }
    return NextResponse.json({ plan: toEditPlan(parsed, prompt, model.id) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The planning request failed.'
    return NextResponse.json({ error: message, fallback: 'local' }, { status: 502 })
  }
}
