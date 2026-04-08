import { getDigestRunDetail } from '@/lib/digest/repository'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const detail = getDigestRunDetail(id)

  if (!detail) {
    return Response.json({ success: false, error: '未找到该运行记录' }, { status: 404 })
  }

  return Response.json({ success: true, data: detail })
}
