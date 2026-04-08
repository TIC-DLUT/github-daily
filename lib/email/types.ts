import type { TrendingRepo } from '../scraper/types'
import type { RepoAnalysis } from '../ai/types'

export interface DigestEmailData {
  date: string
  languages: string[]
  repos: Array<{
    repo: TrendingRepo
    analysis: RepoAnalysis | null
  }>
}
