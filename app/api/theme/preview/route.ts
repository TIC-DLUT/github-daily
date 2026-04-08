import { renderPreviewHtml } from '@/lib/email/templates'
import { DEFAULT_TEMPLATE, DEFAULT_CONTENT_TEMPLATE } from '@/lib/email/default-template'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const template: string = body.template || DEFAULT_TEMPLATE
    const contentTemplate: string = body.contentTemplate || DEFAULT_CONTENT_TEMPLATE

    const html = renderPreviewHtml(template, contentTemplate)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
