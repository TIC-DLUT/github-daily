'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Badge } from '@/app/_components/ui/badge'
import { Button } from '@/app/_components/ui/button'
import { RefreshCw, Mail } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  pending: { label: '等待中', variant: 'default' },
  scraping: { label: '抓取中', variant: 'warning' },
  analyzing: { label: '分析中', variant: 'warning' },
  sending: { label: '发送中', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'destructive' },
}

const IN_PROGRESS_STATUSES = new Set(['pending', 'scraping', 'analyzing', 'sending'])

interface RepoItem {
  id: string
  author: string
  name: string
  url: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  currentPeriodStars: number
  analysis: {
    summary: string | null
    problemSolved: string | null
    useCases: string | null
    limitations: string | null
  } | null
}

interface DigestDetail {
  id: string
  status: string
  trigger: string
  languages: string
  startedAt: number
  repoCount: number
  emailSent: number
  error: string | null
  repos: RepoItem[]
}

export function DigestDetailClient({ id }: { id: string }) {
  const [detail, setDetail] = useState<DigestDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [reanalyzing, setReanalyzing] = useState<Set<string>>(new Set())
  const [sendingEmail, setSendingEmail] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/digest/${id}`)
      const data = await res.json()
      if (data.success) {
        setDetail(data.data)
      } else {
        setNotFound(true)
      }
    } catch {
      // Silently retry on next poll
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  useEffect(() => {
    if (!detail || !IN_PROGRESS_STATUSES.has(detail.status)) return

    const timer = setInterval(fetchDetail, 2000)
    return () => clearInterval(timer)
  }, [detail, fetchDetail])

  async function handleReanalyze(repoId: string) {
    setReanalyzing((prev) => new Set(prev).add(repoId))
    try {
      const res = await fetch(`/api/digest/${id}/reanalyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('重新生成完成')
        await fetchDetail()
        setPreviewKey((k) => k + 1)
      } else {
        toast.error('重新生成失败', { description: data.error })
      }
    } catch {
      toast.error('网络错误')
    } finally {
      setReanalyzing((prev) => {
        const next = new Set(prev)
        next.delete(repoId)
        return next
      })
    }
  }

  async function handleSendEmail() {
    setSendingEmail(true)
    try {
      const res = await fetch(`/api/digest/${id}/resend`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success('邮件发送成功', { description: `已发送 ${data.data.emailsSent} 封` })
        await fetchDetail()
      } else {
        toast.error('发送失败', { description: data.error })
      }
    } catch {
      toast.error('网络错误')
    } finally {
      setSendingEmail(false)
    }
  }

  if (notFound) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">未找到该运行记录</p>
        <Link href="/digests" className="text-sm text-primary hover:underline mt-2 inline-block">
          返回历史
        </Link>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        <div className="h-12 w-64 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const languages: string[] = JSON.parse(detail.languages)
  const isRunning = IN_PROGRESS_STATUSES.has(detail.status)
  const isCompleted = detail.status === 'completed'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/digests" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; 返回
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">运行详情</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date(detail.startedAt).toLocaleString('zh-CN')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isCompleted && !detail.emailSent && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSendEmail}
              disabled={sendingEmail}
            >
              <Mail className="h-4 w-4" />
              {sendingEmail ? '发送中...' : '发送邮件'}
            </Button>
          )}
          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-warning" />
              </span>
            )}
            <Badge variant={STATUS_MAP[detail.status]?.variant ?? 'default'} className="text-sm px-3 py-1">
              {STATUS_MAP[detail.status]?.label ?? detail.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Run metadata */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">触发方式</p>
            <p className="text-sm font-medium mt-1">
              {detail.trigger === 'cron' ? '定时触发' : '手动触发'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">语言</p>
            <p className="text-sm font-medium mt-1">
              {languages.filter(Boolean).join(', ') || '全部'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">项目数</p>
            <p className="text-sm font-medium mt-1">{detail.repoCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">邮件</p>
            <p className="text-sm font-medium mt-1">
              {detail.emailSent ? '已发送' : '未发送'}
            </p>
          </CardContent>
        </Card>
      </div>

      {detail.error && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">{detail.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Email preview */}
      {isCompleted && detail.repos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">邮件预览</h2>
          <Card>
            <CardContent className="pt-6">
              <iframe
                key={previewKey}
                src={`/api/digest/${id}/preview`}
                className="w-full h-[600px] rounded-md border border-border"
                title="邮件预览"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Repo list with analyses */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          项目列表
          {isRunning && detail.repos.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              已分析 {detail.repos.filter((r) => r.analysis).length} / {detail.repos.length}
            </span>
          )}
        </h2>
        {detail.repos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isRunning ? '正在抓取项目...' : '暂无项目数据'}
          </p>
        ) : (
          detail.repos.map((item) => (
            <RepoCard
              key={item.id}
              item={item}
              isRunning={isRunning}
              isReanalyzing={reanalyzing.has(item.id)}
              onReanalyze={() => handleReanalyze(item.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function RepoCard({
  item,
  isRunning,
  isReanalyzing,
  onReanalyze,
}: {
  item: RepoItem
  isRunning: boolean
  isReanalyzing: boolean
  onReanalyze: () => void
}) {
  const hasAnalysis = item.analysis && (
    item.analysis.summary || item.analysis.problemSolved ||
    item.analysis.useCases || item.analysis.limitations
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {item.author}/{item.name}
            </a>
          </CardTitle>
          <div className="flex items-center gap-2">
            {item.language && (
              <Badge variant="outline">{item.language}</Badge>
            )}
            <Badge variant="default">+{item.currentPeriodStars}</Badge>
          </div>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {item.description}
          </p>
        )}
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span>Stars: {item.stars.toLocaleString()}</span>
          <span>Forks: {item.forks.toLocaleString()}</span>
        </div>
      </CardHeader>

      {hasAnalysis ? (
        <CardContent className="space-y-3 text-sm">
          <AnalysisSection title="简介" content={item.analysis!.summary} />
          <AnalysisSection title="解决的问题" content={item.analysis!.problemSolved} />
          <AnalysisSection title="使用场景" content={item.analysis!.useCases} />
          <AnalysisSection title="目前的不足" content={item.analysis!.limitations} />
          <div className="pt-1">
            <button
              onClick={onReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isReanalyzing ? 'animate-spin' : ''}`} />
              {isReanalyzing ? '重新生成中...' : '重新生成'}
            </button>
          </div>
        </CardContent>
      ) : isRunning ? (
        <CardContent>
          <p className="text-sm text-muted-foreground animate-pulse">分析中...</p>
        </CardContent>
      ) : (
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">分析数据为空</p>
            <button
              onClick={onReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isReanalyzing ? 'animate-spin' : ''}`} />
              {isReanalyzing ? '生成中...' : '生成分析'}
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function AnalysisSection({ title, content }: { title: string; content: string | null }) {
  if (!content) return null

  return (
    <div>
      <p className="font-medium text-foreground">{title}</p>
      <div className="text-muted-foreground whitespace-pre-line">{content}</div>
    </div>
  )
}
