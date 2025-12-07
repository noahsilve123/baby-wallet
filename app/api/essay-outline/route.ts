import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  prompt: z.string().min(10).max(2000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt } = schema.parse(body)

    const outline = buildOutline(prompt)
    return NextResponse.json({ outline })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Please provide a prompt (10-2000 chars).' }, { status: 400 })
    }
    console.error('[essay-outline] failed', error)
    return NextResponse.json({ error: 'Unable to draft an outline right now.' }, { status: 500 })
  }
}

function buildOutline(prompt: string): string[] {
  const cleaned = prompt.trim().replace(/\s+/g, ' ')
  return [
    'Hook: a vivid 1-2 sentence opener tied to your lived experience.',
    `Context: why this matters to you (${cleaned.slice(0, 120)}${cleaned.length > 120 ? '…' : ''}).`,
    'Body 1: challenge faced, actions you took, and what changed.',
    'Body 2: skills demonstrated (leadership, initiative, resilience) and outcomes.',
    'Body 3: reflection on growth and how it connects to your intended major or community impact.',
    'Closing: forward-looking statement about how you will apply these lessons in college.',
  ]
}
