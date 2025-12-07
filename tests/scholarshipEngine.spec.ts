import { expect, test } from '@playwright/test'
import { matchScholarships } from '../app/lib/scholarshipEngine'

// Happy path: state + first-gen + need-based should surface a local match first
// and include deterministic reasons.
test('scholarship scoring favors local first-gen need-based students', () => {
  const results = matchScholarships({
    location: 'NJ',
    interests: ['stem', 'community'],
    gpa: 3.4,
    incomeBracket: '60k-90k',
    firstGen: true,
    feedback: {},
  })

  const topMatch = results[0]
  expect(topMatch?.id).toBe('shs-community-bridge')
  expect(topMatch?.reasons).toEqual(
    expect.arrayContaining([
      'Local or regional priority match',
      'First-generation priority boost',
      'Income within need-based window',
    ]),
  )
})

// Edge case: feedback is clamped and sorting stays deterministic even when a
// user down-ranks a national scholarship heavily.
test('feedback weight is clamped and deterministic', () => {
  const results = matchScholarships({
    location: 'CA',
    interests: ['arts'],
    gpa: 3.0,
    incomeBracket: 'above-140k',
    firstGen: false,
    feedback: { 'arts-forward': -50 },
  })

  const arts = results.find((item) => item.id === 'arts-forward')
  expect(arts).toBeDefined()
  // Clamp keeps the score positive (national + interest + deadline) despite a large down-rank request.
  expect((arts?.score ?? 0)).toBeGreaterThan(0)
  expect(arts?.reasons).toContain('Deprioritized based on your feedback')
})
