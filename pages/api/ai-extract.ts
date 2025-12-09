import type { NextApiRequest, NextApiResponse } from 'next'

// This endpoint is intentionally lightweight. Extraction now runs client-side.
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(410).json({ ok: false, message: 'AI extraction moved to client-side. Use the client component.' })
}
