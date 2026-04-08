import { getDigestRunDetail } from '@/lib/digest/repository'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Badge } from '@/app/_components/ui/badge'
import { notFound } from 'next/navigation'
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

export default async function DigestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = getDigestRunDetail(id)

  if (!detail) notFound()

  const languages: string[] = JSON.parse(detail.languages)

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
        <Badge variant={STATUS_MAP[detail.status]?.variant ?? 'default'} className="text-sm px-3 py-1">
          {STATUS_MAP[detail.status]?.label ?? detail.status}
        </Badge>
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
      {detail.status === 'completed' && detail.repos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">邮件预览</h2>
          <Card>
            <CardContent className="pt-6">
              <iframe
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
        <h2 className="text-lg font-semibold">项目列表</h2>
        {detail.repos.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无项目数据</p>
        ) : (
          detail.repos.map((item) => (
            <Card key={item.id}>
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

              {item.analysis && (
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">简介</p>
                    <p className="text-muted-foreground">{item.analysis.summary}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">解决的问题</p>
                    <p className="text-muted-foreground">{item.analysis.problemSolved}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">使用场景</p>
                    <p className="text-muted-foreground">{item.analysis.useCases}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">目前的不足</p>
                    <p className="text-muted-foreground">{item.analysis.limitations}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
