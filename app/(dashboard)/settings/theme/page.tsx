'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Input } from '@/app/_components/ui/input'
import { Button } from '@/app/_components/ui/button'
import { toast } from 'sonner'
import { DEFAULT_TEMPLATE, DEFAULT_CONTENT_TEMPLATE } from '@/lib/email/default-template'
import { RotateCcw } from 'lucide-react'

type EditorTab = 'html' | 'content'

export default function ThemePage() {
  const [name, setName] = useState('默认主题')
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [contentTemplate, setContentTemplate] = useState(DEFAULT_CONTENT_TEMPLATE)
  const [themeId, setThemeId] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<EditorTab>('html')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Load active theme on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await fetch('/api/theme')
        const data = await res.json()
        if (data.success && data.data.length > 0) {
          const active = data.data.find((t: { isActive: number }) => t.isActive === 1)
          if (active) {
            setThemeId(active.id)
            setName(active.name)
            if (active.template) setTemplate(active.template)
            if (active.contentTemplate) setContentTemplate(active.contentTemplate)
          }
        }
      } catch {
        // Use defaults
      }
    }
    loadTheme()
  }, [])

  const loadPreview = useCallback(async (tpl: string, ctpl: string) => {
    try {
      const res = await fetch('/api/theme/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: tpl, contentTemplate: ctpl }),
      })
      if (res.ok) {
        const html = await res.text()
        setPreviewHtml(html)
      }
    } catch {
      // Silently fail
    }
  }, [])

  // Debounced preview update
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadPreview(template, contentTemplate)
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [template, contentTemplate, loadPreview])

  function handleReset() {
    if (activeTab === 'html') {
      if (window.confirm('确定要重置 HTML 模板为默认吗？')) {
        setTemplate(DEFAULT_TEMPLATE)
      }
    } else {
      if (window.confirm('确定要重置内容模板为默认吗？')) {
        setContentTemplate(DEFAULT_CONTENT_TEMPLATE)
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const current = activeTab === 'html' ? template : contentTemplate
      const setter = activeTab === 'html' ? setTemplate : setContentTemplate
      const newValue = current.slice(0, start) + '  ' + current.slice(end)
      setter(newValue)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const method = themeId ? 'PUT' : 'POST'
      const body = themeId
        ? { id: themeId, name, template, contentTemplate, activate: true }
        : { name, template, contentTemplate, activate: true }

      const res = await fetch('/api/theme', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        if (!themeId && data.data?.id) {
          setThemeId(data.data.id)
        }
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

  const currentValue = activeTab === 'html' ? template : contentTemplate
  const currentSetter = activeTab === 'html' ? setTemplate : setContentTemplate

  return (
    <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-10rem)]">
      {/* Editor */}
      <Card className="flex flex-col overflow-hidden">
        <CardContent className="pt-6 flex flex-col gap-3 flex-1 overflow-hidden">
          <Input
            id="themeName"
            label="主题名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Tab bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 rounded-lg bg-muted p-0.5">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'html'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                HTML 外层模板
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'content'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                内容模板 (Markdown)
              </button>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              重置为默认
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <textarea
              value={currentValue}
              onChange={(e) => currentSetter(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="w-full h-full resize-none rounded-md border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              placeholder={activeTab === 'html' ? '输入 HTML 模板...' : '输入内容 Markdown 模板...'}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground truncate">
              {activeTab === 'html'
                ? '占位符：{{content}} {{date}} {{languageLabel}} {{repoCount}} {{year}}'
                : '占位符：{{repo.author}} {{repo.name}} {{repo.url}} {{repo.description}} {{repo.language}} {{repo.stars}} {{repo.forks}} {{repo.currentPeriodStars}} {{analysis.summary}} {{analysis.problemSolved}} {{analysis.useCases}} {{analysis.limitations}} {{#analysis}}...{{/analysis}}'}
            </p>
            <Button onClick={handleSave} disabled={saving} size="sm" className="shrink-0">
              {saving ? '保存中...' : '保存并激活'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="flex flex-col overflow-hidden">
        <CardContent className="pt-6 flex flex-col flex-1 overflow-hidden">
          <p className="text-sm font-medium mb-3">邮件预览</p>
          <div className="flex-1 min-h-0">
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full rounded-md border border-border"
                title="邮件预览"
              />
            ) : (
              <div className="h-full rounded-md border border-border flex items-center justify-center">
                <p className="text-sm text-muted-foreground">加载预览中...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
