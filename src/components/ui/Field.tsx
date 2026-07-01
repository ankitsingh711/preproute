import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface FieldWrapperProps {
  label?: string
  htmlFor?: string
  error?: string
  className?: string
  children: ReactNode
}

export function FieldWrapper({ label, htmlFor, error, className, children }: FieldWrapperProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-heading">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputBase =
  'w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-muted'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <input
        id={id}
        className={cn(inputBase, error && 'border-red-400', className)}
        {...props}
      />
    </FieldWrapper>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, id, className, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <textarea
        id={id}
        className={cn(inputBase, 'min-h-28 resize-y', error && 'border-red-400', className)}
        {...props}
      />
    </FieldWrapper>
  )
}

export { inputBase }
