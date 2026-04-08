import type { DigestEmailData } from './types'

export function compileDigestMarkdown(data: DigestEmailData): string {
  const { date, languages, repos } = data

  const langLabel = languages.length === 0 || (languages.length === 1 && languages[0] === '')
    ? '全部语言'
    : languages.join(', ')

  const lines: string[] = [
    `# GitHub Trending 日报`,
    ``,
    `**日期**：${date} | **语言**：${langLabel} | **项目数**：${repos.length}`,
    ``,
    `---`,
    ``,
  ]

  for (const { repo, analysis } of repos) {
    lines.push(`## [${repo.author}/${repo.name}](${repo.url})`)
    lines.push(``)

    if (repo.description) {
      lines.push(`> ${repo.description}`)
      lines.push(``)
    }

    const meta: string[] = []
    if (repo.language) meta.push(`**语言**：${repo.language}`)
    meta.push(`**Stars**：${formatNumber(repo.stars)}`)
    meta.push(`**今日新增**：+${formatNumber(repo.currentPeriodStars)}`)
    meta.push(`**Forks**：${formatNumber(repo.forks)}`)
    lines.push(meta.join(' | '))
    lines.push(``)

    if (analysis) {
      lines.push(`### 📋 简介`)
      lines.push(``)
      lines.push(analysis.summary)
      lines.push(``)
      lines.push(`### 🎯 解决的问题`)
      lines.push(``)
      lines.push(analysis.problemSolved)
      lines.push(``)
      lines.push(`### 💡 使用场景`)
      lines.push(``)
      lines.push(analysis.useCases)
      lines.push(``)
      lines.push(`### ⚠️ 目前的不足`)
      lines.push(``)
      lines.push(analysis.limitations)
      lines.push(``)
    }

    lines.push(`---`)
    lines.push(``)
  }

  lines.push(`*由 GitHub Daily 自动生成*`)

  return lines.join('\n')
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`
  }
  return String(n)
}
