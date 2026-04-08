'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Input } from '@/app/_components/ui/input'
import { Button } from '@/app/_components/ui/button'
import { toast } from 'sonner'

const PRESETS = [
  { label: '每天 9:00', value: '0 9 * * *' },
  { label: '每天 8:00 和 20:00', value: '0 8,20 * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '工作日 9:00', value: '0 9 * * 1-5' },
]

export default function SchedulePage() {
  const [cron, setCron] = useState('0 9 * * *')
  const [saving, setSaving] = useState(false)

  // Load current value on mount
  useState(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.cron_schedule) {
          setCron(data.data.cron_schedule)
        }
      })
  })

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'cron_schedule', value: cron }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('定时计划已更新')
      } else {
        toast.error('保存失败', { description: data.error })
      }
    } catch {
      toast.error('网络错误')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <Input
          id="cron"
          label="Cron 表达式"
          value={cron}
          onChange={(e) => setCron(e.target.value)}
          placeholder="0 9 * * *"
          className="font-mono"
        />

        <div>
          <p className="text-sm text-muted-foreground mb-2">快捷预设</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setCron(preset.value)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  cron === preset.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
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
