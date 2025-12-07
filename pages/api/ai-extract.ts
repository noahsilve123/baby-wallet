import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

// Lazy import the heavy pipeline at request time to avoid module-initialization
// failures in the Serverless Function environment (model downloads, native deps).
import type { DocumentType } from '../../app/lib/extractionRules'
import { isDocumentType } from '../../app/lib/extractionRules'

export const config = {
  api: {
    bodyParser: false,
  },
}

function parseForm(req: NextApiRequest): Promise<{ files: formidable.File[]; fields: formidable.Fields }> {
  const form = formidable({ maxFileSize: 20 * 1024 * 1024 }) // 20MB
  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      const fileArray: formidable.File[] = []
      // `files` may be an object with keys; flatten into array
      for (const key of Object.keys(files || {})) {
        const value = (files as any)[key]
        if (Array.isArray(value)) {
          fileArray.push(...value)
        } else if (value) {
          fileArray.push(value as formidable.File)
        }
      }
      resolve({ files: fileArray, fields })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'ai-extract endpoint (pages/api) is alive' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const { files, fields } = await parseForm(req)
    const file = files.find((f) => !!f && typeof f === 'object')
    if (!file) {
      return res.status(400).json({ error: 'Missing file in upload' })
    }

    const declaredType = typeof fields.docType === 'string' ? fields.docType : (Array.isArray(fields.docType) ? fields.docType[0] : undefined)
    const docType: DocumentType = typeof declaredType === 'string' && isDocumentType(declaredType) ? declaredType : 'Other'

    // Read file into buffer
    const buffer = fs.readFileSync(file.filepath || (file as any).path)

    // Lazy-load the heavy pipeline module here so module initialization doesn't
    // fail when Vercel builds the function (avoid throws from native deps).
    let processDocument: (buf: Buffer, opts: { docType: DocumentType }) => Promise<any>
    try {
      // Use dynamic import so build-time bundling doesn't execute heavy code.
      const mod = await import('../../app/lib/aiExtractionPipeline')
      processDocument = mod.processDocument
    } catch (impErr) {
      console.error('[pages/api/ai-extract] failed to import pipeline', impErr)
      return res.status(500).json({ error: 'Pipeline temporarily unavailable' })
    }

    const { text, ocrText, fields: extractedFields, validated } = await processDocument(buffer, { docType })

    return res.status(200).json({ text, ocrText, fields: extractedFields, validated })
  } catch (error) {
    console.error('[pages/api/ai-extract] failed', error)
    return res.status(500).json({ error: 'Unable to process document right now.' })
  }
}
