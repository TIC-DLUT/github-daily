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

const MOBILE_ITEMS = [
  { href: '/', icon: LayoutDashboard, text: '仪表盘' },
  { href: '/digests', icon: History, text: '历史' },
  { href: '/settings/schedule', icon: Clock, text: '计划' },
  { href: '/settings/ai', icon: Bot, text: 'AI' },
  { href: '/settings/email', icon: Mail, text: '邮件' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <ul className="flex items-center justify-around py-2">
        {MOBILE_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.text}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
