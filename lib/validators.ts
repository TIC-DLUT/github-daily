import { z } from 'zod/v4'

export const themeSchema = z.object({
  name: z.string().min(1, '主题名称不能为空'),
  template: z.string().min(1, '模板内容不能为空').refine(
    (val) => val.includes('{{content}}'),
    '模板必须包含 {{content}} 占位符'
  ),
  contentTemplate: z.string().min(1, '内容模板不能为空'),
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
