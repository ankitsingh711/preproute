import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tabs } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { NumberStepper } from '@/components/ui/NumberStepper'
import { Button } from '@/components/ui/Button'
import { useTestFormOptions } from '@/hooks/useTestFormOptions'
import { testFormSchema, testFormDefaults, type TestFormValues } from '@/components/tests/testFormSchema'
import type { TestType } from '@/types/api'

const typeTabs: Array<{ value: TestType; label: string }> = [
  { value: 'chapterwise', label: 'Chapterwise' },
  { value: 'pyq', label: 'PYQ' },
  { value: 'mock', label: 'Mock Test' },
]

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'difficult', label: 'Difficult' },
]

interface TestDetailsFormProps {
  defaultValues?: Partial<TestFormValues>
  onSubmit: (values: TestFormValues, totalMarks: number) => void
  submitting?: boolean
  submitLabel: string
  onCancel: () => void
  secondaryAction?: { label: string; onClick: (values: TestFormValues, totalMarks: number) => void; loading?: boolean }
}

export function TestDetailsForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel,
  onCancel,
  secondaryAction,
}: TestDetailsFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: { ...testFormDefaults, ...defaultValues },
  })

  const type = watch('type')
  const subject = watch('subject')
  const topics = watch('topics')
  const correctMarks = watch('correct_marks')
  const totalQuestions = watch('total_questions')
  const totalMarks = (Number(correctMarks) || 0) * (Number(totalQuestions) || 0)

  const { subjects, topics: topicOptions, subTopics: subTopicOptions } = useTestFormOptions(
    subject,
    topics,
  )

  useEffect(() => {
    setValue('topics', [])
    setValue('sub_topics', [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject])

  useEffect(() => {
    const validIds = new Set(subTopicOptions.map((s) => s.id))
    const current = watch('sub_topics')
    const filtered = current.filter((id) => validIds.has(id))
    if (filtered.length !== current.length) setValue('sub_topics', filtered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTopicOptions])

  function submit(values: TestFormValues) {
    onSubmit(values, totalMarks)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-8">
      <Tabs
        options={typeTabs}
        value={type}
        onChange={(v) => setValue('type', v as TestType)}
        className="w-fit"
      />

      <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
        <Select
          id="subject"
          label="Subject"
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          error={errors.subject?.message}
          {...register('subject')}
        />
        <Input
          id="name"
          label="Name of Test"
          placeholder="Enter name of Test"
          error={errors.name?.message}
          {...register('name')}
        />

        <Controller
          control={control}
          name="topics"
          render={({ field }) => (
            <MultiSelect
              label="Topic"
              options={topicOptions.map((t) => ({ value: t.id, label: t.name }))}
              value={field.value}
              onChange={field.onChange}
              error={errors.topics?.message}
              disabled={!subject}
            />
          )}
        />
        <Controller
          control={control}
          name="sub_topics"
          render={({ field }) => (
            <MultiSelect
              label="Sub Topic"
              options={subTopicOptions.map((s) => ({ value: s.id, label: s.name }))}
              value={field.value}
              onChange={field.onChange}
              disabled={topics.length === 0}
            />
          )}
        />

        <Input
          id="total_time"
          type="number"
          label="Duration (Minutes)"
          placeholder="Enter the time"
          error={errors.total_time?.message}
          {...register('total_time', { valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="difficulty"
          render={({ field }) => (
            <RadioGroup
              name="difficulty"
              label="Test Difficulty Level"
              options={difficultyOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div>
        <p className="mb-4 text-sm font-medium text-heading">Marking Scheme:</p>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6 md:grid-cols-5">
          <Controller
            control={control}
            name="wrong_marks"
            render={({ field }) => (
              <NumberStepper label="Wrong Answer" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="unattempt_marks"
            render={({ field }) => (
              <NumberStepper label="Unattempted" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="correct_marks"
            render={({ field }) => (
              <NumberStepper label="Correct Answer" value={field.value} onChange={field.onChange} />
            )}
          />
          <Input
            id="total_questions"
            type="number"
            label="No of Questions"
            placeholder="Ex:250 Marks"
            error={errors.total_questions?.message}
            {...register('total_questions', { valueAsNumber: true })}
          />
          <Input
            label="Total Marks"
            value={totalMarks || ''}
            placeholder="Ex:250 Marks"
            disabled
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        {secondaryAction && (
          <Button
            type="button"
            variant="secondary"
            loading={secondaryAction.loading}
            onClick={handleSubmit((values) => secondaryAction.onClick(values, totalMarks))}
          >
            {secondaryAction.label}
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
