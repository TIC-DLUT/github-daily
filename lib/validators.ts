import { z } from 'zod/v4'

export const themeSchema = z.object({
  name: z.string().min(1, '主题名称不能为空'),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, '无效的颜色值'),
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, '无效的颜色值'),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, '无效的颜色值'),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, '无效的颜色值'),
  fontFamily: z.string().min(1),
  layout: z.enum(['compact', 'expanded', 'magazine']),
  customCss: z.string().optional(),
})

export const settingsKeySchema = z.enum([
  'cron_schedule',
  'languages',
  'ai_protocol',
  'ai_base_url',
  'ai_api_key',
  'ai_model',
  'email_recipients',
  'email_from',
  'resend_api_key',
])

export type SettingsKey = z.infer<typeof settingsKeySchema>
