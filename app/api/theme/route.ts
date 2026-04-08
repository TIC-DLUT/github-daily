import {
  listThemes,
  createTheme,
  updateTheme,
} from '@/lib/digest/theme-repository'
import { themeSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  const themes = listThemes()
  return Response.json({ success: true, data: themes })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = themeSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? '无效的主题配置' },
        { status: 400 }
      )
    }

    const id = createTheme(parsed.data.name, parsed.data, body.activate ?? false)
    return Response.json({ success: true, data: { id } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...rest } = body

    if (!id) {
      return Response.json({ success: false, error: '缺少主题 ID' }, { status: 400 })
    }

    const parsed = themeSchema.safeParse(rest)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? '无效的主题配置' },
        { status: 400 }
      )
    }

    updateTheme(id, parsed.data.name, parsed.data, body.activate ?? false)
    return Response.json({ success: true, data: { updated: true } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
