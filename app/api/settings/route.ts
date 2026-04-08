import { getAllSettings, setSetting, getSetting } from '@/lib/settings/repository'
import { updateSchedule } from '@/lib/scheduler/cron'
import { settingsKeySchema } from '@/lib/validators'
import type { SettingsKey } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  const allSettings = getAllSettings()
  return Response.json({ success: true, data: allSettings })
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { key, value } = body as { key: string; value: string }

    const parsed = settingsKeySchema.safeParse(key)
    if (!parsed.success) {
      return Response.json({ success: false, error: '无效的设置项' }, { status: 400 })
    }

    setSetting(parsed.data, value)

    // If cron schedule changed, update the scheduler
    if (parsed.data === 'cron_schedule') {
      updateSchedule(value)
    }

    return Response.json({ success: true, data: { updated: true } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
