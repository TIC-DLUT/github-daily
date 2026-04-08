import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]',
          {
            primary:
              'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
            secondary:
              'bg-muted text-foreground hover:bg-muted/80 border border-border',
            ghost: 'hover:bg-muted text-foreground',
            destructive:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          }[variant],
          {
            sm: 'h-8 px-3 text-sm gap-1.5',
            md: 'h-10 px-4 text-sm gap-2',
            lg: 'h-12 px-6 text-base gap-2',
          }[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
