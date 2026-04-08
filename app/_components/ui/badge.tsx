import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          default: 'bg-primary/10 text-primary',
          success: 'bg-success/10 text-success',
          warning: 'bg-accent/10 text-accent-foreground',
          destructive: 'bg-destructive/10 text-destructive',
          outline: 'border border-border text-muted-foreground',
        }[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
