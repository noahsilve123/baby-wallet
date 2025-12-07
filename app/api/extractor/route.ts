import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { createRequire } from 'module'
import { extractFieldsFromText, isDocumentType, type DocumentType } from '../../lib/extractionRules'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing PDF file in upload.' }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty. Try exporting the PDF again.' }, { status: 400 })
    }

    const declaredType = formData.get('docType')
    const docType: DocumentType = typeof declaredType === 'string' && isDocumentType(declaredType) ? declaredType : 'Other'

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Support both common `pdf-parse` (CommonJS function) and newer ESM-style
    // PDFParse API. Use `createRequire` to load the installed package safely.
    const require = createRequire(import.meta.url)
     
    const pdfParseModule: unknown = require('pdf-parse')

    // Try to configure a worker if the library exposes a `setWorker` method.
    // Prefer a copy in `public/pdf.worker.mjs` if present, otherwise resolve
    // the worker bundled with the installed package and point to that via
    // a file:// URL.
    try {
      const publicWorker = path.join(process.cwd(), 'public', 'pdf.worker.mjs')
      let workerPath: string | null = null
      // prefer public copy when present
      try {
        const fs = require('fs')
        if (fs.existsSync(publicWorker)) {
          workerPath = `file://${publicWorker.replace(/\\/g, '/')}`
        }
      } catch {
        // ignore
      }

      if (!workerPath) {
        try {
          const resolved = require.resolve('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.worker.js')
          workerPath = `file://${resolved.replace(/\\/g, '/')}`
        } catch {
          // best effort; if resolve fails we'll skip worker configuration
          workerPath = null
        }
      }

      if (workerPath && pdfParseModule && pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse.setWorker === 'function') {
        try {
          pdfParseModule.PDFParse.setWorker(workerPath)
          console.info('[extractor] configured pdf worker', workerPath)
        } catch (e) {
          console.warn('[extractor] failed to set pdf worker', e)
        }
      }
    } catch {
      // ignore worker setup errors; parsing will fall back to built-in logic
    }

    let parser: { destroy?: () => Promise<void> | void; getText?: (options?: unknown) => Promise<{ text?: string }> } | undefined
    let text = ''

    if (typeof pdfParseModule === 'function') {
      // older CommonJS api: call function directly
      const parsed = await pdfParseModule(buffer)
      text = typeof parsed?.text === 'string' ? parsed.text : ''
    } else if (pdfParseModule && typeof pdfParseModule.PDFParse === 'function') {
      parser = new pdfParseModule.PDFParse({ data: buffer })
      const parseParams = { disableFontFace: true, disableAutoFetch: true } as unknown
      const parsed = await parser.getText(parseParams)
      text = typeof parsed?.text === 'string' ? parsed.text : ''
    } else {
      throw new Error('Unsupported pdf-parse export shape')
    }

    if (!text.trim()) {
      if (parser && typeof parser.destroy === 'function') {
        try { await parser.destroy() } catch {
          // ignore cleanup errors
        }
      }
      return NextResponse.json({ error: 'No text could be extracted from that PDF. Try a text-based (not scanned image) copy.' }, { status: 422 })
    }

    const fields = extractFieldsFromText(text, docType)

    if (parser && typeof parser.destroy === 'function') {
      try { await parser.destroy() } catch (destroyError) { console.warn('[extractor] pdf parser cleanup failed', destroyError) }
    }

    return NextResponse.json({ text, fields })
  } catch (error) {
    console.error('[extractor] failed to process PDF', error)
    return NextResponse.json({ error: 'Something went wrong while reading that PDF. Please try again.' }, { status: 500 })
  }
}
