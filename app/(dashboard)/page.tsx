import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Badge } from '@/app/_components/ui/badge'
import { listDigestRuns, countDigestRuns } from '@/lib/digest/repository'
import { getSetting } from '@/lib/settings/repository'
import { getSchedulerStatus } from '@/lib/scheduler/cron'
import Link from 'next/link'
import { TriggerButton } from './trigger-button'

export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  pending: { label: '等待中', variant: 'default' },
  scraping: { label: '抓取中', variant: 'warning' },
  analyzing: { label: '分析中', variant: 'warning' },
  sending: { label: '发送中', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'destructive' },
}

export default function DashboardPage() {
  const recentRuns = listDigestRuns(5)
  const cronExpression = getSetting('cron_schedule')
  const totalRuns = countDigestRuns()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <p className="text-muted-foreground text-sm mt-1">
            GitHub Trending 每日推送概览
          </p>
        </div>
        <TriggerButton />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">定时计划</p>
            <p className="text-lg font-semibold font-mono mt-1">{cronExpression}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">总运行次数</p>
            <p className="text-2xl font-bold mt-1">{totalRuns}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">最近状态</p>
            <div className="mt-1">
              {recentRuns[0] ? (
                <Badge variant={STATUS_MAP[recentRuns[0].status]?.variant ?? 'default'}>
                  {STATUS_MAP[recentRuns[0].status]?.label ?? recentRuns[0].status}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">暂无记录</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Runs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>最近运行</CardTitle>
            <Link
              href="/digests"
              className="text-sm text-primary hover:underline"
            >
              查看全部
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              还没有运行记录，点击右上角「立即运行」开始
            </p>
          ) : (
            <div className="space-y-3">
              {recentRuns.map((run) => (
                <Link
                  key={run.id}
                  href={`/digests/${run.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_MAP[run.status]?.variant ?? 'default'}>
                      {STATUS_MAP[run.status]?.label ?? run.status}
                    </Badge>
                    <span className="text-sm">
                      {run.trigger === 'cron' ? '定时触发' : '手动触发'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {run.repoCount} 个项目
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(run.startedAt).toLocaleString('zh-CN')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
