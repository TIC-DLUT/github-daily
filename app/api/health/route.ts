import { getSchedulerStatus } from '@/lib/scheduler/cron'
import { listDigestRuns } from '@/lib/digest/repository'

export const dynamic = 'force-dynamic'

export async function GET() {
  const scheduler = getSchedulerStatus()
  const recentRuns = listDigestRuns(1)
  const lastRun = recentRuns[0] ?? null

  return Response.json({
    success: true,
    data: {
      status: 'ok',
      scheduler: {
        running: scheduler.running,
        expression: scheduler.expression,
      },
      lastRun: lastRun
        ? {
            id: lastRun.id,
            status: lastRun.status,
            startedAt: lastRun.startedAt,
            completedAt: lastRun.completedAt,
          }
        : null,
    },
  })
}
