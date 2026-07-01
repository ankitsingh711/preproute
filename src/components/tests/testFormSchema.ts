import { z } from 'zod'

export const testFormSchema = z.object({
  type: z.enum(['chapterwise', 'pyq', 'mock']),
  name: z.string().min(1, 'Test name is required'),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()),
  total_time: z.number({ error: 'Enter a valid duration' }).int().positive('Enter a valid duration'),
  difficulty: z.enum(['easy', 'medium', 'difficult']),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  correct_marks: z.number(),
  total_questions: z
    .number({ error: 'Enter number of questions' })
    .int()
    .positive('Enter number of questions'),
})

export type TestFormValues = z.infer<typeof testFormSchema>

export const testFormDefaults: TestFormValues = {
  type: 'chapterwise',
  name: '',
  subject: '',
  topics: [],
  sub_topics: [],
  total_time: 60,
  difficulty: 'easy',
  wrong_marks: -1,
  unattempt_marks: 0,
  correct_marks: 5,
  total_questions: 1,
}
