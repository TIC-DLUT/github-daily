import { renderPreviewHtml } from '@/lib/email/templates'
import type { EmailThemeConfig } from '@/lib/email/types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const theme: EmailThemeConfig = {
      primaryColor: body.primaryColor || '#0ea5e9',
      bgColor: body.bgColor || '#ffffff',
      textColor: body.textColor || '#171717',
      accentColor: body.accentColor || '#f59e0b',
      fontFamily: body.fontFamily || "'Helvetica Neue', Arial, sans-serif",
      layout: body.layout || 'expanded',
      customCss: body.customCss,
    }

    const html = renderPreviewHtml(theme)
    return Response.json({ success: true, data: { html } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
