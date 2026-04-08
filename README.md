# GitHub Daily

自托管的 GitHub Trending 每日推送工具。自动抓取 GitHub 热门项目，通过 AI 生成中文分析摘要，以精美的 HTML 邮件形式发送到指定邮箱。提供完整的中文 WebUI 进行配置管理。

## 功能特性

- **GitHub Trending 抓取** — 每日定时抓取 GitHub Trending 列表，支持按语言筛选（全部语言 / 指定单个或多个语言）
- **AI 智能分析** — 自动获取每个项目的 README，交由 AI 生成中文分析，包含简介、解决的问题、使用场景、目前的不足四个维度
- **双协议 AI 支持** — 同时支持 Claude 协议（`@anthropic-ai/sdk`，支持自定义 Base URL）和 OpenAI 兼容协议，可对接各类 AI 服务
- **邮件推送** — 通过 Resend API 发送 HTML 邮件，支持多收件人批量发送
- **自定义邮件模板** — 支持直接编辑 HTML 外层模板和 Markdown 内容模板，实时预览效果，可一键重置为默认
- **定时调度** — 内置 cron 定时任务，支持自定义 cron 表达式和常用预设
- **手动触发** — 支持手动运行，可选择是否发送邮件
- **运行历史** — 查看每次运行的详细信息，包括项目列表、AI 分析结果和邮件预览。支持单个项目重新生成分析、补发邮件
- **全中文 WebUI** — 所有界面、提示、按钮均为中文

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router, React 19) |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS v4 |
| 数据库 | SQLite (better-sqlite3 + Drizzle ORM) |
| 抓取 | Cheerio |
| AI | @anthropic-ai/sdk + openai SDK |
| 邮件 | Resend |
| 定时 | node-cron |
| 包管理 | pnpm |

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装

```bash
git clone <your-repo-url> github-daily
cd github-daily
pnpm install
```

### 配置

复制环境变量文件（如有需要可调整端口等配置）：

```bash
cp .env.example .env
```

### 开发

```bash
pnpm dev
```

访问 http://localhost:3000 打开 WebUI。

### 生产部署

```bash
pnpm build
pnpm start
```

推荐使用 `pm2` 等进程管理工具保持服务运行：

```bash
pm2 start npm --name github-daily -- start
```

## WebUI 配置

首次运行后，在 WebUI 中完成以下配置：

### 1. AI 配置（设置 > AI 配置）

- **协议类型** — 选择 Claude 或 OpenAI 兼容协议
- **Base URL** — API 端点地址（Claude 默认 `https://api.anthropic.com`，可配置中转站地址）
- **API Key** — 你的 AI 服务密钥
- **模型名称** — 使用的模型（如 `claude-sonnet-4-20250514`、`gpt-4o` 等）

### 2. 邮件配置（设置 > 邮件配置）

- **Resend API Key** — 从 [resend.com](https://resend.com) 获取
- **发件人地址** — 已在 Resend 验证的邮箱地址
- **收件人列表** — 批量添加接收邮件的邮箱（每行一个）

### 3. 语言筛选（设置 > 语言筛选）

选择需要关注的编程语言，或勾选"全部语言"获取所有热门项目。

### 4. 定时计划（设置 > 定时计划）

配置自动运行的 cron 表达式，或使用预设（如每天早上 9 点）。

### 5. 邮件模板（设置 > 邮件模板）

直接编辑邮件的 HTML 外层模板和每个项目的 Markdown 内容模板，支持 `{{content}}`、`{{date}}` 等占位符。右侧实时预览效果，可一键重置为默认模板。

## 项目结构

```
app/
  (dashboard)/           — WebUI 页面（仪表盘、历史、设置）
  api/                   — API 路由
  _components/           — UI 组件
lib/
  ai/                    — AI 客户端与分析逻辑
  db/                    — Drizzle ORM schema 与数据库连接
  digest/                — 数据访问层与 pipeline 编排
  email/                 — Resend 邮件发送、HTML 模板与内容模板
  scheduler/             — cron 定时任务管理
  scraper/               — GitHub Trending 抓取与 README 获取
  settings/              — 配置读写
data/                    — SQLite 数据库文件（自动创建）
instrumentation.ts       — 服务启动时初始化数据库迁移和定时任务
```

## 工作流程

1. **抓取** — 从 GitHub Trending 页面抓取指定语言的热门项目列表
2. **分析** — 获取每个项目的 README，通过 AI 生成中文分析（并发限制 3 个）
3. **发送** — 将分析结果编排成 HTML 邮件，通过 Resend 发送给所有收件人
4. 全程状态追踪，可在 WebUI 查看每个阶段的进展

## 许可证

MIT
