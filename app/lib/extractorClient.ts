const configuredExtractorUrl = process.env.NEXT_PUBLIC_EXTRACTOR_URL
const extractorUrl = configuredExtractorUrl && configuredExtractorUrl.trim().length
  ? configuredExtractorUrl
  : '/api/extractor'

if (!configuredExtractorUrl) {
  console.info('Using built-in /api/extractor endpoint. Set NEXT_PUBLIC_EXTRACTOR_URL to override.')
}

export type ProgressCallback = (value: number | null) => void

export type ExtractorField = {
  questionId: string
  label: string
  value: string
  confidence: number
  source?: string
}

export type ExtractorResponse = {
  text: string
  fields: ExtractorField[]
}

export function sendToExtractor(file: File, onProgress?: ProgressCallback, docType?: string): Promise<ExtractorResponse> {
  if (!extractorUrl) {
    return Promise.reject(new Error('Extractor service URL is missing. Set NEXT_PUBLIC_EXTRACTOR_URL to continue.'))
  }

  return new Promise((resolve, reject) => {
    console.log('[extractor] uploading', file.name, file.size)
    const xhr = new XMLHttpRequest()
    const trimmedUrl = extractorUrl.trim().replace(/\s+/g, '')
    const needsSuffix = !/\/extract\/?$/i.test(trimmedUrl) && !/\/api\/extractor\/?$/i.test(trimmedUrl)
    const targetUrl = needsSuffix ? `${trimmedUrl.replace(/\/$/, '')}/extract` : trimmedUrl
    xhr.open('POST', targetUrl)
    xhr.responseType = 'json'
    xhr.timeout = 30_000

    xhr.onloadstart = () => {
      onProgress?.(0)
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress?.(null)
        return
      }
      onProgress?.(Math.min(0.99, event.loaded / event.total))
    }

    xhr.onerror = () => {
      reject(new Error('Network error talking to extractor'))
    }

    xhr.ontimeout = () => {
      reject(new Error('Extractor request timed out'))
    }

    xhr.onload = () => {
      onProgress?.(1)
      if (xhr.status < 200 || xhr.status >= 300) {
        const message = readErrorPayload(xhr)
        reject(new Error(message ?? `Extractor request failed (${xhr.status})`))
        return
      }
      const data = xhr.response as Partial<ExtractorResponse> | null
      const text = typeof data?.text === 'string' ? data.text : null
      const fields = Array.isArray(data?.fields) ? sanitizeFields(data?.fields) : []
      if (!text) {
        reject(new Error('Extractor response missing text payload'))
        return
      }
      resolve({ text, fields })
    }

    const formData = new FormData()
    formData.append('file', file)
    if (docType) {
      formData.append('docType', docType)
    }
    try {
      xhr.send(formData)
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Unable to send file to extractor'))
    }
  })
}

function readErrorPayload(xhr: XMLHttpRequest): string | null {
  const response = xhr.response
  if (response && typeof response === 'object' && typeof response.error === 'string') {
    const trimmed = response.error.trim()
    return trimmed.length ? trimmed : null
  }
  if (typeof xhr.responseText === 'string' && xhr.responseText.trim().length) {
    return xhr.responseText.trim()
  }
  return null
}

function sanitizeFields(fields: unknown[]): ExtractorField[] {
  return fields.flatMap((field) => {
    if (!field || typeof field !== 'object') return []
    const { questionId, label, value, confidence, source } = field as Partial<ExtractorField>
    if (typeof questionId !== 'string' || typeof label !== 'string' || typeof value !== 'string') {
      return []
    }
    const parsedConfidence = typeof confidence === 'number' && Number.isFinite(confidence) ? confidence : 0.6
    return [{
      questionId,
      label,
      value,
      confidence: Math.max(0, Math.min(1, Number(parsedConfidence.toFixed(2)))),
      source,
    }]
  })
}
