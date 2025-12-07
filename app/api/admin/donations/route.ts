import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'donations.json')
    const raw = fs.readFileSync(dataPath, 'utf8')
    const parsed = JSON.parse(raw || '[]')
    return new Response(JSON.stringify(parsed), { status: 200 })
  } catch (err) {
    console.error('Failed to read donations', err)
    return new Response(JSON.stringify([]), { status: 200 })
  }
}
