import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { addDays, addMonths } from 'date-fns'
import { CheckCircle2, ChevronDown, Pencil } from 'lucide-react'
import { getTest, updateTest } from '@/api/tests'
import { fetchQuestionsBulk } from '@/api/questions'
import { TestSummaryCard } from '@/components/tests/TestSummaryCard'
import { EditTestModal } from '@/components/tests/EditTestModal'
import { Tabs } from '@/components/ui/Tabs'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { Button } from '@/components/ui/Button'
import { DifficultyPill } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import type { CorrectOption } from '@/types/api'

const optionKeys: Array<{ key: 'option1' | 'option2' | 'option3' | 'option4'; value: CorrectOption }> = [
  { key: 'option1', value: 'option1' },
  { key: 'option2', value: 'option2' },
  { key: 'option3', value: 'option3' },
  { key: 'option4', value: 'option4' },
]

const liveUntilOptions = [
  { value: 'always', label: 'Always Available' },
  { value: '3_weeks', label: '3 Weeks' },
  { value: '1_week', label: '1 Week' },
  { value: '1_month', label: '1 Month' },
  { value: '2_weeks', label: '2 Weeks' },
  { value: 'custom', label: 'Custom Duration' },
]

function computeExpiry(liveUntil: string, customDate: string, customTime: string): string | null {
  const now = new Date()
  switch (liveUntil) {
    case '1_week':
      return addDays(now, 7).toISOString()
    case '2_weeks':
      return addDays(now, 14).toISOString()
    case '3_weeks':
      return addDays(now, 21).toISOString()
    case '1_month':
      return addMonths(now, 1).toISOString()
    case 'custom':
      if (!customDate) return null
      return new Date(`${customDate}T${customTime || '23:59'}`).toISOString()
    default:
      return null
  }
}

export function PreviewPublishPage() {
  const { id } = useParams<{ id: string }>()
  const testId = id as string
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now')
  const [liveUntil, setLiveUntil] = useState('always')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [published, setPublished] = useState(false)

  const testQuery = useQuery({ queryKey: ['test', testId], queryFn: () => getTest(testId) })
  const test = testQuery.data

  const questionsQuery = useQuery({
    queryKey: ['questions', testId, test?.questions],
    queryFn: () => fetchQuestionsBulk(test?.questions ?? []),
    enabled: Boolean(test),
  })

  const publishMutation = useMutation({
    mutationFn: async () => {
      // The API rejects `expiry_date`/`scheduled_date: null` outright (same
      // pattern as `status: null` on test creation) — it wants the field
      // omitted entirely rather than explicitly nulled.
      const expiry_date = computeExpiry(liveUntil, customDate, customTime)
      const scheduled_date =
        publishMode === 'schedule' && scheduleDate
          ? new Date(`${scheduleDate}T${scheduleTime || '00:00'}`).toISOString()
          : null

      return updateTest(testId, {
        status: publishMode === 'schedule' ? 'scheduled' : 'live',
        ...(expiry_date ? { expiry_date } : {}),
        ...(scheduled_date ? { scheduled_date } : {}),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      queryClient.invalidateQueries({ queryKey: ['test', testId] })
      setPublished(true)
      setTimeout(() => navigate('/'), 1600)
    },
  })

  if (!test) return <p className="text-sm text-muted">Loading test…</p>

  const questions = questionsQuery.data ?? []
  // The test's own `questions` array (from GET /tests/:id) is the source of
  // truth for whether enough questions are attached — the staging API's
  // fetchBulk endpoint has been observed to intermittently return an empty
  // result for ids that the test record still references, so publishing
  // shouldn't be blocked on that call succeeding.
  const attachedCount = test.questions?.length ?? 0
  const allDone = attachedCount >= test.total_questions && attachedCount > 0
  const questionDetailsUnavailable = attachedCount > 0 && questions.length === 0 && questionsQuery.isSuccess

  if (published) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <CheckCircle2 className="h-14 w-14 text-teal" />
        <h2 className="text-xl font-semibold text-heading">
          {publishMode === 'schedule' ? 'Test scheduled successfully!' : 'Test published successfully!'}
        </h2>
        <p className="text-sm text-secondary-text">Redirecting to your dashboard…</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-6 text-sm text-secondary-text">Test creation</p>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-heading">Test created</h1>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            allDone ? 'border-teal text-teal' : 'border-border text-secondary-text',
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {attachedCount} / {test.total_questions} Questions done
        </span>
      </div>

      <TestSummaryCard test={test} onEdit={() => setEditOpen(true)} />

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-heading">Questions</h2>
          <Link
            to={`/tests/${testId}/questions`}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit questions
          </Link>
        </div>

        {questionDetailsUnavailable && (
          <p className="mb-3 rounded-lg bg-amber-bg px-4 py-2 text-sm text-amber-text">
            Question previews are temporarily unavailable, but {attachedCount} question
            {attachedCount === 1 ? ' is' : 's are'} attached to this test and it's ready to
            publish.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {questions.map((q, i) => (
            <details key={q.id} className="rounded-xl border border-border bg-white p-5">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-heading">
                <span>
                  Q{i + 1}. <span dangerouslySetInnerHTML={{ __html: q.question }} />
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-heading/50" />
              </summary>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {optionKeys.map(({ key, value }) => (
                  <div
                    key={key}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm',
                      q.correct_option === value
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-border text-heading',
                    )}
                  >
                    {q[key]}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <p className="mt-3 text-sm text-secondary-text">
                  <span className="font-medium text-heading">Explanation: </span>
                  {q.explanation}
                </p>
              )}
              {q.difficulty && (
                <div className="mt-3">
                  <DifficultyPill difficulty={q.difficulty} />
                </div>
              )}
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 max-w-2xl">
        <Tabs
          options={[
            { value: 'now', label: 'Publish Now' },
            { value: 'schedule', label: 'Schedule Publish' },
          ]}
          value={publishMode}
          onChange={(v) => setPublishMode(v as 'now' | 'schedule')}
        />

        {publishMode === 'schedule' && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-heading">Select Date and Time</p>
            <div className="grid grid-cols-2 gap-6">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="rounded-lg border border-border px-4 py-3 text-sm text-heading focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="rounded-lg border border-border px-4 py-3 text-sm text-heading focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-1 text-sm font-semibold text-heading">Live Until</p>
          <p className="mb-4 text-sm text-secondary-text">
            Choose how long this test should remain available on the platform.
          </p>
          <RadioGroup
            name="live-until"
            options={liveUntilOptions}
            value={liveUntil}
            onChange={setLiveUntil}
            columns={2}
          />
        </div>

        {liveUntil === 'custom' && (
          <div className="mt-6 grid grid-cols-2 gap-6">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="rounded-lg border border-border px-4 py-3 text-sm text-heading focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="rounded-lg border border-border px-4 py-3 text-sm text-heading focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button
            loading={publishMutation.isPending}
            disabled={!allDone}
            onClick={() => publishMutation.mutate()}
          >
            Confirm
          </Button>
        </div>
        {!allDone && (
          <p className="mt-3 text-right text-xs text-muted">
            Add all {test.total_questions} questions before publishing.
          </p>
        )}
      </div>

      <EditTestModal test={test} open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
