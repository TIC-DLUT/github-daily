import type { DigestEmailData } from './types'
import type { TrendingRepo } from '../scraper/types'
import type { RepoAnalysis } from '../ai/types'

export function compileDigestMarkdown(
  data: DigestEmailData,
  contentTemplate: string
): string {
  const sections: string[] = []

  for (const { repo, analysis } of data.repos) {
    sections.push(applyContentTemplate(contentTemplate, repo, analysis))
  }

  return sections.join('\n\n')
}

function applyContentTemplate(
  template: string,
  repo: TrendingRepo,
  analysis: RepoAnalysis | null
): string {
  let result = template
    .replaceAll('{{repo.author}}', repo.author)
    .replaceAll('{{repo.name}}', repo.name)
    .replaceAll('{{repo.url}}', repo.url)
    .replaceAll('{{repo.description}}', repo.description || '')
    .replaceAll('{{repo.language}}', repo.language || '未知')
    .replaceAll('{{repo.stars}}', formatNumber(repo.stars))
    .replaceAll('{{repo.forks}}', formatNumber(repo.forks))
    .replaceAll('{{repo.currentPeriodStars}}', formatNumber(repo.currentPeriodStars))

  // Handle {{#analysis}}...{{/analysis}} conditional block
  if (analysis) {
    result = result
      .replace(/\{\{#analysis\}\}\n?/, '')
      .replace(/\n?\{\{\/analysis\}\}/, '')
      .replaceAll('{{analysis.summary}}', analysis.summary)
      .replaceAll('{{analysis.problemSolved}}', analysis.problemSolved)
      .replaceAll('{{analysis.useCases}}', analysis.useCases)
      .replaceAll('{{analysis.limitations}}', analysis.limitations)
  } else {
    result = result.replace(/\{\{#analysis\}\}[\s\S]*?\{\{\/analysis\}\}/, '')
  }

  return result
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`
  }
  return String(n)
}
