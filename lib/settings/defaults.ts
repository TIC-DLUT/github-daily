import type { SettingsKey } from '../validators'

export const SETTINGS_DEFAULTS: Record<SettingsKey, string> = {
  cron_schedule: '0 9 * * *',
  languages: '[""]',
  ai_protocol: 'claude',
  ai_base_url: 'https://api.anthropic.com',
  ai_api_key: '',
  ai_model: 'claude-sonnet-4-20250514',
  email_recipients: '[]',
  email_from: 'GitHub Daily <noreply@resend.dev>',
  resend_api_key: '',
}
