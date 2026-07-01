import { useQuery } from '@tanstack/react-query'
import { getSubjects, getSubTopicsByTopics, getTopicsBySubject } from '@/api/subjects'
import type { Test } from '@/types/api'

/**
 * GET /tests/:id resolves subject/topics/sub_topics to human-readable
 * names, but the create/update payload (and the form's dropdowns) need
 * UUIDs. This cross-references the subjects/topics/sub-topics lists to
 * map the test's names back to ids so the edit form can be pre-filled.
 */
export function useResolveTestIds(test: Test | undefined) {
  const subjectsQuery = useQuery({ queryKey: ['subjects'], queryFn: getSubjects })
  const subjectId = subjectsQuery.data?.find((s) => s.name === test?.subject)?.id ?? ''

  const topicsQuery = useQuery({
    queryKey: ['topics', subjectId],
    queryFn: () => getTopicsBySubject(subjectId),
    enabled: Boolean(subjectId),
  })
  const topicIds =
    test && topicsQuery.data
      ? topicsQuery.data.filter((t) => test.topics.includes(t.name)).map((t) => t.id)
      : []

  const subTopicsQuery = useQuery({
    queryKey: ['sub-topics', topicIds],
    queryFn: () => getSubTopicsByTopics(topicIds),
    enabled: topicIds.length > 0,
  })
  const subTopicIds =
    test && subTopicsQuery.data
      ? subTopicsQuery.data.filter((s) => test.sub_topics.includes(s.name)).map((s) => s.id)
      : []

  const ready =
    Boolean(test) &&
    subjectsQuery.isSuccess &&
    (test?.topics.length === 0 || topicsQuery.isSuccess) &&
    (test?.sub_topics.length === 0 || subTopicsQuery.isSuccess)

  return { subjectId, topicIds, subTopicIds, ready }
}
