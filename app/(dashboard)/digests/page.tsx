import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Badge } from '@/app/_components/ui/badge'
import { listDigestRuns, countDigestRuns } from '@/lib/digest/repository'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  pending: { label: '等待中', variant: 'default' },
  scraping: { label: '抓取中', variant: 'warning' },
  analyzing: { label: '分析中', variant: 'warning' },
  sending: { label: '发送中', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'destructive' },
}

export default async function DigestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr || '1', 10))
  const limit = 20
  const offset = (page - 1) * limit

  const runs = listDigestRuns(limit, offset)
  const total = countDigestRuns()
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">历史记录</h1>
        <p className="text-muted-foreground text-sm mt-1">
          所有 Digest 运行记录
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              暂无运行记录
            </p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <Link
                  key={run.id}
                  href={`/digests/${run.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant={STATUS_MAP[run.status]?.variant ?? 'default'}>
                      {STATUS_MAP[run.status]?.label ?? run.status}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {run.trigger === 'cron' ? '定时触发' : '手动触发'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {JSON.parse(run.languages).join(', ') || '全部语言'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{run.repoCount} 个项目</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(run.startedAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/digests?page=${p}`}
                  className={`px-3 py-1 rounded text-sm ${
                    p === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
