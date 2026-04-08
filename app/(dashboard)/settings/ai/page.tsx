'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Input } from '@/app/_components/ui/input'
import { Button } from '@/app/_components/ui/button'
import { toast } from 'sonner'

export default function AiConfigPage() {
  const [protocol, setProtocol] = useState<'claude' | 'openai'>('claude')
  const [baseUrl, setBaseUrl] = useState('https://api.anthropic.com')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const d = data.data
          if (d.ai_protocol) setProtocol(d.ai_protocol as 'claude' | 'openai')
          if (d.ai_base_url) setBaseUrl(d.ai_base_url)
          if (d.ai_model) setModel(d.ai_model)
          // API key shows masked
        }
      })
  }, [])

  async function saveField(key: string, value: string) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    return res.json()
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveField('ai_protocol', protocol)
      await saveField('ai_base_url', baseUrl)
      await saveField('ai_model', model)
      if (apiKey && !apiKey.includes('****')) {
        await saveField('ai_api_key', apiKey)
      }
      toast.success('AI 配置已更新')
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    try {
      // First save, then test by triggering a simple request
      await handleSave()
      toast.info('配置已保存，请通过「立即运行」来测试完整流程')
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <p className="text-sm font-medium mb-2">API 协议</p>
          <div className="flex gap-2">
            {(['claude', 'openai'] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setProtocol(p)
                  if (p === 'claude') setBaseUrl('https://api.anthropic.com')
                  else setBaseUrl('https://api.openai.com/v1')
                }}
                className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                  protocol === p
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {p === 'claude' ? 'Claude (Anthropic)' : 'OpenAI 兼容'}
              </button>
            ))}
          </div>
        </div>

        <Input
          id="baseUrl"
          label="Base URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder={protocol === 'claude' ? 'https://api.anthropic.com' : 'https://api.openai.com/v1'}
        />

        <Input
          id="apiKey"
          label="API Key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="输入新的 API Key（留空则不修改）"
        />

        <Input
          id="model"
          label="模型名称"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={protocol === 'claude' ? 'claude-sonnet-4-20250514' : 'gpt-4o'}
        />

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleTest} disabled={testing}>
            {testing ? '测试中...' : '测试连接'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
