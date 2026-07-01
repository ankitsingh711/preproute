import { cn } from '@/lib/cn'

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  name: string
  label?: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  columns?: number
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  className,
  columns = options.length,
}: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      {label && <span className="text-sm font-medium text-heading">{label}</span>}
      <div
        className={cn('grid gap-x-10 gap-y-4', className)}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, max-content))` }}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-heading"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="peer sr-only"
              />
              <span className="h-5 w-5 rounded-full border-2 border-primary" />
              <span className="absolute h-2.5 w-2.5 scale-0 rounded-full bg-primary transition-transform peer-checked:scale-100" />
            </span>
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}
