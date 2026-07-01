import { Check, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { QuestionDraft } from '@/store/testDraftStore'

function isQuestionComplete(q: QuestionDraft) {
  return (
    q.question.trim().length > 0 &&
    q.option1.trim().length > 0 &&
    q.option2.trim().length > 0 &&
    q.option3.trim().length > 0 &&
    q.option4.trim().length > 0
  )
}

interface QuestionListSidebarProps {
  questions: QuestionDraft[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function QuestionListSidebar({ questions, activeIndex, onSelect }: QuestionListSidebarProps) {
  return (
    <div className="w-56 shrink-0">
      <p className="mb-1 text-sm font-medium text-heading">Question creation</p>
      <p className="mb-4 text-xs text-secondary-text">Total Questions . {questions.length}</p>
      <div className="flex flex-col gap-2">
        {questions.map((q, i) => {
          const complete = isQuestionComplete(q)
          return (
            <button
              key={q.localId}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                complete ? 'border-teal text-teal' : 'border-border text-muted',
                i === activeIndex && 'ring-2 ring-primary/30',
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full',
                    complete ? 'bg-teal text-white' : 'bg-gray-200 text-transparent',
                  )}
                >
                  <Check className="h-3 w-3" />
                </span>
                Question {i + 1}
              </span>
              <ChevronsRight className="h-4 w-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
