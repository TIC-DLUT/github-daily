import { scrapeTrending, scrapeTrendingMultiLanguage } from '../scraper/trending'
import { fetchReadme } from '../scraper/readme'
import { analyzeRepo, analyzeReposWithConcurrency } from '../ai/analyze'
import { sendDigestEmail } from '../email/client'
import { getSetting, getSettingParsed } from '../settings/repository'
import {
  createDigestRun,
  updateDigestRunStatus,
  insertTrendingRepo,
  insertRepoAnalysis,
  insertEmailLog,
  getReposByRun,
  getAnalysesByRun,
  getDigestRunDetail,
} from './repository'
import type { AiConfig, RepoAnalysis } from '../ai/types'
import type { TrendingRepo } from '../scraper/types'
import type { DigestEmailData } from '../email/types'
import { getActiveTemplates } from './theme-repository'

interface PipelineOptions {
  skipEmail?: boolean
}

export async function runDigestPipeline(
  trigger: 'cron' | 'manual',
  options: PipelineOptions = {}
): Promise<string> {
  const languages = getSettingParsed<string[]>('languages')
  const runId = createDigestRun(trigger, languages)

  // Run pipeline async — don't block caller
  executePipeline(runId, languages, options).catch((err) => {
    console.error(`[Pipeline ${runId}] Fatal error:`, err)
    updateDigestRunStatus(runId, 'failed', {
      error: err instanceof Error ? err.message : String(err),
      completedAt: Date.now(),
    })
  })

  return runId
}

async function executePipeline(runId: string, languages: string[], options: PipelineOptions) {
  // Phase 1: Scrape trending repos
  updateDigestRunStatus(runId, 'scraping')

  let allRepos: TrendingRepo[]
  if (languages.length === 0 || (languages.length === 1 && languages[0] === '')) {
    allRepos = await scrapeTrending()
  } else {
    allRepos = await scrapeTrendingMultiLanguage(languages)
  }

  // Insert repos into DB
  const repoIds: string[] = []
  for (const repo of allRepos) {
    const id = insertTrendingRepo(runId, repo)
    repoIds.push(id)
  }

  updateDigestRunStatus(runId, 'analyzing', { repoCount: allRepos.length })

  // Phase 2: Fetch READMEs and analyze with AI
  const aiConfig = getAiConfig()
  const repoDbRows = getReposByRun(runId)

  await analyzeReposWithConcurrency(
    repoDbRows,
    async (repoRow) => {
      const readme = await fetchReadme(repoRow.author, repoRow.name)

      if (readme && aiConfig.apiKey) {
        try {
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
          insertRepoAnalysis(
            repoRow.id,
            runId,
            result,
            true,
            aiConfig.model,
            result.tokenUsage
          )
        } catch (err) {
          console.error(`[Pipeline ${runId}] AI analysis failed for ${repoRow.author}/${repoRow.name}:`, err)
          insertRepoAnalysis(repoRow.id, runId, null, !!readme, aiConfig.model, 0)
        }
      } else {
        insertRepoAnalysis(repoRow.id, runId, null, !!readme, aiConfig.model, 0)
      }
    },
    3 // concurrency limit
  )

  // Phase 3: Send email digest (unless skipped)
  if (options.skipEmail) {
    updateDigestRunStatus(runId, 'completed', {
      emailSent: 0,
      completedAt: Date.now(),
    })
    return
  }

  updateDigestRunStatus(runId, 'sending')

  const resendApiKey = getSetting('resend_api_key')
  const emailFrom = getSetting('email_from')
  const recipients = getSettingParsed<string[]>('email_recipients')

  if (resendApiKey && recipients.length > 0) {
    const detail = getDigestRunDetail(runId)
    if (detail) {
      const analyses = getAnalysesByRun(runId)
      const analysisMap = new Map(analyses.map((a) => [a.trendingRepoId, a]))

      const emailData: DigestEmailData = {
        date: new Date().toISOString().split('T')[0],
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
      const results = await sendDigestEmail(resendApiKey, emailFrom, recipients, emailData, template, contentTemplate)

      let emailsSent = 0
      for (const result of results) {
        insertEmailLog(runId, result.recipient, result.status, result.resendId, result.error)
        if (result.status === 'sent') emailsSent++
      }

      updateDigestRunStatus(runId, 'completed', {
        emailSent: emailsSent > 0 ? 1 : 0,
        completedAt: Date.now(),
      })
    }
  } else {
    // No email config — still mark as completed
    updateDigestRunStatus(runId, 'completed', {
      emailSent: 0,
      completedAt: Date.now(),
    })
  }
}

function getAiConfig(): AiConfig {
  return {
    protocol: getSetting('ai_protocol') as 'claude' | 'openai',
    baseUrl: getSetting('ai_base_url'),
    apiKey: getSetting('ai_api_key'),
    model: getSetting('ai_model'),
  }
}
