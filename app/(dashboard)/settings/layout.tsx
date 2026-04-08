'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/settings/schedule', label: '定时计划' },
  { href: '/settings/languages', label: '语言筛选' },
  { href: '/settings/ai', label: 'AI 配置' },
  { href: '/settings/email', label: '邮件配置' },
  { href: '/settings/theme', label: '邮件主题' },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">设置</h1>
        <p className="text-muted-foreground text-sm mt-1">
          管理应用配置
        </p>
      </div>

      <SettingsTabs />
      {children}
    </div>
  )
}

function SettingsTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 border-b border-border overflow-x-auto">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
            pathname === tab.href
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
