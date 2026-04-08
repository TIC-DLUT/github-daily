import * as cheerio from 'cheerio'
import type { TrendingRepo, ScrapeOptions, Contributor } from './types'

const BASE_URL = 'https://github.com/trending'
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export async function scrapeTrending(options: ScrapeOptions = {}): Promise<TrendingRepo[]> {
  const { language = '', since = 'daily' } = options
  const url = language
    ? `${BASE_URL}/${encodeURIComponent(language)}?since=${since}`
    : `${BASE_URL}?since=${since}`

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch trending: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  return parseTrendingHtml(html)
}

function parseTrendingHtml(html: string): TrendingRepo[] {
  const $ = cheerio.load(html)
  const repos: TrendingRepo[] = []

  $('article.Box-row').each((_, element) => {
    const el = $(element)

    // Repo name and author
    const repoLink = el.find('h2 a').attr('href')?.trim()
    if (!repoLink) return

    const parts = repoLink.replace(/^\//, '').split('/')
    if (parts.length < 2) return

    const author = parts[0]
    const name = parts[1]

    // Description
    const description = el.find('p').first().text().trim() || null

    // Language
    const language = el.find('[itemprop="programmingLanguage"]').text().trim() || null
    const languageColor = el.find('.repo-language-color').css('background-color') || null

    // Stars and forks
    const statsLinks = el.find('a.Link--muted.d-inline-block')
    const stars = parseNumber(statsLinks.filter('[href$="/stargazers"]').text())
    const forks = parseNumber(statsLinks.filter('[href$="/forks"]').text())

    // Current period stars
    const periodStarsText = el.find('.d-inline-block.float-sm-right').text().trim()
    const currentPeriodStars = parseNumber(periodStarsText)

    // Built by
    const builtBy: Contributor[] = []
    el.find('span.d-inline-block img.avatar').each((_, img) => {
      const avatar = $(img).attr('src') || ''
      const username = $(img).attr('alt')?.replace(/^@/, '') || ''
      if (username) {
        builtBy.push({ username, avatar })
      }
    })

    repos.push({
      author,
      name,
      url: `https://github.com/${author}/${name}`,
      description,
      language,
      languageColor,
      stars,
      forks,
      currentPeriodStars,
      builtBy,
    })
  })

  return repos
}

function parseNumber(text: string): number {
  const cleaned = text.replace(/[^0-9.]/g, '').trim()
  if (!cleaned) return 0
  return Math.round(Number.parseFloat(cleaned))
}

export async function scrapeTrendingMultiLanguage(
  languages: string[]
): Promise<TrendingRepo[]> {
  const allRepos: TrendingRepo[] = []
  const seen = new Set<string>()

  for (const lang of languages) {
    const repos = await scrapeTrending({ language: lang })
    for (const repo of repos) {
      const key = `${repo.author}/${repo.name}`
      if (!seen.has(key)) {
        seen.add(key)
        allRepos.push(repo)
      }
    }
  }

  return allRepos
}
