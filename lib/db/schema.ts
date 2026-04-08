import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// Settings: key-value store for all app configuration
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
})

// Digest runs: each pipeline execution
export const digestRuns = sqliteTable('digest_runs', {
  id: text('id').primaryKey(),
  status: text('status', {
    enum: ['pending', 'scraping', 'analyzing', 'sending', 'completed', 'failed'],
  }).notNull(),
  trigger: text('trigger', { enum: ['cron', 'manual'] }).notNull(),
  languages: text('languages').notNull(), // JSON array
  startedAt: integer('started_at', { mode: 'number' }).notNull(),
  completedAt: integer('completed_at', { mode: 'number' }),
  error: text('error'),
  repoCount: integer('repo_count').notNull().default(0),
  emailSent: integer('email_sent').notNull().default(0), // boolean 0/1
})

// Trending repos: raw scraped data per run
export const trendingRepos = sqliteTable('trending_repos', {
  id: text('id').primaryKey(),
  digestRunId: text('digest_run_id').notNull().references(() => digestRuns.id),
  author: text('author').notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  language: text('language'),
  stars: integer('stars').notNull(),
  forks: integer('forks').notNull(),
  currentPeriodStars: integer('current_period_stars').notNull(),
  builtBy: text('built_by'), // JSON array of {username, avatar}
  scrapedAt: integer('scraped_at', { mode: 'number' }).notNull(),
})

// Repo analyses: AI-generated analysis per repo
export const repoAnalyses = sqliteTable('repo_analyses', {
  id: text('id').primaryKey(),
  trendingRepoId: text('trending_repo_id')
    .notNull()
    .references(() => trendingRepos.id),
  digestRunId: text('digest_run_id')
    .notNull()
    .references(() => digestRuns.id),
  summary: text('summary'),
  problemSolved: text('problem_solved'),
  useCases: text('use_cases'),
  limitations: text('limitations'),
  readmeFetched: integer('readme_fetched').notNull(), // boolean 0/1
  analyzedAt: integer('analyzed_at', { mode: 'number' }).notNull(),
  modelUsed: text('model_used'),
  tokenUsage: integer('token_usage'),
})

// Email logs: record of every email sent/attempted
export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  digestRunId: text('digest_run_id')
    .notNull()
    .references(() => digestRuns.id),
  recipient: text('recipient').notNull(),
  status: text('status', { enum: ['sent', 'failed', 'pending'] }).notNull(),
  resendId: text('resend_id'),
  sentAt: integer('sent_at', { mode: 'number' }),
  error: text('error'),
})

// Email themes: theme presets
export const emailThemes = sqliteTable('email_themes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isActive: integer('is_active').notNull().default(0), // boolean 0/1
  primaryColor: text('primary_color').notNull(),
  bgColor: text('bg_color').notNull(),
  textColor: text('text_color').notNull(),
  accentColor: text('accent_color').notNull(),
  fontFamily: text('font_family').notNull(),
  layout: text('layout', { enum: ['compact', 'expanded', 'magazine'] }).notNull(),
  customCss: text('custom_css'),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
})
