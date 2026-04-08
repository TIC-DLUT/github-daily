import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { settings } from '../db/schema'
import { SETTINGS_DEFAULTS } from './defaults'
import type { SettingsKey } from '../validators'

const SENSITIVE_KEYS: SettingsKey[] = ['ai_api_key', 'resend_api_key']

export function getSetting(key: SettingsKey): string {
  const db = getDb()
  const row = db.select().from(settings).where(eq(settings.key, key)).get()
  return row?.value ?? SETTINGS_DEFAULTS[key]
}

export function setSetting(key: SettingsKey, value: string): void {
  const db = getDb()

  db.insert(settings)
    .values({ key, value, updatedAt: Date.now() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: Date.now() },
    })
    .run()
}

export function getAllSettings(): Record<string, string> {
  const db = getDb()
  const rows = db.select().from(settings).all()

  const result: Record<string, string> = { ...SETTINGS_DEFAULTS }

  for (const row of rows) {
    if (SENSITIVE_KEYS.includes(row.key as SettingsKey) && row.value) {
      result[row.key] = row.value.slice(0, 4) + '****' + row.value.slice(-4)
    } else {
      result[row.key] = row.value
    }
  }

  return result
}

export function getSettingParsed<T>(key: SettingsKey): T {
  const raw = getSetting(key)
  return JSON.parse(raw) as T
}
