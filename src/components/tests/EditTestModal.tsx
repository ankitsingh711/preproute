import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { TestDetailsForm } from '@/components/tests/TestDetailsForm'
import type { TestFormValues } from '@/components/tests/testFormSchema'
import { updateTest } from '@/api/tests'
import { useResolveTestIds } from '@/hooks/useResolveTestIds'
import type { CreateTestPayload, Test } from '@/types/api'

interface EditTestModalProps {
  test: Test
  open: boolean
  onClose: () => void
}

export function EditTestModal({ test, open, onClose }: EditTestModalProps) {
  const queryClient = useQueryClient()
  const { subjectId, topicIds, subTopicIds, ready } = useResolveTestIds(open ? test : undefined)

  const updateMutation = useMutation({
    mutationFn: (payload: CreateTestPayload) => updateTest(test.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      queryClient.invalidateQueries({ queryKey: ['test', test.id] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Edit Test creation" maxWidth="max-w-4xl">
      {!ready ? (
        <p className="text-sm text-muted">Loading test details…</p>
      ) : (
        <TestDetailsForm
          key={test.id}
          defaultValues={{
            type: test.type,
            name: test.name,
            subject: subjectId,
            topics: topicIds,
            sub_topics: subTopicIds,
            total_time: test.total_time,
            difficulty: test.difficulty,
            wrong_marks: test.wrong_marks,
            unattempt_marks: test.unattempt_marks,
            correct_marks: test.correct_marks,
            total_questions: test.total_questions,
          }}
          submitLabel="Save"
          submitting={updateMutation.isPending}
          onCancel={onClose}
          onSubmit={(values: TestFormValues, totalMarks) => {
            updateMutation.mutate({
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
              status: test.status,
            })
          }}
        />
      )}
    </Modal>
  )
}
