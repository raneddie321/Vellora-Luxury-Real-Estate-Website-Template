import 'server-only'
import { getServerAIConfig } from './config'

/**
 * A minimal language-model contract, implemented with plain `fetch` so the
 * project carries no vendor SDK and no SDK version drift. Adding a provider
 * means adding one `call*` function and one branch below.
 */
export interface LanguageModelMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LanguageModel {
  readonly id: string
  readonly model: string
  complete(input: {
    system: string
    messages: LanguageModelMessage[]
    maxTokens?: number
    /** Ask the model for a single JSON object and nothing else. */
    json?: boolean
    signal?: AbortSignal
  }): Promise<string>
}

class ProviderError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = 'ProviderError'
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } }
    return body?.error?.message ?? response.statusText
  } catch {
    return response.statusText
  }
}

class AnthropicModel implements LanguageModel {
  readonly id = 'anthropic'
  constructor(readonly model: string, private readonly apiKey: string) {}

  async complete({ system, messages, maxTokens = 1600, json, signal }: Parameters<LanguageModel['complete']>[0]) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        system: json ? `${system}\n\nRespond with a single JSON object and no other text.` : system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    })
    if (!response.ok) throw new ProviderError(await readError(response), response.status)
    const data = (await response.json()) as { content?: { type: string; text?: string }[] }
    return (data.content ?? [])
      .filter((part) => part.type === 'text')
      .map((part) => part.text ?? '')
      .join('')
      .trim()
  }
}

class OpenAIModel implements LanguageModel {
  readonly id = 'openai'
  constructor(readonly model: string, private readonly apiKey: string) {}

  async complete({ system, messages, maxTokens = 1600, json, signal }: Parameters<LanguageModel['complete']>[0]) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        response_format: json ? { type: 'json_object' } : undefined,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    })
    if (!response.ok) throw new ProviderError(await readError(response), response.status)
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
    return (data.choices?.[0]?.message?.content ?? '').trim()
  }
}

/** Returns the configured model, or null when running key-free. */
export function getLanguageModel(): LanguageModel | null {
  const config = getServerAIConfig()
  if (config.language.provider === 'anthropic') {
    return new AnthropicModel(config.language.model, (process.env.ANTHROPIC_API_KEY ?? '').trim())
  }
  if (config.language.provider === 'openai') {
    return new OpenAIModel(config.language.model, (process.env.OPENAI_API_KEY ?? '').trim())
  }
  return null
}
