import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { getTest, updateTest } from '@/api/tests'
import { createQuestionsBulk, fetchQuestionsBulk } from '@/api/questions'
import { useResolveTestIds } from '@/hooks/useResolveTestIds'
import { useTestFormOptions } from '@/hooks/useTestFormOptions'
import { useTestDraftStore, type QuestionDraft } from '@/store/testDraftStore'
import { TestSummaryCard } from '@/components/tests/TestSummaryCard'
import { EditTestModal } from '@/components/tests/EditTestModal'
import { QuestionListSidebar } from '@/components/questions/QuestionListSidebar'
import { QuestionEditorPanel } from '@/components/questions/QuestionEditorPanel'
import { Button } from '@/components/ui/Button'
import type { CreateQuestionPayload } from '@/types/api'

function toQuestionDraft(q: {
  id: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: string
  explanation: string | null
  difficulty: string | null
}): QuestionDraft {
  return {
    localId: q.id,
    persistedId: q.id,
    question: q.question,
    option1: q.option1,
    option2: q.option2,
    option3: q.option3,
    option4: q.option4,
    correctOption: q.correct_option as QuestionDraft['correctOption'],
    explanation: q.explanation ?? '',
    difficulty: (q.difficulty as QuestionDraft['difficulty']) ?? undefined,
    dirty: false,
  }
}

export function AddQuestionsPage() {
  const { id } = useParams<{ id: string }>()
  const testId = id as string
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const testQuery = useQuery({ queryKey: ['test', testId], queryFn: () => getTest(testId) })
  const test = testQuery.data

  const existingQuestionsQuery = useQuery({
    queryKey: ['questions', testId, test?.questions],
    queryFn: () => fetchQuestionsBulk(test?.questions ?? []),
    enabled: Boolean(test),
  })

  const { subjectId, topicIds } = useResolveTestIds(test)
  const { topics: allTopics, subTopics: allSubTopics } = useTestFormOptions(subjectId, topicIds)
  const topicOptions = allTopics
    .filter((t) => test?.topics.includes(t.name))
    .map((t) => ({ value: t.id, label: t.name }))
  const subTopicOptions = allSubTopics
    .filter((s) => test?.sub_topics.includes(s.name))
    .map((s) => ({ value: s.id, label: s.name }))

  const store = useTestDraftStore()
  const { questions, activeIndex, addQuestion, updateQuestion, setActiveIndex } = store

  useEffect(() => {
    if (store.testId === testId) return
    if (!existingQuestionsQuery.isSuccess) return
    store.hydrate(testId, existingQuestionsQuery.data.map(toQuestionDraft))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, existingQuestionsQuery.isSuccess, existingQuestionsQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const unsynced = questions.filter((q) => !q.persistedId || q.dirty)
      let persistedByLocalId = new Map<string, string>()

      if (unsynced.length > 0) {
        const payloads: CreateQuestionPayload[] = unsynced.map((q) => ({
          type: 'mcq',
          question: q.question,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          correct_option: q.correctOption,
          explanation: q.explanation || undefined,
          difficulty: q.difficulty,
          test_id: testId,
          subject: subjectId,
          topic: topicOptions.find((t) => t.value === q.topicId)?.label,
          sub_topic: subTopicOptions.find((t) => t.value === q.subTopicId)?.label,
        }))
        const created = await createQuestionsBulk(payloads)
        persistedByLocalId = new Map(unsynced.map((q, i) => [q.localId, created[i].id]))
      }

      const allIds = questions.map((q) => persistedByLocalId.get(q.localId) ?? q.persistedId!)
      await updateTest(testId, {
        questions: allIds,
        total_questions: allIds.length,
        total_marks: allIds.length * (test?.correct_marks ?? 0),
      })

      return persistedByLocalId
    },
    onSuccess: (persistedByLocalId) => {
      for (const [localId, persistedId] of persistedByLocalId) {
        store.markSynced(localId, persistedId)
      }
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      queryClient.invalidateQueries({ queryKey: ['test', testId] })
      setSaveError(null)
    },
    onError: (error: Error) => setSaveError(error.message),
  })

  if (!test || store.testId !== testId) {
    return <p className="text-sm text-muted">Loading test…</p>
  }

  const activeDraft = questions[activeIndex]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between text-sm text-secondary-text">
        <div>
          Test Creation / Create Test / <span className="text-heading">Chapter Wise</span>
        </div>
        <Button
          loading={saveMutation.isPending}
          onClick={() =>
            saveMutation.mutate(undefined, {
              onSuccess: () => navigate(`/tests/${testId}/preview`),
            })
          }
        >
          Publish
        </Button>
      </div>

      {saveError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-500">{saveError}</p>
      )}

      <div className="flex gap-8">
        <div className="flex w-80 shrink-0 flex-col gap-6">
          <TestSummaryCard test={test} onEdit={() => setEditOpen(true)} />
          <QuestionListSidebar
            questions={questions}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>

        {activeDraft && (
          <QuestionEditorPanel
            draft={activeDraft}
            index={activeIndex}
            total={questions.length}
            onChange={(patch) => updateQuestion(activeDraft.localId, patch)}
            onReset={() =>
              updateQuestion(activeDraft.localId, {
                question: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                explanation: '',
              })
            }
            onAddQuestion={addQuestion}
            onPrev={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            onNext={() => setActiveIndex(Math.min(questions.length - 1, activeIndex + 1))}
            topicOptions={topicOptions}
            subTopicOptions={subTopicOptions}
          />
        )}
      </div>

      <div className="mt-10 flex justify-between border-t border-border pt-6">
        <Button variant="danger" onClick={() => navigate('/')}>
          Exit Test Creation
        </Button>
        <Button
          loading={saveMutation.isPending}
          onClick={() =>
            saveMutation.mutate(undefined, {
              onSuccess: () => navigate(`/tests/${testId}/preview`),
            })
          }
        >
          Next
        </Button>
      </div>

      {test && <EditTestModal test={test} open={editOpen} onClose={() => setEditOpen(false)} />}
    </div>
  )
}
