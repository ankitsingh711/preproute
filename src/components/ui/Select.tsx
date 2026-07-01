import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { FieldWrapper } from '@/components/ui/Field'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder = 'Choose from Drop-down',
  id,
  className,
  ...props
}: SelectProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <div className="relative">
        <select
          id={id}
          className={cn(
            'w-full appearance-none rounded-lg border border-border bg-white px-4 py-3 pr-10 text-sm text-heading focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50',
            !props.value && 'text-muted',
            error && 'border-red-400',
            className,
          )}
          {...props}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-heading" />
      </div>
    </FieldWrapper>
  )
}
