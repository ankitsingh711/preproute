import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { FieldWrapper } from '@/components/ui/Field'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  label?: string
  error?: string
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function MultiSelect({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Choose from Drop-down',
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function toggle(optValue: string) {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  const selectedLabels = options.filter((o) => value.includes(o.value)).map((o) => o.label)

  return (
    <FieldWrapper label={label} error={error}>
      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50',
            selectedLabels.length === 0 ? 'text-muted' : 'text-heading',
            error && 'border-red-400',
          )}
        >
          <span className="truncate">
            {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </button>
        {open && !disabled && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-white py-1 shadow-lg">
            {options.length === 0 && (
              <p className="px-4 py-2 text-sm text-muted">No options available</p>
            )}
            {options.map((opt) => {
              const selected = value.includes(opt.value)
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-tint"
                >
                  <span>{opt.label}</span>
                  {selected && <Check className="h-4 w-4 text-primary" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </FieldWrapper>
  )
}
