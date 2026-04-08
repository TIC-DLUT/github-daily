import { getRepoById, deleteAnalysisByRepo, insertRepoAnalysis } from '@/lib/digest/repository'
import { fetchReadme } from '@/lib/scraper/readme'
import { analyzeRepo } from '@/lib/ai/analyze'
import { getSetting } from '@/lib/settings/repository'
import type { AiConfig } from '@/lib/ai/types'
import type { TrendingRepo } from '@/lib/scraper/types'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: runId } = await params

  let body: { repoId?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ success: false, error: '无效的请求' }, { status: 400 })
  }

  const { repoId } = body
  if (!repoId) {
    return Response.json({ success: false, error: '缺少 repoId' }, { status: 400 })
  }

  const repoRow = getRepoById(repoId)
  if (!repoRow || repoRow.digestRunId !== runId) {
    return Response.json({ success: false, error: '未找到该项目' }, { status: 404 })
  }

  const aiConfig: AiConfig = {
    protocol: getSetting('ai_protocol') as 'claude' | 'openai',
    baseUrl: getSetting('ai_base_url'),
    apiKey: getSetting('ai_api_key'),
    model: getSetting('ai_model'),
  }

  if (!aiConfig.apiKey) {
    return Response.json({ success: false, error: '未配置 AI API Key' }, { status: 400 })
  }

  try {
    const readme = await fetchReadme(repoRow.author, repoRow.name)

    if (!readme) {
      return Response.json({ success: false, error: '无法获取 README' }, { status: 400 })
    }

    const repoInfo: TrendingRepo = {
      author: repoRow.author,
      name: repoRow.name,
      url: repoRow.url,
      description: repoRow.description,
      language: repoRow.language,
      languageColor: null,
      stars: repoRow.stars,
      forks: repoRow.forks,
      currentPeriodStars: repoRow.currentPeriodStars,
      builtBy: JSON.parse(repoRow.builtBy || '[]'),
    }

    const result = await analyzeRepo(readme, repoInfo, aiConfig)

    // Delete old analysis and insert new one
    deleteAnalysisByRepo(repoRow.id)
    insertRepoAnalysis(repoRow.id, runId, result, true, aiConfig.model, result.tokenUsage)

    return Response.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
