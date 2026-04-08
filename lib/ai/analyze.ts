import { createAiClient } from './client'
import type { AiConfig, RepoAnalysis } from './types'
import type { TrendingRepo } from '../scraper/types'

const SYSTEM_PROMPT = `你是一个专业的技术项目分析师。你的任务是分析 GitHub 项目的 README 文档，并生成结构化的中文分析报告。

请严格按照以下 JSON 格式输出，不要包含任何其他内容：

{
  "summary": "项目简介，用2-3句话概括项目的核心功能和特点",
  "problemSolved": "该项目解决的问题，说明它解决了什么痛点",
  "useCases": "使用场景，用换行分点列举，格式如：1. 场景一\\n2. 场景二\\n3. 场景三",
  "limitations": "目前的不足，用换行分点列举，格式如：1. 不足一\\n2. 不足二\\n3. 不足三"
}

要求：
- 使用中文回答
- 简洁专业，避免冗余
- 客观分析，不夸大也不贬低
- useCases 和 limitations 必须用 "1. 2. 3." 编号分点，每点之间用 \\n 换行
- 如果 README 信息不足，基于已有信息给出合理推断`

const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 1000

export async function analyzeRepo(
  readme: string,
  repo: TrendingRepo,
  config: AiConfig
): Promise<RepoAnalysis & { tokenUsage: number }> {
  const client = createAiClient(config)

  const userMessage = `请分析以下 GitHub 项目：

项目：${repo.author}/${repo.name}
描述：${repo.description || '无'}
语言：${repo.language || '未知'}
Stars：${repo.stars}
当日新增 Stars：${repo.currentPeriodStars}

README 内容：
${readme}`

  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { content, tokenUsage } = await client.chat(SYSTEM_PROMPT, userMessage)

      const analysis = parseAnalysis(content)

      // Auto-retry if critical fields are empty
      if (isAnalysisIncomplete(analysis) && attempt < MAX_RETRIES - 1) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      return { ...analysis, tokenUsage }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError ?? new Error('Analysis failed after retries')
}

function isAnalysisIncomplete(analysis: RepoAnalysis): boolean {
  return !analysis.summary || !analysis.problemSolved || !analysis.useCases || !analysis.limitations
    || analysis.summary === '解析失败'
}

function parseAnalysis(content: string): RepoAnalysis {
  // Try to extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      summary: content.slice(0, 200),
      problemSolved: '解析失败',
      useCases: '解析失败',
      limitations: '解析失败',
    }
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return {
      summary: String(parsed.summary || ''),
      problemSolved: String(parsed.problemSolved || ''),
      useCases: String(parsed.useCases || ''),
      limitations: String(parsed.limitations || ''),
    }
  } catch {
    return {
      summary: content.slice(0, 200),
      problemSolved: '解析失败',
      useCases: '解析失败',
      limitations: '解析失败',
    }
  }
}

// Concurrency limiter for AI calls
export async function analyzeReposWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number = 3
): Promise<void> {
  const queue = [...items]
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()
      if (item) await fn(item)
    }
  })
  await Promise.all(workers)
}
