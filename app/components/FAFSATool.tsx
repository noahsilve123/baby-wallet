'use client'

import { useCallback, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Circle, Download, Loader2, Printer, RefreshCcw, Search, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { sendToExtractor, type ExtractorField } from '../lib/extractorClient'
import { documentTypeOptions, extractFieldsFromText, type DocumentType, type ExtractedField } from '../lib/extractionRules'
import { fafsaQuestions, type FAFSAQuestion } from '../data/fafsaQuestions'

type AnalysisState = 'idle' | 'analyzing' | 'done' | 'error'
type ResponseMap = Record<string, string>

type DocExtraction = {
  id: string
  label: string
  value: string
  confidence: number
  questionId: string
  source?: string
}

type UploadedDoc = {
  id: string
  fileName: string
  sizeLabel: string
  type: DocumentType
  status: 'pending' | 'ready'
  file?: File
  analysisState: AnalysisState
  analysisError?: string
  extractedFields: DocExtraction[]
  analysisProgress: number | null
}

const statusColor: Record<'pending' | 'ready', string> = {
  pending: 'text-amber-600',
  ready: 'text-emerald-600',
}

function formatBytes(size: number) {
  if (!Number.isFinite(size)) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function FAFSATool() {
  const [docs, setDocs] = useState<UploadedDoc[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [responses, setResponses] = useState<ResponseMap>({})
  const [uploadError, setUploadError] = useState<string | null>(null)

  const safeId = useCallback((fileName: string) => `${Date.now()}-${fileName}`, [])

  const updateResponse = useCallback((id: string, value: string) => {
    setResponses((prev) => {
      if (value === '') {
        if (!(id in prev)) return prev
        const next = { ...prev }
        delete next[id]
        return next
      }
      if (prev[id] === value) return prev
      return { ...prev, [id]: value }
    })
  }, [])

  const clearResponses = useCallback(() => {
    setResponses({})
  }, [])

  const updateDocProgress = useCallback((docId: string, progress: number | null) => {
    setDocs((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, analysisProgress: progress } : doc)))
  }, [])

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return

    const incoming = Array.from(fileList)
    const checks = await Promise.all(incoming.map(validatePdfFile))
    const accepted: File[] = []
    let rejection: string | null = null

    incoming.forEach((file, index) => {
      const result = checks[index]
      if (result.ok) {
        accepted.push(file)
        return
      }
      if (!rejection) {
        rejection = `${file.name}: ${result.reason}`
      }
    })

    setUploadError(rejection)
    if (!accepted.length) return

    const newDocs: UploadedDoc[] = accepted.map((file) => ({
      id: safeId(file.name),
      fileName: file.name,
      sizeLabel: formatBytes(file.size),
      type: inferDocumentType(file),
      status: 'pending',
      file,
      analysisState: 'idle',
      analysisError: undefined,
      extractedFields: [],
      analysisProgress: null,
    }))

    setDocs((prev) => [...prev, ...newDocs])
  }, [safeId])

  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (event.dataTransfer.files?.length) {
      void handleFiles(event.dataTransfer.files)
    }
  }, [handleFiles])

  const onDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    if (!isDragging) setIsDragging(true)
  }, [isDragging])

  const onDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const removeDoc = useCallback((id: string) => {
    setDocs((prev) => prev.filter((doc) => doc.id !== id))
  }, [])

  const updateDocType = useCallback((id: string, type: DocumentType) => {
    setDocs((prev) => prev.map((doc) => (doc.id === id ? { ...doc, type } : doc)))
  }, [])

  const analyzeDocument = useCallback(async (id: string) => {
    const targetDoc = docs.find((doc) => doc.id === id)
    if (!targetDoc?.file) {
      setDocs((prev) => prev.map((doc) => (
        doc.id === id
          ? { ...doc, analysisState: 'error', analysisError: 'File data was cleared—re-upload and try again.' }
          : doc
      )))
      return
    }

    setDocs((prev) => prev.map((doc) => (
      doc.id === id
        ? { ...doc, analysisState: 'analyzing', analysisError: undefined, analysisProgress: 0 }
        : doc
    )))

    const handleProgress = (progress: number | null) => {
      updateDocProgress(id, progress)
    }

    try {
      const { fields } = await runWithTimeout(
        extractDocumentData(targetDoc.file, targetDoc.type, handleProgress),
        ANALYSIS_TIMEOUT_MS,
      )
      setDocs((prev) => prev.map((doc) => (doc.id === id ? { ...doc, analysisState: 'done', extractedFields: fields, analysisProgress: null } : doc)))
    } catch (error) {
      const message = error instanceof TimeoutError
        ? 'Scanning took too long—try trimming the file or run it again.'
        : error instanceof Error ? error.message : 'Unable to analyze file'
      setDocs((prev) => prev.map((doc) => (doc.id === id ? { ...doc, analysisState: 'error', analysisError: message, analysisProgress: null } : doc)))
    }
  }, [docs, updateDocProgress])

  const updateExtractionQuestion = useCallback((docId: string, extractionId: string, questionId: string) => {
    setDocs((prev) => prev.map((doc) => {
      if (doc.id !== docId) return doc
      return {
        ...doc,
        extractedFields: doc.extractedFields.map((field) =>
          field.id === extractionId ? { ...field, questionId } : field,
        ),
      }
    }))
  }, [])

  const applyExtractionFromDoc = useCallback((docId: string, extractionId: string) => {
    const doc = docs.find((item) => item.id === docId)
    const extraction = doc?.extractedFields.find((field) => field.id === extractionId)
    if (!extraction) return
    updateResponse(extraction.questionId, extraction.value)
  }, [docs, updateResponse])

  const pendingCount = useMemo(() => docs.filter((doc) => doc.status === 'pending').length, [docs])

  return (
    <section className="bg-white border rounded-2xl shadow-sm p-8">
      <div className="flex flex-col gap-3 mb-6">
        <span className="uppercase text-xs tracking-widest text-slate-500">Financial Aid Simplified</span>
        <h2 className="text-3xl font-semibold">FAFSA File Prep Tool</h2>
        <p className="text-slate-600 max-w-2xl">Drop your tax docs, let the translator highlight the FAFSA answers for you, then copy those temporary values straight into the official form. Everything stays on this device and disappears when you leave.</p>
      </div>

      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          {['Drop your tax PDFs or photos.', 'We auto-highlight numbers that answer FAFSA questions.', 'Copy the suggested value directly into FAFSA (nothing is saved).'].map((tip, index) => (
            <div key={tip} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {index + 1}</p>
              <p className="mt-1 font-medium text-slate-800">{tip}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <label
            htmlFor="fafsa-docs"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition ${
              isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <UploadCloud className="text-slate-600" size={28} />
            <div className="text-center">
              <p className="font-semibold">Drag & drop PDFs or take a photo</p>
              <p className="text-sm text-slate-500">IRS 1040, W-2s, income statements, Social Security cards</p>
            </div>
            <input
              id="fafsa-docs"
              type="file"
              className="hidden"
              multiple
              accept=".pdf"
              onChange={(event) => {
                void handleFiles(event.target.files)
                event.target.value = ''
              }}
            />
            <span className="text-xs text-slate-500">Files stay private until you share them with your counselor</span>
          </label>
          {uploadError && (
            <p className="text-sm text-rose-600">{uploadError}</p>
          )}

          {docs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{docs.length} document{docs.length === 1 ? '' : 's'} staged</span>
                <span className={statusColor.pending}>Action needed on {pendingCount}</span>
              </div>
              <p className="text-xs text-slate-500">Choose “Scan document” on each file whenever you want to run detection. Nothing leaves your device until you hit that button.</p>

              <ul className="space-y-3">
                {docs.map((doc) => (
                  <li key={doc.id} className="space-y-3 rounded-xl border px-4 py-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-xs text-slate-500">{doc.sizeLabel}</p>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          value={doc.type}
                          onChange={(event) => updateDocType(doc.id, event.target.value as DocumentType)}
                        >
                          {documentTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeDoc(doc.id)}
                          className="p-2 text-slate-400 hover:text-rose-500"
                          aria-label="Remove document"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>Stored locally — closed tab = data gone.</span>
                      <button
                        type="button"
                        onClick={() => analyzeDocument(doc.id)}
                        disabled={!doc.file || doc.analysisState === 'analyzing'}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
                          doc.analysisState === 'analyzing'
                            ? 'border-emerald-200 text-emerald-600'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {doc.analysisState === 'analyzing' ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {doc.analysisState === 'done' ? 'Re-run detection' : doc.analysisState === 'error' ? 'Try scan again' : doc.analysisState === 'analyzing' ? 'Scanning…' : 'Scan document'}
                      </button>
                      {doc.analysisState === 'analyzing' && (
                        <span className="text-emerald-600">{formatProgress(doc.analysisProgress)}</span>
                      )}
                      {doc.analysisState === 'idle' && doc.file && (
                        <span className="text-amber-600">Click “Scan document” when you’re ready.</span>
                      )}
                      {doc.analysisState === 'done' && doc.extractedFields.length > 0 && (
                        <span className="text-emerald-600">Suggested {doc.extractedFields.length} value{doc.extractedFields.length === 1 ? '' : 's'}</span>
                      )}
                    </div>

                    {doc.analysisState === 'error' && (
                      <p className="text-sm text-rose-600">{doc.analysisError}</p>
                    )}

                    {doc.analysisState === 'done' && doc.extractedFields.length === 0 && (
                      <p className="text-sm text-slate-500">No obvious FAFSA values detected in this file. You can still enter figures manually in the translator below.</p>
                    )}

                    {doc.extractedFields.length > 0 && (
                      <div className="space-y-2">
                        {doc.extractedFields.map((field) => {
                          const linkedQuestion = fafsaQuestions.find((question) => question.id === field.questionId)
                          const formattedValue = formatSuggestedValue(field.value, linkedQuestion?.inputType)
                          return (
                            <div key={field.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">{field.label}</p>
                                  <p className="text-sm text-slate-600">{formattedValue}</p>
                                  {linkedQuestion && <p className="text-xs text-slate-500">FAFSA prompt: {linkedQuestion.prompt}</p>}
                                </div>
                                <span className="text-xs text-slate-500">Confidence {Math.round(field.confidence * 100)}%</span>
                              </div>
                              <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
                                <label className="flex-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Send this value to
                                  <select
                                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    value={field.questionId}
                                    onChange={(event) => updateExtractionQuestion(doc.id, field.id, event.target.value)}
                                  >
                                    {fafsaQuestions.map((question) => (
                                      <option key={question.id} value={question.id}>{question.prompt}</option>
                                    ))}
                                  </select>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => applyExtractionFromDoc(doc.id, field.id)}
                                  className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 lg:w-auto"
                                >
                                  Apply to translator
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <FAFSAQuestionNavigator
            responses={responses}
            onChangeResponse={updateResponse}
            onClearResponses={clearResponses}
          />
        </div>
      </div>

      <div className="mt-8 text-sm text-slate-600 flex flex-wrap items-center gap-2 border-t pt-4">
        <AlertCircle className="text-amber-500" size={16} />
        <span>This workspace is a planning tool only. Do not email or text sensitive tax data. Upload directly through FAFSA or your school portal.</span>
      </div>
    </section>
  )
}

type FAFSAQuestionNavigatorProps = {
  responses: ResponseMap
  onChangeResponse: (id: string, value: string) => void
  onClearResponses: () => void
}

function FAFSAQuestionNavigator({ responses, onChangeResponse, onClearResponses }: FAFSAQuestionNavigatorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeQuestionId, setActiveQuestionId] = useState(fafsaQuestions[0]?.id ?? '')

  const visibleQuestions = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase()
    if (!needle) return fafsaQuestions
    return fafsaQuestions.filter((question) =>
      [question.prompt, question.translator, question.section]
        .some((field) => field.toLowerCase().includes(needle)),
    )
  }, [searchTerm])

  const sections = useMemo(() => {
    const map = new Map<FAFSAQuestion['section'], FAFSAQuestion[]>()
    visibleQuestions.forEach((question) => {
      if (!map.has(question.section)) map.set(question.section, [])
      map.get(question.section)!.push(question)
    })
    return Array.from(map.entries())
  }, [visibleQuestions])

  const resolvedActiveId = useMemo(() => {
    if (!visibleQuestions.length) return ''
    return visibleQuestions.some((question) => question.id === activeQuestionId)
      ? activeQuestionId
      : visibleQuestions[0].id
  }, [visibleQuestions, activeQuestionId])

  const activeQuestion = useMemo(() => visibleQuestions.find((question) => question.id === resolvedActiveId), [visibleQuestions, resolvedActiveId])

  const downloadScratchSheet = useCallback(() => {
    const text = buildScratchSheet(responses)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `fafsa-scratch-${new Date().toISOString().slice(0, 10)}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [responses])

  const printScratchSheet = useCallback(() => {
    const text = buildScratchSheet(responses)
    const printable = window.open('', '_blank', 'width=900,height=700')
    if (!printable) return
    printable.document.write(`<!doctype html><html><head><title>FAFSA Scratch Sheet</title></head><body style="font-family:Arial,sans-serif;white-space:pre-wrap;">${text.replace(/\n/g, '<br/>')}</body></html>`)
    printable.document.close()
    printable.focus()
    printable.print()
  }, [responses])

  return (
    <div className="rounded-2xl border border-slate-200 p-6 space-y-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-600">FAFSA Translator</p>
            <h3 className="text-2xl font-semibold">Line-by-line question helper</h3>
            <p className="text-sm text-slate-500">Entries live only while this page stays open. Close or refresh and everything resets automatically.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadScratchSheet}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
            >
              <Download size={16} /> Download scratch sheet
            </button>
            <button
              type="button"
              onClick={printScratchSheet}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
            >
              <Printer size={16} /> Print
            </button>
            <button
              type="button"
              onClick={onClearResponses}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
            >
              <RefreshCcw size={16} /> Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px,1fr]">
        <div className="rounded-2xl border border-slate-100">
          <label className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm text-slate-500">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search FAFSA wording"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="flex-1 border-none bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          <div className="max-h-80 overflow-y-auto px-3 py-4 space-y-4">
            {sections.length === 0 && (
              <p className="text-sm text-slate-500">No questions match that search. Clear the filter to see everything.</p>
            )}
            {sections.map(([sectionName, questions]) => (
              <div key={sectionName} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{sectionName}</p>
                <div className="space-y-1">
                  {questions.map((question) => {
                    const isActive = question.id === resolvedActiveId
                    const isComplete = Boolean(responses[question.id])
                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => setActiveQuestionId(question.id)}
                        className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                          isActive ? 'border-emerald-500 bg-emerald-50' : 'border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-800 line-clamp-2">{question.prompt}</p>
                          {isComplete ? <CheckCircle2 className="text-emerald-500" size={16} /> : <Circle className="text-slate-300" size={16} />}
                        </div>
                        <p className="text-xs text-slate-500">{question.section}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 p-5">
          {!visibleQuestions.length && (
            <div className="text-sm text-slate-500">Start typing above to search the official FAFSA wording.</div>
          )}
          {visibleQuestions.length > 0 && activeQuestion && (
            <QuestionDetail
              question={activeQuestion}
              value={responses[activeQuestion.id] ?? ''}
              onChange={(value) => onChangeResponse(activeQuestion.id, value)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

type QuestionDetailProps = {
  question: FAFSAQuestion
  value: string
  onChange: (value: string) => void
}

function QuestionDetail({ question, value, onChange }: QuestionDetailProps) {
  const renderInput = () => {
    if (question.inputType === 'yesno') {
      return (
        <div className="flex gap-3">
          {['Yes', 'No'].map((choice) => {
            const isActive = value === choice
            return (
              <button
                key={choice}
                type="button"
                onClick={() => onChange(choice)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {choice}
              </button>
            )
          })}
        </div>
      )
    }

    const inputMode = question.inputType === 'number' ? 'numeric' : question.inputType === 'currency' ? 'decimal' : 'text'
    const prefix = question.inputType === 'currency' ? '$' : undefined

    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        {prefix && <span className="text-slate-400">{prefix}</span>}
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border-none py-2 text-sm text-slate-700 focus:outline-none"
          placeholder={question.inputType === 'currency' ? '0.00' : 'Type response'}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">{question.section}</p>
        <h4 className="text-xl font-semibold text-slate-900">{question.prompt}</h4>
        <p className="text-sm text-slate-600">{question.translator}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Document line to check</p>
        <ul className="space-y-2">
          {question.docHints.map((hint) => (
            <li key={`${hint.doc}-${hint.location}`} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
              <p className="font-medium text-slate-800">{hint.doc}</p>
              <p className="text-slate-600">{hint.location}</p>
              {hint.note && <p className="text-xs text-slate-500">{hint.note}</p>}
            </li>
          ))}
        </ul>
      </div>

      {question.helper && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{question.helper}</p>}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Temporary FAFSA answer</p>
        {renderInput()}
        <p className="text-xs text-slate-500">Use this as a quick holding spot while you enter the same number on FAFSA. Refreshing or closing the page clears it instantly.</p>
      </div>
    </div>
  )
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function formatSuggestedValue(value: string, inputType?: FAFSAQuestion['inputType']) {
  if (!value) return '—'
  if (inputType === 'currency') {
    const numeric = Number(value)
    if (!Number.isNaN(numeric)) {
      return currencyFormatter.format(numeric)
    }
  }
  return value
}

function buildScratchSheet(responses: ResponseMap) {
  const generatedAt = new Date().toLocaleString()
  const lines = fafsaQuestions.map((question) => {
    const answer = responses[question.id] ?? ''
    return `${question.section} — ${question.prompt}\nAnswer: ${answer || '—'}\n`
  })
  return `FAFSA Scratch Sheet\nGenerated ${generatedAt}\n\n${lines.join('\n')}`
}

function inferDocumentType(file: File): DocumentType {
  const name = file.name.toLowerCase()
  if (name.includes('w2') || name.includes('w-2')) return 'W-2'
  if (name.includes('1099')) return '1099'
  if (name.includes('ssn') || name.includes('social security')) return 'SSN Letter'
  if (name.includes('1040') || name.includes('tax return')) return '1040'
  return 'Other'
}

type ValidationResult = { ok: true } | { ok: false; reason: string }

async function validatePdfFile(file: File): Promise<ValidationResult> {
  const allowedMime = ['application/pdf', 'application/x-pdf']
  const isLikelyPdf = allowedMime.includes(file.type) || file.name.toLowerCase().endsWith('.pdf')
  if (!isLikelyPdf) {
    return { ok: false, reason: 'looks like an image. Export a PDF before uploading.' }
  }

  try {
    const header = await file.slice(0, 5).text()
    if (!header.startsWith('%PDF')) {
      return { ok: false, reason: 'does not contain a valid %PDF header. Save it as a PDF file first.' }
    }
  } catch {
    return { ok: false, reason: 'could not be read. Try saving it again as a PDF.' }
  }

  return { ok: true }
}

async function extractDocumentData(file: File, docType: DocumentType, onProgress?: (value: number | null) => void) {
  const response = await sendToExtractor(file, (value) => onProgress?.(value), docType)
  const fallback = extractFieldsFromText(response.text, docType)
  const fields = mergeExtractions(response.fields, fallback)
  return { text: response.text, fields }
}

function mergeExtractions(serverFields: ExtractorField[], fallbackFields: ExtractedField[]): DocExtraction[] {
  const map = new Map<string, DocExtraction>()
  const combined: Array<{ field: ExtractorField | ExtractedField; origin: 'server' | 'client' }> = [
    ...serverFields.map((field) => ({ field, origin: 'server' as const })),
    ...fallbackFields.map((field) => ({ field, origin: 'client' as const })),
  ]

  combined.forEach(({ field, origin }, index) => {
    const key = `${field.questionId}:${field.value}`
    const candidate: DocExtraction = {
      id: buildExtractionId(field.questionId, origin, index),
      label: field.label,
      value: field.value,
      questionId: field.questionId,
      confidence: clampConfidence(field.confidence ?? 0.6),
      source: origin,
    }
    const existing = map.get(key)
    if (!existing || candidate.confidence > existing.confidence) {
      map.set(key, candidate)
    }
  })

  return Array.from(map.values())
}

function buildExtractionId(questionId: string, origin: string, index: number) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return `${questionId}-${origin}-${crypto.randomUUID()}`
    } catch {
      // Ignore and fall through to fallback id strategy.
    }
  }
  return `${questionId}-${origin}-${Date.now()}-${index}`
}

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0.6
  if (value < 0) return 0
  if (value > 1) return 1
  return Number(value.toFixed(2))
}

const ANALYSIS_TIMEOUT_MS = 20_000

class TimeoutError extends Error {
  constructor(message = 'Analysis timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}

function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError()), timeoutMs)
  })
  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise,
  ])
}

function formatProgress(progress: number | null) {
  if (progress == null) return ''
  return `${Math.round(progress * 100)}%`
}
