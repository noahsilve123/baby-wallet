import { NextResponse } from 'next/server'
import { Queue } from 'bullmq'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  scholarshipName: z.string().min(2),
  deadline: z.string().min(4),
  daysBefore: z.number().int().min(1).max(30),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.parse(body)
    const connectionString = process.env.REDIS_URL

    if (!connectionString) {
      return NextResponse.json({ ok: false, message: 'Reminders unavailable (no REDIS_URL set).' }, { status: 503 })
    }

    const queue = new Queue('reminders', { connection: { url: connectionString } })
    await queue.add('reminder', parsed, {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[reminders] failed to enqueue', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: 'Invalid payload' }, { status: 400 })
    }
    return NextResponse.json({ ok: false, message: 'Unable to schedule reminder right now.' }, { status: 500 })
  }
}
