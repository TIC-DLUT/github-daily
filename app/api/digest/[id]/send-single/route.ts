import { getDigestRunDetail, getAnalysesByRun, insertEmailLog } from '@/lib/digest/repository'
import { getSetting } from '@/lib/settings/repository'
import { sendDigestEmail } from '@/lib/email/client'
import { getActiveTemplates } from '@/lib/digest/theme-repository'
import type { DigestEmailData } from '@/lib/email/types'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { recipients } = body as { recipients: string[] }

  if (!recipients || recipients.length === 0) {
    return Response.json({ success: false, error: '请选择至少一个收件人' }, { status: 400 })
  }

  const detail = getDigestRunDetail(id)
  if (!detail) {
    return Response.json({ success: false, error: '未找到该运行记录' }, { status: 404 })
  }

  const resendApiKey = getSetting('resend_api_key')
  const emailFrom = getSetting('email_from')

  if (!resendApiKey) {
    return Response.json(
      { success: false, error: '邮件配置不完整，请先配置 Resend API Key' },
      { status: 400 }
    )
  }

  const analyses = getAnalysesByRun(id)
  const analysisMap = new Map(analyses.map((a) => [a.trendingRepoId, a]))

  const emailData: DigestEmailData = {
    date: new Date(detail.startedAt).toISOString().split('T')[0],
    languages: JSON.parse(detail.languages),
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
  const results = await sendDigestEmail(resendApiKey, emailFrom, recipients, emailData, template, contentTemplate)

  let emailsSent = 0
  for (const result of results) {
    insertEmailLog(id, result.recipient, result.status, result.resendId, result.error)
    if (result.status === 'sent') emailsSent++
  }

  return Response.json({ success: true, data: { emailsSent } })
}
