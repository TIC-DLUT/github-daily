'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Dialog({ open, onClose, children }: DialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose()
      }}
    >
      <div className="fixed inset-0 bg-black/50 animate-in fade-in" />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border border-border bg-background p-6 shadow-lg animate-in fade-in zoom-in-95">
        {children}
      </div>
    </div>
  )
}

interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return <div className={cn('space-y-1.5 mb-4', className)}>{children}</div>
}

export function DialogTitle({ children, className }: DialogHeaderProps) {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>
}

export function DialogDescription({ children, className }: DialogHeaderProps) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

export function DialogFooter({ children, className }: DialogHeaderProps) {
  return <div className={cn('flex justify-end gap-2 mt-6', className)}>{children}</div>
}
