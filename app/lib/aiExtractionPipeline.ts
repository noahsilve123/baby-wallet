import { pipeline, env as hfEnv } from '@xenova/transformers'
import Tesseract from 'tesseract.js'
import pdfParse from 'pdf-parse'
import { z } from 'zod'
import { extractFieldsFromText, type DocumentType, type ExtractedField } from './extractionRules'

hfEnv.allowRemoteModels = true
hfEnv.useBrowserCache = true

const fieldSchema = z.object({
  questionId: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  confidence: z.number().min(0).max(1),
  source: z.string().min(1).default('heuristic'),
})

const layoutModelId = 'Xenova/layoutlmv3-base'
let layoutPipelinePromise: ReturnType<typeof pipeline> | null = null

export type ExtractionResult = {
  text: string
  ocrText?: string
  fields: ExtractedField[]
  validated: ExtractedField[]
  invalid: ExtractedField[]
}

type ExtractionOptions = {
  docType?: DocumentType
  language?: string
}

export async function processDocument(buffer: Buffer, options: ExtractionOptions = {}): Promise<ExtractionResult> {
  const text = await readPdfText(buffer)
  const initialFields = extractFieldsFromText(text, options.docType)

  const validated = validateFields(initialFields)

  if (text.trim().length > 40) {
    return { text, fields: initialFields, validated, invalid: [] }
  }

  // OCR fallback for image-based PDFs
  const ocrText = await runOcr(buffer, options.language)
  const ocrFields = extractFieldsFromText(ocrText, options.docType)
  const merged = dedupe([...initialFields, ...ocrFields])
  const validatedMerged = validateFields(merged)

  return { text: text || ocrText, ocrText, fields: merged, validated: validatedMerged, invalid: [] }
}

async function readPdfText(buffer: Buffer): Promise<string> {
  try {
    const parsed = await pdfParse(buffer)
    return typeof parsed.text === 'string' ? parsed.text : ''
  } catch (error) {
    console.warn('[ai-extract] pdf-parse failed, falling back to OCR only', error)
    return ''
  }
}

async function runOcr(buffer: Buffer, language = 'eng'): Promise<string> {
  try {
    const { data } = await Tesseract.recognize(buffer, language, { logger: () => undefined })
    return data?.text ?? ''
  } catch (error) {
    console.error('[ai-extract] OCR failed', error)
    return ''
  }
}

export async function extractWithLayoutLM(text: string) {
  if (!layoutPipelinePromise) {
    layoutPipelinePromise = pipeline('token-classification', layoutModelId, { quantized: true })
  }
  const classifier = (await layoutPipelinePromise) as unknown as (input: string) => Promise<unknown>
  return classifier(text)
}

function validateFields(fields: ExtractedField[]): ExtractedField[] {
  const safe: ExtractedField[] = []
  const invalid: ExtractedField[] = []
  fields.forEach((field) => {
    const parsed = fieldSchema.safeParse(field)
    if (parsed.success) {
      safe.push(parsed.data)
    } else {
      invalid.push(field)
    }
  })
  return safe
}

function dedupe(fields: ExtractedField[]) {
  const map = new Map<string, ExtractedField>()
  fields.forEach((field) => {
    const key = `${field.questionId}:${field.value}`
    const existing = map.get(key)
    if (!existing || field.confidence > existing.confidence) {
      map.set(key, field)
    }
  })
  return Array.from(map.values())
}
