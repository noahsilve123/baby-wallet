import fs from 'fs'
import path from 'path'
import type { NextRequest } from 'next/server'

type DonationRecord = {
  id: string
  amount?: number | null
  currency?: string | null
  email?: string | null
  status?: string
  payment_intent?: string | null
  createdAt?: string
}

const dataPath = path.join(process.cwd(), 'data', 'donations.json')

function readAll(): DonationRecord[] {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(raw || '[]') as DonationRecord[]
  } catch {
    return []
  }
}

function writeAll(items: DonationRecord[]) {
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })
  let body = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const items = readAll()
  let changed = false
  const updated = items.map((it) => {
    if (String(it.id) === String(id)) {
      changed = true
      return { ...it, ...body }
    }
    return it
  })
  if (changed) writeAll(updated)
  return new Response(JSON.stringify({ ok: changed }), { status: changed ? 200 : 404 })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  void _req
  const { id } = await params
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })
  const items = readAll()
  const filtered = items.filter((it) => String(it.id) !== String(id))
  if (filtered.length === items.length) return new Response(JSON.stringify({ ok: false }), { status: 404 })
  writeAll(filtered)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
