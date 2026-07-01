import { apiClient, ApiError, request } from '@/api/client'
import type { CreateQuestionPayload, Question } from '@/types/api'

export function fetchQuestionsBulk(questionIds: string[]) {
  if (questionIds.length === 0) return Promise.resolve<Question[]>([])
  return request<Question[]>(
    apiClient.post('/questions/fetchBulk', { question_ids: questionIds }),
  )
}

/**
 * The live staging server has been inconsistent about the topic/sub_topic
 * field contract on this endpoint (intermittent PostgREST schema-cache
 * errors on identical payloads). `subject` is reliably required. If the
 * first attempt fails, we retry once without the optional topic/sub_topic
 * fields rather than losing the whole batch to a flaky field.
 */
export async function createQuestionsBulk(questions: CreateQuestionPayload[]) {
  try {
    return await request<Question[]>(
      apiClient.post('/questions/bulk', { questions }),
    )
  } catch (error) {
    const hasOptionalFields = questions.some((q) => q.topic || q.sub_topic)
    if (!hasOptionalFields || !(error instanceof ApiError)) throw error

    const stripped = questions.map(({ topic: _topic, sub_topic: _subTopic, ...rest }) => rest)
    return request<Question[]>(apiClient.post('/questions/bulk', { questions: stripped }))
  }
}
