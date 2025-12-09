import { extractFieldsFromText, type DocumentType } from '../lib/extractionRules'
import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

// Use CDN for worker to avoid Next.js webpack complexity
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

self.onmessage = async (e: MessageEvent) => {
  const { file, docType } = e.data as { file: File; docType: DocumentType }

  try {
    const buffer = await file.arrayBuffer()
    let text = ''

    // Strategy 1: Fast Text Extraction (for native PDFs)
    try {
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      const maxPages = Math.min(pdf.numPages, 5) // Limit to 5 pages for speed
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map((item) => (item as { str: string }).str).join(' ')
        text += pageText + '\n'
      }
    } catch (pdfError) {
      console.warn('PDF text read failed, falling back to OCR', pdfError)
    }

    // Strategy 2: OCR Fallback (for scanned images)
    if (text.trim().length < 50) {
      self.postMessage({ type: 'progress', value: 0.1, status: 'Scanning image (OCR)...' })
      
      const { data } = await Tesseract.recognize(buffer, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            self.postMessage({ type: 'progress', value: 0.2 + (m.progress * 0.8) })
          }
        }
      })
      text = data.text
    }

    // Strategy 3: Heuristic Analysis
    // We reuse our existing regex rules which are perfect for structured tax forms
    const fields = extractFieldsFromText(text, docType)

    self.postMessage({ type: 'complete', result: { text, fields } })

  } catch (error) {
    self.postMessage({ type: 'error', error: (error as Error).message })
  }
}