import { runDigestPipeline } from '@/lib/digest/pipeline'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const skipEmail = body.skipEmail === true
    const runId = await runDigestPipeline('manual', { skipEmail })
    return Response.json({ success: true, data: { runId } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
