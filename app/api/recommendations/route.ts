import { NextRequest, NextResponse } from 'next/server'
import { buildRecommendations, type RecommendationProfile } from '../../lib/recommendations'

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RecommendationProfile
    const results = buildRecommendations(payload)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('[recommendations] failed', error)
    return NextResponse.json({ error: 'Unable to generate recommendations.' }, { status: 500 })
  }
}
