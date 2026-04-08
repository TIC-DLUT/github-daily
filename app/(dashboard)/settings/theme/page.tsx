'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Input } from '@/app/_components/ui/input'
import { Button } from '@/app/_components/ui/button'
import { toast } from 'sonner'

const LAYOUTS = [
  { value: 'compact', label: '紧凑' },
  { value: 'expanded', label: '展开' },
  { value: 'magazine', label: '杂志' },
]

const FONT_FAMILIES = [
  { value: "'Helvetica Neue', Arial, sans-serif", label: 'Helvetica' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier' },
  { value: "'Segoe UI', Tahoma, sans-serif", label: 'Segoe UI' },
]

export default function ThemePage() {
  const [theme, setTheme] = useState({
    name: '默认主题',
    primaryColor: '#0ea5e9',
    bgColor: '#ffffff',
    textColor: '#171717',
    accentColor: '#f59e0b',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    layout: 'expanded' as 'compact' | 'expanded' | 'magazine',
  })
  const [previewHtml, setPreviewHtml] = useState('')
  const [saving, setSaving] = useState(false)

  const loadPreview = useCallback(async (themeConfig: typeof theme) => {
    try {
      const res = await fetch('/api/theme/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeConfig),
      })
      const data = await res.json()
      if (data.success) {
        setPreviewHtml(data.data.html)
      }
    } catch {
      // Silently fail on preview
    }
  }, [])

  useEffect(() => {
    loadPreview(theme)
  }, [theme, loadPreview])

  function updateTheme<K extends keyof typeof theme>(key: K, value: (typeof theme)[K]) {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...theme, activate: true }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('主题已保存并激活')
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
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <Input
            id="themeName"
            label="主题名称"
            value={theme.name}
            onChange={(e) => updateTheme('name', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">主色调</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme('primaryColor', e.target.value)}
                  className="h-10 w-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme('primaryColor', e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">背景色</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={theme.bgColor}
                  onChange={(e) => updateTheme('bgColor', e.target.value)}
                  className="h-10 w-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={theme.bgColor}
                  onChange={(e) => updateTheme('bgColor', e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">文字色</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => updateTheme('textColor', e.target.value)}
                  className="h-10 w-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={theme.textColor}
                  onChange={(e) => updateTheme('textColor', e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">强调色</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => updateTheme('accentColor', e.target.value)}
                  className="h-10 w-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={theme.accentColor}
                  onChange={(e) => updateTheme('accentColor', e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">字体</p>
            <div className="flex flex-wrap gap-2">
              {FONT_FAMILIES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => updateTheme('fontFamily', f.value)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    theme.fontFamily === f.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">布局</p>
            <div className="flex gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => updateTheme('layout', l.value as 'compact' | 'expanded' | 'magazine')}
                  className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                    theme.layout === l.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存并激活'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-3">邮件预览</p>
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[600px] rounded-md border border-border"
              title="邮件预览"
            />
          ) : (
            <div className="h-[600px] rounded-md border border-border flex items-center justify-center">
              <p className="text-sm text-muted-foreground">加载预览中...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
