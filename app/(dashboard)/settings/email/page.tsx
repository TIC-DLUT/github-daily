'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Input } from '@/app/_components/ui/input'
import { Button } from '@/app/_components/ui/button'
import { toast } from 'sonner'

export default function EmailConfigPage() {
  const [recipients, setRecipients] = useState<string[]>([])
  const [emailFrom, setEmailFrom] = useState('GitHub Daily <noreply@resend.dev>')
  const [resendKey, setResendKey] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const d = data.data
          if (d.email_recipients) setRecipients(JSON.parse(d.email_recipients))
          if (d.email_from) setEmailFrom(d.email_from)
        }
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const cleaned = [...new Set(recipients.map((r) => r.trim()).filter(Boolean))]
      setRecipients(cleaned)
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'email_recipients', value: JSON.stringify(cleaned) }),
      })
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'email_from', value: emailFrom }),
      })
      if (resendKey && !resendKey.includes('****')) {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'resend_api_key', value: resendKey }),
        })
      }
      toast.success('邮件配置已更新')
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <Input
          id="resendKey"
          label="Resend API Key"
          type="password"
          value={resendKey}
          onChange={(e) => setResendKey(e.target.value)}
          placeholder="输入新的 API Key（留空则不修改）"
        />

        <Input
          id="emailFrom"
          label="发件人"
          value={emailFrom}
          onChange={(e) => setEmailFrom(e.target.value)}
          placeholder="GitHub Daily <noreply@resend.dev>"
        />

        <div>
          <p className="text-sm font-medium mb-1">收件人列表</p>
          <p className="text-xs text-muted-foreground mb-2">每行一个邮箱地址</p>
          <textarea
            value={recipients.join('\n')}
            onChange={(e) => {
              const lines = e.target.value.split('\n')
              setRecipients(lines)
            }}
            onBlur={() => {
              // Clean up on blur: trim, remove empty lines, deduplicate
              const cleaned = [...new Set(
                recipients
                  .map((r) => r.trim())
                  .filter(Boolean)
              )]
              setRecipients(cleaned)
            }}
            rows={6}
            spellCheck={false}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 resize-none"
            placeholder={"user1@example.com\nuser2@example.com"}
          />
          <p className="text-xs text-muted-foreground mt-1">
            当前 {recipients.filter((r) => r.trim()).length} 个收件人
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
