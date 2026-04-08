// Default email templates — no server deps, safe to import from client components

export const DEFAULT_CONTENT_TEMPLATE = '## [{{repo.author}}/{{repo.name}}]({{repo.url}})\n\n> {{repo.description}}\n\n**语言**：{{repo.language}} | **Stars**：{{repo.stars}} | **今日新增**：+{{repo.currentPeriodStars}} | **Forks**：{{repo.forks}}\n\n{{#analysis}}\n### 📋 简介\n\n{{analysis.summary}}\n\n### 🎯 解决的问题\n\n{{analysis.problemSolved}}\n\n### 💡 使用场景\n\n{{analysis.useCases}}\n\n### ⚠️ 目前的不足\n\n{{analysis.limitations}}\n{{/analysis}}\n\n---'

export const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Trending 日报 - {{date}}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f0f2f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f0f2f5;
      padding: 32px 0;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    .accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
    }
    .header {
      padding: 32px 32px 20px;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
      letter-spacing: -0.02em;
    }
    .header .meta {
      margin-top: 8px;
      font-size: 13px;
      color: #6b7280;
    }
    .header .meta strong {
      color: #374151;
    }
    .body {
      padding: 24px 32px;
    }
    h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 6px;
      color: #1a1a2e;
    }
    h2 a {
      color: #6366f1;
      text-decoration: none;
    }
    h2 a:hover {
      text-decoration: underline;
    }
    blockquote {
      margin: 0 0 12px;
      padding: 8px 14px;
      border-left: 3px solid #a78bfa;
      background-color: #f9fafb;
      border-radius: 0 6px 6px 0;
      font-size: 14px;
      color: #4b5563;
      font-style: normal;
    }
    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #6366f1;
      margin: 14px 0 4px;
    }
    p {
      margin: 6px 0;
      font-size: 14px;
      color: #374151;
      line-height: 1.7;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 24px 0;
    }
    strong {
      font-weight: 600;
      color: #1f2937;
    }
    em {
      font-style: normal;
      font-size: 13px;
      color: #9ca3af;
    }
    .footer {
      padding: 20px 32px;
      text-align: center;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
    }
    .footer a {
      color: #6366f1;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="accent-bar"></div>
      <div class="header">
        <h1>GitHub Trending 日报</h1>
        <p class="meta"><strong>{{date}}</strong> &middot; {{languageLabel}} &middot; {{repoCount}} 个项目</p>
      </div>
      <div class="body">
        {{content}}
      </div>
      <div class="footer">
        由 <a href="https://github.com">GitHub Daily</a> 自动生成 &middot; {{year}}
      </div>
    </div>
  </div>
</body>
</html>`
