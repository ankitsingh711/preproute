import { cn } from '@/lib/cn'

interface TabOption {
  value: string
  label: string
  disabled?: boolean
}

interface TabsProps {
  options: TabOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ options, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-border bg-white p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:text-muted',
            value === opt.value
              ? 'bg-tint text-primary-strong'
              : !opt.disabled && 'text-muted hover:text-heading',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
