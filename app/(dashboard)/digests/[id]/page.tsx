import { DigestDetailClient } from './digest-detail'

export const dynamic = 'force-dynamic'

export default async function DigestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <DigestDetailClient id={id} />
}
