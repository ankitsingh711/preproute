import Papa from 'papaparse'
import { emptyQuestionDraft, type QuestionDraft } from '@/store/testDraftStore'
import type { CorrectOption, Difficulty } from '@/types/api'

interface CsvRow {
  question?: string
  option1?: string
  option2?: string
  option3?: string
  option4?: string
  correct_option?: string
  explanation?: string
  difficulty?: string
}

const correctOptionAliases: Record<string, CorrectOption> = {
  option1: 'option1',
  option2: 'option2',
  option3: 'option3',
  option4: 'option4',
  '1': 'option1',
  '2': 'option2',
  '3': 'option3',
  '4': 'option4',
  a: 'option1',
  b: 'option2',
  c: 'option3',
  d: 'option4',
}

const difficultyAliases: Record<string, Difficulty> = {
  easy: 'easy',
  medium: 'medium',
  difficult: 'difficult',
  hard: 'difficult',
}

export interface ParseQuestionsCsvResult {
  drafts: QuestionDraft[]
  errors: string[]
}

export function parseQuestionsCsv(csvText: string): ParseQuestionsCsvResult {
  const { data, errors: parseErrors } = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
  })

  const errors = parseErrors.map((e) => `Row ${e.row ?? '?'}: ${e.message}`)
  const drafts: QuestionDraft[] = []

  data.forEach((row, i) => {
    const rowNum = i + 2 // account for header row, 1-indexed
    const question = row.question?.trim()
    const option1 = row.option1?.trim()
    const option2 = row.option2?.trim()
    const option3 = row.option3?.trim()
    const option4 = row.option4?.trim()

    if (!question || !option1 || !option2 || !option3 || !option4) {
      errors.push(`Row ${rowNum}: missing question text or one of the 4 options — skipped`)
      return
    }

    const correctRaw = row.correct_option?.trim().toLowerCase() ?? 'option1'
    const correctOption = correctOptionAliases[correctRaw]
    if (!correctOption) {
      errors.push(
        `Row ${rowNum}: correct_option "${row.correct_option}" not recognized (use option1-4, 1-4, or A-D) — defaulted to option1`,
      )
    }

    const difficultyRaw = row.difficulty?.trim().toLowerCase()
    const difficulty = difficultyRaw ? difficultyAliases[difficultyRaw] : undefined

    drafts.push({
      ...emptyQuestionDraft(),
      question,
      option1,
      option2,
      option3,
      option4,
      correctOption: correctOption ?? 'option1',
      explanation: row.explanation?.trim() ?? '',
      difficulty,
    })
  })

  if (drafts.length === 0 && errors.length === 0) {
    errors.push('No rows found in this CSV.')
  }

  return { drafts, errors }
}
