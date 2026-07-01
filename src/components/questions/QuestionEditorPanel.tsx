import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Trash2, Upload } from 'lucide-react'
import { RichTextEditor } from '@/components/questions/RichTextEditor'
import { Textarea } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { QuestionDraft } from '@/store/testDraftStore'
import type { CorrectOption } from '@/types/api'

interface Option {
  value: string
  label: string
}

interface QuestionEditorPanelProps {
  draft: QuestionDraft
  index: number
  total: number
  onChange: (patch: Partial<QuestionDraft>) => void
  onReset: () => void
  onAddQuestion: () => void
  onPrev: () => void
  onNext: () => void
  onImportCsv: (file: File) => void
  topicOptions: Option[]
  subTopicOptions: Option[]
}

const optionKeys = ['option1', 'option2', 'option3', 'option4'] as const

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'difficult', label: 'Difficult' },
]

export function QuestionEditorPanel({
  draft,
  index,
  total,
  onChange,
  onReset,
  onAddQuestion,
  onPrev,
  onNext,
  onImportCsv,
  topicOptions,
  subTopicOptions,
}: QuestionEditorPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex-1">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-heading">
          Question {index + 1}
          <span className="text-muted">/{total}</span>
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onAddQuestion} className="px-4 py-2">
            + MCQ
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="px-4 py-2"
            title="Import questions from CSV"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" /> CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImportCsv(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mb-3 flex items-center gap-1 text-sm text-red-500 hover:underline"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete All Edits
      </button>

      <RichTextEditor
        value={draft.question}
        onChange={(html) => onChange({ question: html })}
        placeholder="Type here"
      />

      <p className="mb-3 mt-6 text-sm font-medium text-heading">Type the options below</p>
      <div className="flex flex-col gap-3">
        {optionKeys.map((key, i) => {
          const optionValue: CorrectOption = `option${i + 1}` as CorrectOption
          return (
            <div key={key} className="flex items-center gap-3">
              <input
                type="radio"
                name={`correct-${draft.localId}`}
                checked={draft.correctOption === optionValue}
                onChange={() => onChange({ correctOption: optionValue })}
                className="h-4 w-4 accent-primary"
                aria-label={`Mark option ${i + 1} correct`}
              />
              <input
                value={draft[key]}
                onChange={(e) => onChange({ [key]: e.target.value } as Partial<QuestionDraft>)}
                placeholder="Type Option here"
                className="flex-1 rounded-lg border border-border px-4 py-3 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                aria-label="Clear option"
                onClick={() => onChange({ [key]: '' } as Partial<QuestionDraft>)}
                className="text-heading/40 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <Textarea
          label="Add Solution"
          placeholder="Type here"
          value={draft.explanation}
          onChange={(e) => onChange({ explanation: e.target.value })}
        />
      </div>

      <div className="my-6 flex items-center justify-center gap-6 text-heading/50">
        <button type="button" onClick={onPrev} aria-label="Previous question" disabled={index === 0}>
          <ChevronLeft className="h-5 w-5 disabled:opacity-30" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next question"
          disabled={index === total - 1}
        >
          <ChevronRight className="h-5 w-5 disabled:opacity-30" />
        </button>
      </div>

      <p className="mb-4 text-sm font-medium text-heading">Question settings</p>
      <div className="flex flex-col gap-5">
        <Select
          label="Level of Difficulty"
          options={difficultyOptions}
          value={draft.difficulty ?? ''}
          onChange={(e) => onChange({ difficulty: e.target.value as QuestionDraft['difficulty'] })}
        />
        <Select
          label="Topic"
          options={topicOptions}
          value={draft.topicId ?? ''}
          onChange={(e) => onChange({ topicId: e.target.value, subTopicId: undefined })}
        />
        <Select
          label="Sub-topic"
          options={subTopicOptions}
          value={draft.subTopicId ?? ''}
          onChange={(e) => onChange({ subTopicId: e.target.value })}
        />
      </div>
    </div>
  )
}
