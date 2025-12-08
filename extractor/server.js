const express = require('express')
const cors = require('cors')
const formidable = require('formidable')
const fs = require('fs')
const { processDocument } = require('./pipeline')
const Redis = require('ioredis')

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080

// Enable CORS for browser uploads. In production consider restricting origin.
app.use(cors())

// Handle preflight for /extract
app.options('/extract', cors())

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'AI extractor service' })
})

// Simple Redis health-check endpoint. Returns PONG when REDIS_URL is reachable.
let _redisClient = null
function getRedisClient() {
  if (_redisClient) return _redisClient
  const url = process.env.REDIS_URL
  if (!url) return null
  _redisClient = new Redis(url)
  // prevent unhandled rejections from killing the process
  _redisClient.on('error', (e) => console.warn('[redis] error', e && e.message))
  return _redisClient
}

app.get('/health/redis', async (_req, res) => {
  const url = process.env.REDIS_URL
  if (!url) return res.status(400).json({ ok: false, error: 'REDIS_URL not set' })
  const client = getRedisClient()
  if (!client) return res.status(500).json({ ok: false, error: 'Failed to create Redis client' })
  try {
    const pong = await client.ping()
    return res.json({ ok: true, redis: pong })
  } catch (e) {
    console.error('redis ping failed', e)
    return res.status(500).json({ ok: false, error: String(e && e.message) })
  }
})

app.post('/extract', (req, res) => {
  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('form parse error', err)
      return res.status(400).json({ error: 'Invalid form upload' })
    }
    const file = files.file || files.upload || files[Object.keys(files)[0]]
      if (!file) return res.status(400).json({ error: 'Missing file' })
    try {
        // Normalize possible shapes from formidable
        let fileItem = file
        if (Array.isArray(fileItem)) fileItem = fileItem[0]
        const filePath = (fileItem && (fileItem.filepath || fileItem.path || (fileItem._writeStream && fileItem._writeStream.path)))
        if (!filePath) {
          console.error('upload shape', Object.keys(files), fileItem)
          return res.status(400).json({ error: 'Unable to locate uploaded file on disk' })
        }
        const buffer = await fs.promises.readFile(filePath)
      const docType = typeof fields.docType === 'string' ? fields.docType : undefined
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
