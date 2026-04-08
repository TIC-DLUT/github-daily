'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  History,
  Clock,
  Globe,
  Bot,
  Mail,
  Palette,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    label: '概览',
    items: [
      { href: '/', icon: LayoutDashboard, text: '仪表盘' },
      { href: '/digests', icon: History, text: '历史记录' },
    ],
  },
  {
    label: '配置',
    items: [
      { href: '/settings/schedule', icon: Clock, text: '定时计划' },
      { href: '/settings/languages', icon: Globe, text: '语言筛选' },
      { href: '/settings/ai', icon: Bot, text: 'AI 配置' },
      { href: '/settings/email', icon: Mail, text: '邮件配置' },
      { href: '/settings/theme', icon: Palette, text: '邮件主题' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-sidebar-border md:bg-sidebar">
      <div className="flex h-14 items-center border-b border-sidebar-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            GitHub Daily
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-active/10 text-sidebar-active'
                          : 'text-sidebar-foreground hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.text}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
