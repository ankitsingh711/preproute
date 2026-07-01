import { useQuery } from '@tanstack/react-query'
import { getSubjects, getSubTopicsByTopics, getTopicsBySubject } from '@/api/subjects'

export function useTestFormOptions(subjectId: string, topicIds: string[]) {
  const subjectsQuery = useQuery({ queryKey: ['subjects'], queryFn: getSubjects })

  const topicsQuery = useQuery({
    queryKey: ['topics', subjectId],
    queryFn: () => getTopicsBySubject(subjectId),
    enabled: Boolean(subjectId),
  })

  const subTopicsQuery = useQuery({
    queryKey: ['sub-topics', topicIds],
    queryFn: () => getSubTopicsByTopics(topicIds),
    enabled: topicIds.length > 0,
  })

  return {
    subjects: subjectsQuery.data ?? [],
    topics: topicsQuery.data ?? [],
    subTopics: subTopicsQuery.data ?? [],
    isLoadingSubjects: subjectsQuery.isLoading,
    isLoadingTopics: topicsQuery.isLoading,
    isLoadingSubTopics: subTopicsQuery.isLoading,
  }
}
