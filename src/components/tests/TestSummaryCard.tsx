import { Clock, FileText, Pencil, SlidersHorizontal } from 'lucide-react'
import { NavyPill, DifficultyPill, AmberTag } from '@/components/ui/Badge'
import type { Test } from '@/types/api'

interface TestSummaryCardProps {
  test: Test
  onEdit?: () => void
}

export function TestSummaryCard({ test, onEdit }: TestSummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <NavyPill>{test.type === 'chapterwise' ? 'Chapter Wise' : test.type.toUpperCase()}</NavyPill>
        {onEdit && (
          <button type="button" onClick={onEdit} aria-label="Edit test" className="text-primary">
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-3 flex items-center gap-3">
        <SlidersHorizontal className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-heading">{test.name}</h3>
        <DifficultyPill difficulty={test.difficulty} />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-secondary-text">Subject</dt>
        <dd className="text-heading">: {test.subject}</dd>
        <dt className="text-secondary-text">Topic</dt>
        <dd className="flex flex-wrap gap-2">
          : {test.topics.map((t) => <AmberTag key={t}>{t}</AmberTag>)}
        </dd>
        {test.sub_topics.length > 0 && (
          <>
            <dt className="text-secondary-text">Sub Topic</dt>
            <dd className="flex flex-wrap gap-2">
              : {test.sub_topics.map((t) => <AmberTag key={t}>{t}</AmberTag>)}
            </dd>
          </>
        )}
      </dl>

      <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-sm text-secondary-text">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {test.total_time} Min
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" /> {test.total_questions} Q's
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4" /> {test.total_marks} Marks
        </span>
      </div>
    </div>
  )
}
