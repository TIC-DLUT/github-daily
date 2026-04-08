import cron from 'node-cron'
import { runDigestPipeline } from '../digest/pipeline'

let scheduledTask: ReturnType<typeof cron.schedule> | null = null
let currentExpression: string | null = null

export function startScheduler(cronExpression: string): void {
  stopScheduler()

  if (!cron.validate(cronExpression)) {
    console.error(`[Scheduler] Invalid cron expression: ${cronExpression}`)
    return
  }

  currentExpression = cronExpression
  scheduledTask = cron.schedule(cronExpression, () => {
    console.log(`[Scheduler] Triggering digest pipeline at ${new Date().toISOString()}`)
    runDigestPipeline('cron')
  })

  console.log(`[Scheduler] Started with expression: ${cronExpression}`)
}

function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
    currentExpression = null
    console.log('[Scheduler] Stopped')
  }
}

export function updateSchedule(newExpression: string): void {
  startScheduler(newExpression)
}

export function getSchedulerStatus(): {
  running: boolean
  expression: string | null
} {
  return {
    running: scheduledTask !== null,
    expression: currentExpression,
  }
}
