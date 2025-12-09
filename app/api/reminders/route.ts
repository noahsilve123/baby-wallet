import { NextResponse } from 'next/server'

// Reminders are not supported in the client-only build. Return a lightweight response.
export async function POST() {
  return NextResponse.json({ ok: false, message: 'Reminders are disabled in this client-only configuration.' }, { status: 410 })
}
