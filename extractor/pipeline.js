// Lightweight JS port of app/lib/aiExtractionPipeline.ts
const pdfParse = require('pdf-parse')
const Tesseract = require('tesseract.js')
const { extractFieldsFromText } = require('./extractionRules')

async function processDocument(buffer, options = {}) {
  const text = await readPdfText(buffer)
  const initialFields = extractFieldsFromText(text, options.docType)
  const validated = initialFields

  if (String(text).trim().length > 40) {
    return { text, fields: initialFields, validated, invalid: [] }
  }

  // OCR fallback for image-based PDFs
  const ocrText = await runOcr(buffer, options.language)
  const ocrFields = extractFieldsFromText(ocrText, options.docType)
  const merged = dedupe([...initialFields, ...ocrFields])
  const validatedMerged = merged
  return { text: text || ocrText, ocrText, fields: merged, validated: validatedMerged, invalid: [] }
}

async function readPdfText(buffer) {
  try {
    const parsed = await pdfParse(buffer)
    return typeof parsed.text === 'string' ? parsed.text : ''
  } catch (error) {
    console.warn('[ai-extract] pdf-parse failed, falling back to OCR only', error)
    return ''
  }
}

async function runOcr(buffer, language = 'eng') {
  try {
    const { data } = await Tesseract.recognize(buffer, language, { logger: () => undefined })
    return data?.text ?? ''
  } catch (error) {
    console.error('[ai-extract] OCR failed', error)
    return ''
  }
}

function dedupe(fields) {
  const map = new Map()
  fields.forEach((field) => {
    const key = `${field.questionId}:${field.value}`
    const existing = map.get(key)
    if (!existing || field.confidence > existing.confidence) map.set(key, field)
  })
  return Array.from(map.values())
}

module.exports = { processDocument }
