import { create } from 'zustand'
import type { CorrectOption, Difficulty } from '@/types/api'

/**
 * The API has no endpoint to update or delete a single question once it's
 * been created (only POST /questions/bulk and POST /questions/fetchBulk
 * exist). So "editing" a question that's already been persisted works by
 * creating a replacement row and swapping its id into the test's
 * `questions` array — the orphaned old row is harmless and stays in the DB.
 * `persistedId` tracks whether a draft has been synced yet.
 */
export interface QuestionDraft {
  localId: string
  persistedId?: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correctOption: CorrectOption
  explanation: string
  difficulty?: Difficulty
  topicId?: string
  subTopicId?: string
  mediaUrl?: string
  dirty: boolean
}

export function emptyQuestionDraft(): QuestionDraft {
  return {
    localId: crypto.randomUUID(),
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctOption: 'option1',
    explanation: '',
    dirty: true,
  }
}

interface TestDraftState {
  testId: string | null
  questions: QuestionDraft[]
  activeIndex: number
  hydrate: (testId: string, questions: QuestionDraft[]) => void
  reset: () => void
  addQuestion: () => void
  updateQuestion: (localId: string, patch: Partial<QuestionDraft>) => void
  removeQuestion: (localId: string) => void
  setActiveIndex: (index: number) => void
  markSynced: (localId: string, persistedId: string) => void
}

export const useTestDraftStore = create<TestDraftState>()((set) => ({
  testId: null,
  questions: [],
  activeIndex: 0,
  hydrate: (testId, questions) =>
    set({
      testId,
      questions: questions.length > 0 ? questions : [emptyQuestionDraft()],
      activeIndex: 0,
    }),
  reset: () => set({ testId: null, questions: [], activeIndex: 0 }),
  addQuestion: () =>
    set((state) => ({
      questions: [...state.questions, emptyQuestionDraft()],
      activeIndex: state.questions.length,
    })),
  updateQuestion: (localId, patch) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.localId === localId ? { ...q, ...patch, dirty: true } : q,
      ),
    })),
  removeQuestion: (localId) =>
    set((state) => {
      const questions = state.questions.filter((q) => q.localId !== localId)
      return {
        questions: questions.length > 0 ? questions : [emptyQuestionDraft()],
        activeIndex: Math.max(0, Math.min(state.activeIndex, questions.length - 1)),
      }
    }),
  setActiveIndex: (index) => set({ activeIndex: index }),
  markSynced: (localId, persistedId) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.localId === localId ? { ...q, persistedId, dirty: false } : q,
      ),
    })),
}))
