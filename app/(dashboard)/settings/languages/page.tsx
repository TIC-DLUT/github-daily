'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { toast } from 'sonner'

const POPULAR_LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust',
  'C++', 'C', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart',
  'Scala', 'R', 'Shell', 'Lua', 'Zig', 'Elixir', 'Haskell',
  'Clojure', 'Julia', 'Perl', 'Objective-C', 'Vue', 'SCSS',
]

export default function LanguagesPage() {
  const [selected, setSelected] = useState<string[]>([''])
  const [allLanguages, setAllLanguages] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.languages) {
          const langs: string[] = JSON.parse(data.data.languages)
          if (langs.length === 1 && langs[0] === '') {
            setAllLanguages(true)
            setSelected([''])
          } else {
            setAllLanguages(false)
            setSelected(langs)
          }
        }
      })
  }, [])

  function toggleLanguage(lang: string) {
    setSelected((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    )
  }

  async function handleSave() {
    setSaving(true)
    const value = allLanguages ? [''] : selected.filter(Boolean)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'languages', value: JSON.stringify(value) }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('语言筛选已更新')
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
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allLanguages}
            onChange={(e) => {
              setAllLanguages(e.target.checked)
              if (e.target.checked) setSelected([''])
            }}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm font-medium">全部语言</span>
        </label>

        {!allLanguages && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              选择要追踪的语言（已选 {selected.filter(Boolean).length} 种）
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang.toLowerCase())}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    selected.includes(lang.toLowerCase())
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
