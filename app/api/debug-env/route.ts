import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export function GET() {
  const out: Record<string, string | undefined> = {}
  Object.keys(process.env || {}).forEach((k) => {
    if (k.startsWith('NEXT_PUBLIC_')) {
      out[k] = process.env[k]
    }
  })
  return NextResponse.json(out)
}
