import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function NavyPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white">
      {children}
    </span>
  )
}

const difficultyStyles: Record<string, string> = {
  easy: 'bg-teal text-white',
  medium: 'bg-amber-500 text-white',
  difficult: 'bg-red-400 text-white',
}

export function DifficultyPill({ difficulty }: { difficulty: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize',
        difficultyStyles[difficulty] ?? 'bg-gray-200 text-heading',
      )}
    >
      {difficulty}
    </span>
  )
}

export function AmberTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-border bg-amber-bg px-3 py-1 text-xs font-medium text-amber-text">
      {children}
    </span>
  )
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: 'bg-green-50 text-green-600 border-green-200',
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    scheduled: 'bg-blue-50 text-blue-600 border-blue-200',
    unpublished: 'bg-gray-100 text-gray-500 border-gray-200',
    expired: 'bg-red-50 text-red-500 border-red-200',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize',
        styles[status] ?? 'bg-gray-100 text-gray-600 border-gray-200',
      )}
    >
      {status}
    </span>
  )
}
