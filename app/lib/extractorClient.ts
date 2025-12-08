const configuredExtractorUrl = process.env.NEXT_PUBLIC_EXTRACTOR_URL
const defaultExtractorUrl = '/api/ai-extract'
const defaultFallbackUrl = '/api/extractor'

function isAbsoluteUrl(u: string) {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(u)
}

// Decide primary and fallback targets:
// - If the env provides an absolute URL, use it as the single primary target.
// - If the env provides a relative path that looks like `/api/extractor`, prefer the AI pipeline (`/api/ai-extract`) first and
//   fall back to the configured relative URL (or `/api/extractor`).
// - If no env is provided, default to the built-in AI pipeline.
let primaryExtractorUrl: string | null = null
let fallbackExtractorUrl: string | null = null

if (configuredExtractorUrl && configuredExtractorUrl.trim().length) {
  const cfg = configuredExtractorUrl.trim()
  if (isAbsoluteUrl(cfg)) {
    primaryExtractorUrl = cfg
    fallbackExtractorUrl = null
  } else {
    // relative path on same origin
    // if the configured value explicitly points at the legacy extractor, try AI pipeline first
    if (/\/(ai-)?extract(or)?\/?$/i.test(cfg) && cfg.toLowerCase().includes('extractor')) {
      primaryExtractorUrl = defaultExtractorUrl
      fallbackExtractorUrl = cfg
    } else {
      primaryExtractorUrl = cfg
      fallbackExtractorUrl = null
    }
  }
} else {
  primaryExtractorUrl = defaultExtractorUrl
  fallbackExtractorUrl = null
  console.info('Using built-in /api/ai-extract endpoint. Set NEXT_PUBLIC_EXTRACTOR_URL to call a remote service.')
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
  if (!primaryExtractorUrl) {
    return Promise.reject(new Error('Extractor service URL is missing. Set NEXT_PUBLIC_EXTRACTOR_URL to continue.'))
  }

  function buildTargetUrl(base: string) {
    const trimmedUrl = base.trim().replace(/\s+/g, '').replace(/\/$/, '')
    const isBuiltIn = /\/api\/(ai-)?extract(or)?\/?$/i.test(trimmedUrl)
    const alreadyHasExtract = /\/extract\/?$/i.test(trimmedUrl)
    return isBuiltIn || alreadyHasExtract ? trimmedUrl : `${trimmedUrl}/extract`
  }

  function doUpload(targetUrl: string): Promise<ExtractorResponse> {
    return new Promise((resolve, reject) => {
      console.log('[extractor] uploading', file.name, file.size, '->', targetUrl)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', targetUrl)
      xhr.responseType = 'json'
      xhr.timeout = 55_000

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

  const primaryTarget = buildTargetUrl(primaryExtractorUrl)
  const fallbackTarget = fallbackExtractorUrl ? buildTargetUrl(fallbackExtractorUrl) : defaultFallbackUrl

  return doUpload(primaryTarget).catch((err) => {
    // If there is no fallback configured, rethrow the original error
    if (!fallbackExtractorUrl) {
      // if the primary was an absolute remote URL but we also want to try local fallback
      if (defaultFallbackUrl && primaryTarget !== defaultFallbackUrl) {
        console.warn('[extractor] primary failed, trying default fallback:', err.message)
        return doUpload(defaultFallbackUrl)
      }
      throw err
    }
    console.warn('[extractor] primary failed, attempting fallback extractor:', err.message)
    return doUpload(fallbackTarget)
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
