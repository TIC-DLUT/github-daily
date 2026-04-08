import { getDigestRunDetail, getAnalysesByRun } from '@/lib/digest/repository'
import { getActiveTemplates } from '@/lib/digest/theme-repository'
import { renderDigestHtml } from '@/lib/email/templates'
import type { DigestEmailData } from '@/lib/email/types'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const detail = getDigestRunDetail(id)

  if (!detail) {
    return new Response('未找到该运行记录', { status: 404 })
  }

  const analyses = getAnalysesByRun(id)
  const analysisMap = new Map(analyses.map((a) => [a.trendingRepoId, a]))
  const languages: string[] = JSON.parse(detail.languages)

  const emailData: DigestEmailData = {
    date: new Date(detail.startedAt).toISOString().split('T')[0],
    languages,
    repos: detail.repos.map((r) => {
      const analysis = analysisMap.get(r.id)
      return {
        repo: {
          author: r.author,
          name: r.name,
          url: r.url,
          description: r.description,
          language: r.language,
          languageColor: null,
          stars: r.stars,
          forks: r.forks,
          currentPeriodStars: r.currentPeriodStars,
          builtBy: JSON.parse(r.builtBy || '[]'),
        },
        analysis: analysis
          ? {
              summary: analysis.summary || '',
              problemSolved: analysis.problemSolved || '',
              useCases: analysis.useCases || '',
              limitations: analysis.limitations || '',
            }
          : null,
      }
    }),
  }

  const { template, contentTemplate } = getActiveTemplates()
  const html = renderDigestHtml(emailData, template, contentTemplate)

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
