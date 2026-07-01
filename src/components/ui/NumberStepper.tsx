import { ChevronDown, ChevronUp } from 'lucide-react'
import { FieldWrapper } from '@/components/ui/Field'

interface NumberStepperProps {
  label?: string
  value: number
  onChange: (value: number) => void
  step?: number
  formatSign?: boolean
}

export function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  formatSign = true,
}: NumberStepperProps) {
  const display = formatSign && value > 0 ? `+${value}` : `${value}`

  return (
    <FieldWrapper label={label}>
      <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3">
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => {
            const parsed = Number(e.target.value.replace(/[^-\d]/g, ''))
            if (!Number.isNaN(parsed)) onChange(parsed)
          }}
          className="w-full bg-transparent text-sm text-heading focus:outline-none"
        />
        <div className="flex flex-col">
          <button
            type="button"
            aria-label="increment"
            onClick={() => onChange(value + step)}
            className="text-heading/70 hover:text-primary"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="decrement"
            onClick={() => onChange(value - step)}
            className="text-heading/70 hover:text-primary"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </FieldWrapper>
  )
}
