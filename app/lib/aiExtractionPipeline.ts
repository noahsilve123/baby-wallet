import type { DocumentType } from './extractionRules'

export type ExtractionResult = {
  text: string
  ocrText?: string
  fields: Record<string, unknown>
  validated?: boolean
}

// Lightweight stub so the API can respond without the heavy AI pipeline available.
export async function processDocument(buffer: Buffer, { docType }: { docType: DocumentType }): Promise<ExtractionResult> {
  return {
    text: buffer.toString('utf8'),
    ocrText: undefined,
    fields: {
      docType,
      message: 'AI extraction pipeline is not configured. Replace this stub with the real implementation when ready.',
    },
    validated: false,
  }
}
