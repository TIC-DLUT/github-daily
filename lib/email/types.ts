import type { TrendingRepo } from '../scraper/types'
import type { RepoAnalysis } from '../ai/types'

export interface EmailThemeConfig {
  primaryColor: string
  bgColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  layout: 'compact' | 'expanded' | 'magazine'
  customCss?: string
}

export interface DigestEmailData {
  date: string
  languages: string[]
  repos: Array<{
    repo: TrendingRepo
    analysis: RepoAnalysis | null
  }>
}