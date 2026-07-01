import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { createTest, getTest, updateTest } from '@/api/tests'
import { TestDetailsForm } from '@/components/tests/TestDetailsForm'
import type { TestFormValues } from '@/components/tests/testFormSchema'
import { useResolveTestIds } from '@/hooks/useResolveTestIds'
import type { CreateTestPayload } from '@/types/api'

function toPayload(values: TestFormValues, totalMarks: number): CreateTestPayload {
  return {
    name: values.name,
    type: values.type,
    subject: values.subject,
    topics: values.topics,
    sub_topics: values.sub_topics,
    correct_marks: values.correct_marks,
    wrong_marks: values.wrong_marks,
    unattempt_marks: values.unattempt_marks,
    difficulty: values.difficulty,
    total_time: values.total_time,
    total_marks: totalMarks,
    total_questions: values.total_questions,
    status: 'draft',
  }
}

export function CreateTestPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const testQuery = useQuery({
    queryKey: ['test', id],
    queryFn: () => getTest(id as string),
    enabled: isEdit,
  })

  const { subjectId, topicIds, subTopicIds, ready } = useResolveTestIds(testQuery.data)

  const createMutation = useMutation({
    mutationFn: createTest,
    onSuccess: (test) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      navigate(`/tests/${test.id}/questions`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: CreateTestPayload) => updateTest(id as string, payload),
    onSuccess: (test) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      queryClient.invalidateQueries({ queryKey: ['test', id] })
      navigate(`/tests/${test.id}/questions`)
    },
  })

  const saveDraftMutation = useMutation({
    mutationFn: (payload: CreateTestPayload) =>
      isEdit ? updateTest(id as string, payload) : createTest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      navigate('/')
    },
  })

  if (isEdit && (!testQuery.data || !ready)) {
    return <p className="text-sm text-muted">Loading test details…</p>
  }

  const defaultValues = isEdit
    ? {
        type: testQuery.data!.type,
        name: testQuery.data!.name,
        subject: subjectId,
        topics: topicIds,
        sub_topics: subTopicIds,
        total_time: testQuery.data!.total_time,
        difficulty: testQuery.data!.difficulty,
        wrong_marks: testQuery.data!.wrong_marks,
        unattempt_marks: testQuery.data!.unattempt_marks,
        correct_marks: testQuery.data!.correct_marks,
        total_questions: testQuery.data!.total_questions,
      }
    : undefined

  return (
    <div>
      <div className="mb-6 flex items-center justify-between text-sm text-secondary-text">
        <div>
          <Link to="/tests/new" className="hover:text-heading">
            Test Creation
          </Link>
          {' / '}
          <span className="text-heading">{isEdit ? 'Edit Test' : 'Create Test'}</span>
          {' / '}
          <span className="text-heading">Chapter Wise</span>
        </div>
      </div>

      <TestDetailsForm
        key={isEdit ? id : 'new'}
        defaultValues={defaultValues}
        submitLabel="Next"
        submitting={isEdit ? updateMutation.isPending : createMutation.isPending}
        onCancel={() => navigate('/')}
        onSubmit={(values, totalMarks) => {
          const payload = toPayload(values, totalMarks)
          if (isEdit) updateMutation.mutate(payload)
          else createMutation.mutate(payload)
        }}
        secondaryAction={{
          label: 'Save as Draft',
          loading: saveDraftMutation.isPending,
          onClick: (values, totalMarks) => saveDraftMutation.mutate(toPayload(values, totalMarks)),
        }}
      />
    </div>
  )
}
