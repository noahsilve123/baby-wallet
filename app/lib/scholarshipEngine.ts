import { scholarships, type Scholarship } from '../data/scholarships'

type IncomeBracket = 'below-60k' | '60k-90k' | '90k-140k' | 'above-140k'
export type StudentProfile = {
  location: string
  interests: string[]
  gpa?: number
  incomeBracket?: IncomeBracket
  firstGen?: boolean
  feedback?: FeedbackWeights
}

export type ScholarshipMatch = Scholarship & {
  score: number
  reasons: string[]
  checklist: { id: string; label: string; done: boolean }[]
  eligibilityNote?: string
}

export type FeedbackWeights = Record<string, number>

// Deterministic weights for transparent scoring; documented here and in README.
const WEIGHTS = {
  nationalScope: 10,
  stateScope: 25,
  localScope: 46,
  gpaMatch: 20,
  gpaBelow: -15,
  incomeWithin: 18,
  incomeAbove: -8,
  firstGen: 15,
  interest: 22,
  deadlinePast: -12,
  deadlineSoon: 14,
  deadlineNear: 8,
  deadlineLater: 4,
  feedbackCap: 12,
} as const

const baseChecklist = [
  'Create scholarship tracker spreadsheet',
  'Request counselor/teacher recommendation letters',
  'Draft personal statement and resume',
  'Complete FAFSA or state aid form',
]

export function matchScholarships(profile: StudentProfile): ScholarshipMatch[] {
  const normalizedState = profile.location.trim().toUpperCase() || 'NJ'
  const interestSet = new Set(profile.interests.map((value) => value.trim().toLowerCase()))
  const feedbackWeights = profile.feedback ?? {}
  const results: ScholarshipMatch[] = scholarships.map((item) => {
    const reasons: string[] = []
    let score = 0
    let eligibilityNote: string | undefined

    if (item.locationScope === 'national') {
      score += WEIGHTS.nationalScope
      reasons.push('Open to students in all states')
    }

    if (item.locationScope === 'state' && item.states.includes(normalizedState)) {
      score += WEIGHTS.stateScope
      reasons.push(`Eligible for ${normalizedState} residents`)
    }

    if (item.locationScope === 'local' && item.states.includes(normalizedState)) {
      score += WEIGHTS.localScope
      reasons.push('Local or regional priority match')
    }

    if (typeof item.gpaMin === 'number' && typeof profile.gpa === 'number') {
      if (profile.gpa >= item.gpaMin) {
        score += WEIGHTS.gpaMatch
        reasons.push(`Meets GPA ${item.gpaMin}+ requirement`)
      } else {
        score += WEIGHTS.gpaBelow
        reasons.push(`Below GPA ${item.gpaMin} preference`)
        eligibilityNote = `Your GPA is below the preferred minimum of ${item.gpaMin}.`
      }
    }

    if (typeof item.incomeMax === 'number' && profile.incomeBracket) {
      const estimatedIncome = estimateIncome(profile.incomeBracket)
      if (estimatedIncome <= item.incomeMax) {
        score += WEIGHTS.incomeWithin
        reasons.push('Income within need-based window')
      } else {
        score += WEIGHTS.incomeAbove
        reasons.push('Income above typical preference')
        eligibilityNote = eligibilityNote ?? 'Income may be above the preferred range.'
      }
    }

    if (item.firstGenPreferred && profile.firstGen) {
      score += WEIGHTS.firstGen
      reasons.push('First-generation priority boost')
    }

    if (interestMatch(item, interestSet)) {
      score += WEIGHTS.interest
      reasons.push('Aligned with stated interests/major')
    }

    const feedbackBoost = clamp(feedbackWeights[item.id] ?? 0, -WEIGHTS.feedbackCap, WEIGHTS.feedbackCap)
    if (feedbackBoost !== 0) {
      score += feedbackBoost
      reasons.push(feedbackBoost > 0 ? 'Boosted based on your feedback' : 'Deprioritized based on your feedback')
    }

    // recency boost for near deadlines
    score += deadlineBoost(item.deadline)

    const checklist = buildChecklist(item)

    return { ...item, score, reasons, checklist, eligibilityNote }
  })

  return results
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score === a.score) return a.name.localeCompare(b.name)
      return b.score - a.score
    })
    .slice(0, 12)
}

function interestMatch(item: Scholarship, interests: Set<string>): boolean {
  if (interests.size === 0) return true
  if (item.interests.includes('any')) return true
  return item.interests.some((interest) => interests.has(interest.toLowerCase()))
}

function estimateIncome(bracket: IncomeBracket): number {
  switch (bracket) {
    case 'below-60k':
      return 50000
    case '60k-90k':
      return 75000
    case '90k-140k':
      return 115000
    case 'above-140k':
    default:
      return 150000
  }
}

function deadlineBoost(deadline: string): number {
  const target = Date.parse(deadline)
  if (Number.isNaN(target)) return 0
  const now = Date.now()
  const days = (target - now) / (1000 * 60 * 60 * 24)
  if (days < 0) return WEIGHTS.deadlinePast
  if (days < 14) return WEIGHTS.deadlineSoon
  if (days < 45) return WEIGHTS.deadlineNear
  return WEIGHTS.deadlineLater
}

function buildChecklist(scholarship: Scholarship) {
  const base = baseChecklist.map((item, index) => ({ id: `base-${index}`, label: item, done: false }))
  const specific = scholarship.requirements.map((item, index) => ({ id: `req-${index}`, label: item, done: false }))
  return [...base, ...specific]
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
