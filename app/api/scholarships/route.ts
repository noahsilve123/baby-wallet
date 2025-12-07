import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { matchScholarships, type StudentProfile } from '../../lib/scholarshipEngine'

const profileSchema = z.object({
  location: z.string().trim().min(2).max(30),
  interests: z.array(z.string().trim().min(1)).max(20),
  gpa: z.number().min(0).max(4.5).optional(),
  incomeBracket: z.enum(['below-60k', '60k-90k', '90k-140k', 'above-140k']).optional(),
  firstGen: z.boolean().optional(),
  feedback: z.record(z.string(), z.number()).optional(),
})

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => ({}))
    const parsed = profileSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })
    }

    const profile: StudentProfile = parsed.data
    const results = matchScholarships(profile)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('[scholarships] failed to build list', error)
    return NextResponse.json({ error: 'Unable to build scholarship recommendations right now.' }, { status: 500 })
  }
}

// legacy helpers removed after zod validation tightened the schema
