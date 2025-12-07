import express from 'express'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { processDocument } from '../app/lib/aiExtractionPipeline'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'AI extractor service (stub)'} )
})

app.post('/extract', async (req, res) => {
  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('form parse error', err)
      return res.status(400).json({ error: 'Invalid form upload' })
    }
    const file = (files as any).file
    if (!file) return res.status(400).json({ error: 'Missing file' })
    try {
      const filePath = file.filepath || file.path || file.path
      const buffer = await fs.promises.readFile(filePath)
      const docType = typeof (fields as any).docType === 'string' ? (fields as any).docType : undefined
      const result = await processDocument(buffer, { docType })
      return res.json({ text: result.text, fields: result.fields })
    } catch (e) {
      console.error('extract error', e)
      return res.status(500).json({ error: 'Processing failed' })
    }
  })
})

app.listen(PORT, () => {
  console.log(`Extractor service listening on http://localhost:${PORT}`)
})
