import { NextRequest, NextResponse } from 'next/server'
import { processDocument } from '../../lib/aiExtractionPipeline'
import { isDocumentType, type DocumentType } from '../../lib/extractionRules'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    const docTypeInput = form.get('docType')
    const docType: DocumentType = typeof docTypeInput === 'string' && isDocumentType(docTypeInput) ? docTypeInput : 'Other'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Upload a PDF or image file under 20MB.' }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'The uploaded file is empty.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { text, ocrText, fields, validated } = await processDocument(buffer, { docType })

    return NextResponse.json({ text, ocrText, fields, validated })
  } catch (error) {
    console.error('[ai-extract] pipeline failed', error)
    return NextResponse.json({ error: 'Unable to read that document right now.' }, { status: 500 })
  }
}
