import { marked } from 'marked'
import type { DigestEmailData } from './types'
import { compileDigestMarkdown } from './markdown'
import { DEFAULT_CONTENT_TEMPLATE } from './default-template'

const SAMPLE_DIGEST_DATA: DigestEmailData = {
  date: new Date().toISOString().split('T')[0],
  languages: ['TypeScript', 'Python'],
  repos: [
    {
      repo: {
        author: 'vercel',
        name: 'next.js',
        url: 'https://github.com/vercel/next.js',
        description: 'The React Framework for the Web',
        language: 'TypeScript',
        languageColor: '#3178c6',
        stars: 128000,
        forks: 27000,
        currentPeriodStars: 1250,
        builtBy: [],
      },
      analysis: {
        summary: '一个基于 React 的全栈 Web 框架，支持服务端渲染、静态生成、API 路由等功能，是目前最流行的 React 生产级框架之一。',
        problemSolved: '解决了传统 React SPA 在 SEO、首屏加载速度和开发体验方面的不足，提供了开箱即用的路由、数据获取和部署方案。',
        useCases: '1. 企业级 Web 应用开发\n2. 内容驱动型网站和博客\n3. 电商平台前端',
        limitations: '1. 学习曲线较陡，概念较多\n2. 构建时间随项目规模增长\n3. 部分高级功能对 Vercel 平台有依赖',
      },
    },
    {
      repo: {
        author: 'langchain-ai',
        name: 'langchain',
        url: 'https://github.com/langchain-ai/langchain',
        description: 'Build context-aware reasoning applications',
        language: 'Python',
        languageColor: '#3572A5',
        stars: 95000,
        forks: 15200,
        currentPeriodStars: 890,
        builtBy: [],
      },
      analysis: {
        summary: '一个用于构建 LLM 应用的开发框架，提供了链式调用、Agent、RAG 等核心抽象，支持多种模型和数据源的集成。',
        problemSolved: '解决了 LLM 应用开发中模型对接繁琐、上下文管理困难、工具调用复杂等问题。',
        useCases: '1. 智能客服和对话系统\n2. 文档问答与知识库检索\n3. 自动化工作流与 Agent 开发',
        limitations: '1. API 变化频繁，版本兼容性差\n2. 抽象层较重，简单场景显冗余\n3. 调试和可观测性有待提升',
      },
    },
  ],
}

function applyHtmlTemplate(
  template: string,
  contentHtml: string,
  date: string,
  languageLabel: string,
  repoCount: number
): string {
  return template
    .replaceAll('{{content}}', contentHtml)
    .replaceAll('{{date}}', date)
    .replaceAll('{{languageLabel}}', languageLabel)
    .replaceAll('{{repoCount}}', String(repoCount))
    .replaceAll('{{year}}', String(new Date().getFullYear()))
}

export function renderDigestHtml(
  data: DigestEmailData,
  template: string,
  contentTemplate: string
): string {
  const markdown = compileDigestMarkdown(data, contentTemplate)
  const bodyHtml = marked.parse(markdown, { breaks: true }) as string

  const langLabel =
    data.languages.length === 0 || (data.languages.length === 1 && data.languages[0] === '')
      ? '全部语言'
      : data.languages.join(', ')

  return applyHtmlTemplate(template, bodyHtml, data.date, langLabel, data.repos.length)
}

export function renderPreviewHtml(template: string, contentTemplate: string): string {
  return renderDigestHtml(SAMPLE_DIGEST_DATA, template, contentTemplate)
}
