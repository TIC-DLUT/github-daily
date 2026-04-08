import { eq, desc } from 'drizzle-orm'
import { getDb } from '../db'
import {
  digestRuns,
  trendingRepos,
  repoAnalyses,
  emailLogs,
} from '../db/schema'
import type { TrendingRepo } from '../scraper/types'
import type { RepoAnalysis } from '../ai/types'

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

// Digest run operations
export function createDigestRun(trigger: 'cron' | 'manual', languages: string[]) {
  const db = getDb()
  const id = generateId()
  db.insert(digestRuns)
    .values({
      id,
      status: 'pending',
      trigger,
      languages: JSON.stringify(languages),
      startedAt: Date.now(),
      repoCount: 0,
      emailSent: 0,
    })
    .run()
  return id
}

export function updateDigestRunStatus(
  id: string,
  status: string,
  extra: { error?: string; repoCount?: number; emailSent?: number; completedAt?: number } = {}
) {
  const db = getDb()
  const set: Record<string, unknown> = { status }
  if (extra.error !== undefined) set.error = extra.error
  if (extra.repoCount !== undefined) set.repoCount = extra.repoCount
  if (extra.emailSent !== undefined) set.emailSent = extra.emailSent
  if (extra.completedAt !== undefined) set.completedAt = extra.completedAt

  db.update(digestRuns).set(set).where(eq(digestRuns.id, id)).run()
}

function getDigestRun(id: string) {
  const db = getDb()
  return db.select().from(digestRuns).where(eq(digestRuns.id, id)).get()
}

export function listDigestRuns(limit = 20, offset = 0) {
  const db = getDb()
  return db
    .select()
    .from(digestRuns)
    .orderBy(desc(digestRuns.startedAt))
    .limit(limit)
    .offset(offset)
    .all()
}

export function countDigestRuns() {
  const db = getDb()
  const result = db
    .select({ count: digestRuns.id })
    .from(digestRuns)
    .all()
  return result.length
}

// Trending repo operations
export function insertTrendingRepo(digestRunId: string, repo: TrendingRepo) {
  const db = getDb()
  const id = generateId()
  db.insert(trendingRepos)
    .values({
      id,
      digestRunId,
      author: repo.author,
      name: repo.name,
      url: repo.url,
      description: repo.description,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      currentPeriodStars: repo.currentPeriodStars,
      builtBy: JSON.stringify(repo.builtBy),
      scrapedAt: Date.now(),
    })
    .run()
  return id
}

export function getReposByRun(digestRunId: string) {
  const db = getDb()
  return db
    .select()
    .from(trendingRepos)
    .where(eq(trendingRepos.digestRunId, digestRunId))
    .all()
}

// Analysis operations
export function insertRepoAnalysis(
  trendingRepoId: string,
  digestRunId: string,
  analysis: RepoAnalysis | null,
  readmeFetched: boolean,
  modelUsed: string,
  tokenUsage: number
) {
  const db = getDb()
  const id = generateId()
  db.insert(repoAnalyses)
    .values({
      id,
      trendingRepoId,
      digestRunId,
      summary: analysis?.summary ?? null,
      problemSolved: analysis?.problemSolved ?? null,
      useCases: analysis?.useCases ?? null,
      limitations: analysis?.limitations ?? null,
      readmeFetched: readmeFetched ? 1 : 0,
      analyzedAt: Date.now(),
      modelUsed,
      tokenUsage,
    })
    .run()
  return id
}

export function getAnalysesByRun(digestRunId: string) {
  const db = getDb()
  return db
    .select()
    .from(repoAnalyses)
    .where(eq(repoAnalyses.digestRunId, digestRunId))
    .all()
}

// Email log operations
export function insertEmailLog(
  digestRunId: string,
  recipient: string,
  status: 'sent' | 'failed' | 'pending',
  resendId?: string,
  error?: string
) {
  const db = getDb()
  const id = generateId()
  db.insert(emailLogs)
    .values({
      id,
      digestRunId,
      recipient,
      status,
      resendId: resendId ?? null,
      sentAt: status === 'sent' ? Date.now() : null,
      error: error ?? null,
    })
    .run()
  return id
}

function getEmailLogsByRun(digestRunId: string) {
  const db = getDb()
  return db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.digestRunId, digestRunId))
    .all()
}

// Full digest detail
export function getDigestRunDetail(id: string) {
  const run = getDigestRun(id)
  if (!run) return null

  const repos = getReposByRun(id)
  const analyses = getAnalysesByRun(id)
  const emails = getEmailLogsByRun(id)

  // Map analyses to repos
  const analysisMap = new Map(analyses.map((a) => [a.trendingRepoId, a]))

  return {
    ...run,
    repos: repos.map((repo) => ({
      ...repo,
      analysis: analysisMap.get(repo.id) ?? null,
    })),
    emails,
  }
}
