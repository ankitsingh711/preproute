import { useEffect, useRef } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Image,
  Italic,
  Link as LinkIcon,
  Sigma,
  Strikethrough,
  Table as TableIcon,
  Underline,
} from 'lucide-react'
import { cn } from '@/lib/cn'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const toolbarButtons: Array<{
  icon: typeof Bold
  command?: string
  label: string
  prompt?: boolean
}> = [
  { icon: Italic, command: 'italic', label: 'Italic' },
  { icon: Bold, command: 'bold', label: 'Bold' },
  { icon: Underline, command: 'underline', label: 'Underline' },
  { icon: Strikethrough, command: 'strikeThrough', label: 'Strikethrough' },
  { icon: LinkIcon, command: 'createLink', label: 'Link', prompt: true },
  { icon: AlignLeft, command: 'justifyLeft', label: 'Align left' },
  { icon: AlignCenter, command: 'justifyCenter', label: 'Align center' },
  { icon: AlignRight, command: 'justifyRight', label: 'Align right' },
  { icon: TableIcon, label: 'Table (coming soon)' },
  { icon: Image, label: 'Image (coming soon)' },
  { icon: Sigma, label: 'Formula (coming soon)' },
]

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value
    }
  }, [value])

  function exec(command?: string, prompt?: boolean) {
    if (!command) return
    ref.current?.focus()
    if (prompt) {
      const url = window.prompt('Enter a URL')
      if (!url) return
      document.execCommand(command, false, url)
    } else {
      document.execCommand(command, false)
    }
    onChange(ref.current?.innerHTML ?? '')
  }

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2 text-heading/70">
        {toolbarButtons.map(({ icon: Icon, command, label, prompt }, i) => (
          <button
            key={i}
            type="button"
            title={label}
            onClick={() => exec(command, prompt)}
            className={cn(
              'rounded p-1 hover:bg-tint hover:text-primary',
              !command && 'cursor-default opacity-40 hover:bg-transparent hover:text-heading/70',
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="min-h-32 px-4 py-3 text-sm text-heading focus:outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  )
}
