import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { AiConfig } from './types'

interface AiClient {
  chat(systemPrompt: string, userMessage: string): Promise<{ content: string; tokenUsage: number }>
}

function createClaudeClient(config: AiConfig): AiClient {
  const client = new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  })

  return {
    async chat(systemPrompt, userMessage) {
      const response = await client.messages.create({
        model: config.model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })

      const content = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')

      const tokenUsage =
        (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0)

      return { content, tokenUsage }
    },
  }
}

function createOpenAiClient(config: AiConfig): AiClient {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  })

  return {
    async chat(systemPrompt, userMessage) {
      const response = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 2000,
      })

      const content = response.choices[0]?.message?.content ?? ''
      const tokenUsage =
        (response.usage?.prompt_tokens ?? 0) + (response.usage?.completion_tokens ?? 0)

      return { content, tokenUsage }
    },
  }
}

export function createAiClient(config: AiConfig): AiClient {
  return config.protocol === 'claude'
    ? createClaudeClient(config)
    : createOpenAiClient(config)
}

