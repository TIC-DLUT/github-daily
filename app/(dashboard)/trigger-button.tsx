'use client'

import { Button } from '@/app/_components/ui/button'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/_components/ui/dialog'
import { Play } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function TriggerButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const router = useRouter()

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipEmail: !sendEmail }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('已触发运行', {
          description: sendEmail ? '完成后将发送邮件' : '仅抓取分析，不发送邮件',
        })
        setOpen(false)
        router.refresh()
      } else {
        toast.error('触发失败', { description: data.error })
      }
    } catch {
      toast.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Play className="h-4 w-4" />
        立即运行
      </Button>

      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogHeader>
          <DialogTitle>运行 Digest</DialogTitle>
          <DialogDescription>
            抓取 GitHub Trending 项目并使用 AI 生成分析摘要
          </DialogDescription>
        </DialogHeader>

        <label className="flex items-center gap-3 p-3 rounded-md border border-border cursor-pointer select-none hover:bg-muted/50 transition-colors">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <div>
            <p className="text-sm font-medium">发送邮件</p>
            <p className="text-xs text-muted-foreground">完成后将结果发送至收件人列表</p>
          </div>
        </label>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            <Play className="h-4 w-4" />
            {loading ? '运行中...' : '确认运行'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
