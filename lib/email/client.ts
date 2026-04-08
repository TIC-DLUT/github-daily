import { Resend } from 'resend'
import type { DigestEmailData } from './types'
import { renderDigestHtml } from './templates'

interface SendResult {
  recipient: string
  status: 'sent' | 'failed'
  resendId?: string
  error?: string
}

export async function sendDigestEmail(
  apiKey: string,
  from: string,
  recipients: string[],
  data: DigestEmailData,
  template: string,
  contentTemplate: string
): Promise<SendResult[]> {
  const resend = new Resend(apiKey)
  const html = renderDigestHtml(data, template, contentTemplate)
  const subject = `GitHub Trending 日报 - ${data.date}`

  const results: SendResult[] = []

  // Use batch send for multiple recipients
  if (recipients.length > 1) {
    const emails = recipients.map((to) => ({
      from,
      to: [to],
      subject,
      html,
    }))

    try {
      const { data: batchData, error } = await resend.batch.send(emails)

      if (error) {
        return recipients.map((r) => ({
          recipient: r,
          status: 'failed' as const,
          error: error.message,
        }))
      }

      return recipients.map((r, i) => ({
        recipient: r,
        status: 'sent' as const,
        resendId: batchData?.data?.[i]?.id,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return recipients.map((r) => ({
        recipient: r,
        status: 'failed' as const,
        error: message,
      }))
    }
  }

  // Single recipient
  for (const to of recipients) {
    try {
      const { data: emailData, error } = await resend.emails.send({
        from,
        to: [to],
        subject,
        html,
      })

      if (error) {
        results.push({ recipient: to, status: 'failed', error: error.message })
      } else {
        results.push({ recipient: to, status: 'sent', resendId: emailData?.id })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      results.push({ recipient: to, status: 'failed', error: message })
    }
  }

  return results
}
