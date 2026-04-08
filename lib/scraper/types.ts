export interface TrendingRepo {
  author: string
  name: string
  url: string
  description: string | null
  language: string | null
  languageColor: string | null
  stars: number
  forks: number
  currentPeriodStars: number
  builtBy: Contributor[]
}

export interface Contributor {
  username: string
  avatar: string
}

export interface ScrapeOptions {
  language?: string
  since?: 'daily' | 'weekly' | 'monthly'
}
