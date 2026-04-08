'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Input } from '@/app/_components/ui/input'
import { Button } from '@/app/_components/ui/button'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'

export default function EmailConfigPage() {
  const [recipients, setRecipients] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
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

  function addRecipient() {
    const email = newEmail.trim()
    if (!email) return
    if (recipients.includes(email)) {
      toast.error('该邮箱已在列表中')
      return
    }
    setRecipients([...recipients, email])
    setNewEmail('')
  }

  function removeRecipient(email: string) {
    setRecipients(recipients.filter((r) => r !== email))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'email_recipients', value: JSON.stringify(recipients) }),
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
          <p className="text-sm font-medium mb-2">收件人列表</p>
          <div className="flex gap-2 mb-3">
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="输入邮箱地址"
              onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
              className="flex-1"
            />
            <Button variant="secondary" onClick={addRecipient} size="md">
              <Plus className="h-4 w-4" />
              添加
            </Button>
          </div>

          {recipients.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无收件人</p>
          ) : (
            <div className="space-y-2">
              {recipients.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <span className="text-sm">{email}</span>
                  <button
                    onClick={() => removeRecipient(email)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
