import { marked } from 'marked'
import type { DigestEmailData, EmailThemeConfig } from './types'
import { compileDigestMarkdown } from './markdown'

export function renderDigestHtml(
  data: DigestEmailData,
  theme: EmailThemeConfig
): string {
  const markdown = compileDigestMarkdown(data)
  const bodyHtml = marked.parse(markdown, { breaks: true }) as string
  return wrapInEmailTemplate(bodyHtml, theme, data.date)
}

export function renderPreviewHtml(
  theme: EmailThemeConfig,
  sampleHtml?: string
): string {
  const html = sampleHtml || getSampleHtml()
  return wrapInEmailTemplate(html, theme, new Date().toISOString().split('T')[0])
}

function wrapInEmailTemplate(
  bodyHtml: string,
  theme: EmailThemeConfig,
  date: string
): string {
  const { primaryColor, bgColor, textColor, accentColor, fontFamily, customCss } = theme

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Trending 日报 - ${date}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${bgColor};
      color: ${textColor};
      font-family: ${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
    }
    .container {
      max-width: 680px;
      margin: 0 auto;
      padding: 32px 24px;
    }
    h1 {
      color: ${primaryColor};
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px;
      letter-spacing: -0.02em;
    }
    h2 {
      color: ${primaryColor};
      font-size: 20px;
      font-weight: 600;
      margin: 24px 0 8px;
    }
    h2 a {
      color: ${primaryColor};
      text-decoration: none;
    }
    h2 a:hover {
      text-decoration: underline;
    }
    h3 {
      color: ${accentColor};
      font-size: 15px;
      font-weight: 600;
      margin: 16px 0 4px;
    }
    p {
      margin: 8px 0;
      font-size: 15px;
    }
    blockquote {
      border-left: 3px solid ${accentColor};
      margin: 8px 0;
      padding: 4px 16px;
      color: ${textColor}cc;
      font-style: italic;
    }
    hr {
      border: none;
      border-top: 1px solid ${textColor}20;
      margin: 24px 0;
    }
    strong {
      font-weight: 600;
    }
    em {
      color: ${textColor}99;
      font-size: 13px;
    }
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 2px solid ${primaryColor};
      margin-bottom: 32px;
    }
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid ${textColor}20;
      color: ${textColor}80;
      font-size: 13px;
    }
    ${customCss || ''}
  </style>
</head>
<body>
  <div class="container">
    ${bodyHtml}
  </div>
</body>
</html>`
}

function getSampleHtml(): string {
  return `
<div class="header">
  <h1>GitHub Trending 日报</h1>
  <p><strong>日期</strong>：2024-01-01 | <strong>语言</strong>：TypeScript, Python | <strong>项目数</strong>：3</p>
</div>
<hr>
<h2><a href="#">example/awesome-project</a></h2>
<blockquote>一个示例项目，用于展示邮件模板效果</blockquote>
<p><strong>语言</strong>：TypeScript | <strong>Stars</strong>：12.5k | <strong>今日新增</strong>：+1.2k | <strong>Forks</strong>：890</p>
<h3>📋 简介</h3>
<p>这是一个功能强大的开源工具，专注于提升开发者的工作效率。</p>
<h3>🎯 解决的问题</h3>
<p>解决了传统开发流程中重复性工作多、效率低下的问题。</p>
<h3>💡 使用场景</h3>
<p>适用于大型项目的自动化构建、测试和部署流程。</p>
<h3>⚠️ 目前的不足</h3>
<p>文档尚不完善，对新手不太友好。</p>
<hr>
<div class="footer"><em>由 GitHub Daily 自动生成</em></div>`
}
