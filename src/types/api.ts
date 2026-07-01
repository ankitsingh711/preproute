// Shapes below reflect the *live* staging API responses (verified via curl),
// not the provided doc — the doc's envelope ({success, data}) and a few
// field contracts don't match what the server actually returns/expects.

export interface ApiEnvelope<T> {
  status: 'success' | 'error'
  message: string
  data: T
}

export interface ApiErrorPayload {
  status: 'error'
  message: string
  errors?:
    | { code?: string; details?: string | null; hint?: string | null; message?: string }
    | Array<{ type: string; value?: unknown; msg: string; path: string; location: string }>
}

export interface User {
  id: string
  userId: string
  name: string
  role: string
  subrole: string | null
  phone?: string
  joiningDate?: string
  endDate?: string
  lastActive?: string
  payment?: boolean
}

export interface LoginResponseData {
  token: string
  user: User
}

export interface Subject {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  subject_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface SubTopic {
  id: string
  topic_id: string
  name: string
  created_at: string
  updated_at: string
}

export type TestType = 'chapterwise' | 'pyq' | 'mock'
export type TestStatus = 'live' | 'unpublished' | 'scheduled' | 'expired' | 'draft'
export type Difficulty = 'easy' | 'medium' | 'difficult'

// As returned by GET /tests and GET /tests/:id — subject/topics/sub_topics
// are resolved to human-readable names here.
export interface Test {
  id: string
  name: string
  type: TestType
  subject: string
  topics: string[]
  sub_topics: string[]
  questions: string[] | null
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: Difficulty
  total_marks: number
  total_time: number
  total_questions: number
  slot: string | null
  hidden_from_moderator: boolean | null
  created_by: number
  created_at: string
  updated_by: number | null
  updated_at: string | null
  paragraph_question: string | null
  status: TestStatus
  scheduled_date: string | null
  expiry_date: string | null
  original_files?: string[]
}

// Payload for POST /tests — subject/topics/sub_topics must be UUIDs here.
export interface CreateTestPayload {
  name: string
  type: TestType
  subject: string
  topics: string[]
  sub_topics: string[]
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: Difficulty
  total_time: number
  total_marks: number
  total_questions: number
  status: TestStatus
}

export interface UpdateTestPayload {
  name?: string
  type?: TestType
  subject?: string
  topics?: string[]
  sub_topics?: string[]
  questions?: string[]
  correct_marks?: number
  wrong_marks?: number
  unattempt_marks?: number
  difficulty?: Difficulty
  total_time?: number
  total_marks?: number
  total_questions?: number
  status?: TestStatus
  scheduled_date?: string | null
  expiry_date?: string | null
}

export type CorrectOption = 'option1' | 'option2' | 'option3' | 'option4'

export interface Question {
  id: string
  type: 'mcq'
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: CorrectOption
  explanation: string | null
  difficulty: Difficulty | null
  paragraph: string | null
  media_url: string | null
  created_by: number
  created_at: string
  updated_by: number | null
  updated_at: string | null
  test_id: string
  category: string | null
  subject: string | null
  topic: string | null
  sub_topic: string | null
}

// Payload for POST /questions/bulk. `subject` must be a subject UUID
// (undocumented but required by the live server). topic/sub_topic are
// best-effort — the server has been flaky about the expected format.
export interface CreateQuestionPayload {
  type: 'mcq'
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: CorrectOption
  explanation?: string
  difficulty?: Difficulty
  test_id: string
  subject: string
  topic?: string
  sub_topic?: string
  media_url?: string
}
