import { apiClient, request } from '@/api/client'
import type { Subject, SubTopic, Topic } from '@/types/api'

export function getSubjects() {
  return request<Subject[]>(apiClient.get('/subjects'))
}

export function getTopicsBySubject(subjectId: string) {
  return request<Topic[]>(apiClient.get(`/topics/subject/${subjectId}`))
}

export function getSubTopicsByTopic(topicId: string) {
  return request<SubTopic[]>(apiClient.get(`/sub-topics/topic/${topicId}`))
}

export function getSubTopicsByTopics(topicIds: string[]) {
  return request<SubTopic[]>(
    apiClient.post('/sub-topics/multi-topics', { topicIds }),
  )
}
