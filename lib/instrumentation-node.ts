import { join } from 'path'
import { getDb } from './db'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { startScheduler } from './scheduler/cron'
import { getSetting } from './settings/repository'

console.log('[Instrumentation] Initializing server...')

const db = getDb()
migrate(db, { migrationsFolder: join(process.cwd(), 'lib/db/migrations') })
console.log('[Instrumentation] Database migrations applied')

const cronExpression = getSetting('cron_schedule')
startScheduler(cronExpression)
console.log(`[Instrumentation] Scheduler started with: ${cronExpression}`)
