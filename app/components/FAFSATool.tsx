"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, BadgeCheck, Loader2, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { documentTypeOptions, type DocumentType, type ExtractedField } from '../lib/extractionRules'

type AnalysisState = 'idle' | 'analyzing' | 'done' | 'error'
type FieldCategory = 'Federal Aid' | 'CSS Profile' | 'Other'

type DocExtraction = {
  id: string
  label: string
  value: string
  confidence: number
  questionId: string
  source?: string
  category: FieldCategory
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
  rawText: string | null
}

type WorkerResult = { text: string; fields: ExtractedField[] }

function formatBytes(size: number) {
  if (!Number.isFinite(size)) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function FAFSATool() {
  const [docs, setDocs] = useState<UploadedDoc[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<FieldCategory | 'All'>('All')
  const [scratchpad, setScratchpad] = useState('')
  const [aidFlags, setAidFlags] = useState({ business: false, home: false, nonCustodial: false, plan529: false })
  const workerRef = useRef<Worker | null>(null)
  const [workerError, setWorkerError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Preferred: bundler-handled module worker
      workerRef.current = new Worker(new URL('../workers/extractor.worker.ts', import.meta.url), { type: 'module' })
    } catch (e) {
      // If bundler doesn't support worker URL (dev environment like Turbopack), surface helpful error
      console.error('Worker instantiation failed', e)
      // avoid calling setState synchronously inside effect body
      setTimeout(() => setWorkerError('Unable to start background extractor worker. Try restarting the dev server.'), 0)
      workerRef.current = null
    }
    return () => workerRef.current?.terminate()
  }, [])

  const safeId = useCallback((fileName: string) => `${Date.now()}-${fileName}`, [])

  const updateDoc = useCallback((id: string, patch: Partial<UploadedDoc>) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }, [])

  async function validatePdfFile(file: File) {
    const allowedMime = ['application/pdf', 'application/x-pdf']
    const isLikelyPdf = allowedMime.includes(file.type) || file.name.toLowerCase().endsWith('.pdf')
    if (!isLikelyPdf) return { ok: false, reason: 'looks like an image. Export a PDF before uploading.' }
    try {
      const header = await file.slice(0, 5).text()
      if (!header.startsWith('%PDF')) return { ok: false, reason: 'does not contain a valid %PDF header. Save it as a PDF file first.' }
    } catch {
      return { ok: false, reason: 'could not be read. Try saving it again as a PDF.' }
    }
    return { ok: true }
  }

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return
    const incoming = Array.from(fileList)
    const checks = await Promise.all(incoming.map(validatePdfFile))
    const accepted: File[] = []
    let rejection: string | null = null
    incoming.forEach((file, i) => {
      if (checks[i].ok) accepted.push(file)
      else if (!rejection) rejection = `${file.name}: ${checks[i].reason}`
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
      rawText: null,
    }))
    setDocs((prev) => [...prev, ...newDocs])
  }, [safeId])

  const analyzeWithWorker = useCallback(async (file: File, docType: DocumentType, onProgress?: (n: number | null) => void): Promise<WorkerResult> => {
    const worker = workerRef.current
    if (!worker) throw new Error(workerError ?? 'Extractor unavailable; please restart the dev server')
    let handleMessage: (event: MessageEvent) => void
    const promise = new Promise<WorkerResult>((resolve, reject) => {
      handleMessage = (event: MessageEvent) => {
        const data = event.data as
          | { type: 'progress'; value?: number | null }
          | { type: 'complete'; result: WorkerResult }
          | { type: 'error'; error: string }
        if (data.type === 'progress') {
          onProgress?.(data.value ?? null)
        } else if (data.type === 'complete') {
          resolve(data.result)
        } else if (data.type === 'error') {
          reject(new Error(data.error))
        }
      }
      worker.addEventListener('message', handleMessage)
      worker.postMessage({ file, docType })
    })
    const cleanup = () => worker.removeEventListener('message', handleMessage)
    return promise.finally(cleanup)
  }, [workerError])

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files) }, [handleFiles])
  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); if (!isDragging) setIsDragging(true) }, [isDragging])
  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setIsDragging(false) }, [])

  const removeDoc = useCallback((id: string) => setDocs((prev) => prev.filter((d) => d.id !== id)), [])
  const updateDocType = useCallback((id: string, type: DocumentType) => updateDoc(id, { type }), [updateDoc])

  const analyzeDocument = useCallback(async (id: string) => {
    const target = docs.find((d) => d.id === id)
    if (!target?.file) return updateDoc(id, { analysisState: 'error', analysisError: 'File missing' })
    updateDoc(id, { analysisState: 'analyzing', analysisError: undefined, analysisProgress: 0 })
    try {
      const { fields, text } = await analyzeWithWorker(target.file, target.type, (p) => updateDoc(id, { analysisProgress: p }))
      const merged = mergeExtractions(fields)
      updateDoc(id, { analysisState: 'done', extractedFields: merged, analysisProgress: null, status: 'ready', rawText: text })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to analyze file'
      updateDoc(id, { analysisState: 'error', analysisError: message, analysisProgress: null })
    }
  }, [docs, updateDoc, analyzeWithWorker])

  const pendingCount = useMemo(() => docs.filter((d) => d.status === 'pending').length, [docs])

  const aggregatedFields = useMemo(
    () =>
      docs.flatMap((doc) =>
        doc.extractedFields.map((f) => ({ ...f, fileName: doc.fileName, category: categorizeQuestion(f.questionId) } as DocExtraction & { fileName: string })),
      ),
    [docs],
  )

  const filteredFields = useMemo(
    () => (filterCategory === 'All' ? aggregatedFields : aggregatedFields.filter((f) => f.category === filterCategory)),
    [aggregatedFields, filterCategory],
  )

  const diagnostics = useMemo(() => buildDiagnostics(aggregatedFields), [aggregatedFields])
  const suggestions = useMemo(() => buildAidSuggestions(aggregatedFields, diagnostics), [aggregatedFields, diagnostics])

  const copyToClipboard = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); return true }
    catch { try { window.prompt('Copy text', text) } catch {} return false }
  }, [])

  const copyAllKeyValue = useCallback(() => {
    const lines = filteredFields.map((f) => `${f.label}: ${f.value}`).join('\n')
    void copyToClipboard(lines)
  }, [filteredFields, copyToClipboard])

  const copyAllCSV = useCallback(() => {
    const rows = filteredFields
      .map((f) => `"${String(f.label).replace(/"/g, '""')}","${String(f.value).replace(/"/g, '""')}","${f.category}"`)
      .join('\n')
    void copyToClipboard(rows)
  }, [filteredFields, copyToClipboard])

  const downloadAllTxt = useCallback(() => {
    const text = filteredFields.map((f) => `${f.label} (${f.category}): ${f.value}`).join('\n')
    const b = new Blob([text], { type: 'text/plain' })
    const u = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = u
    a.download = `extracted-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(u)
  }, [filteredFields])

  const exportCategory = useCallback(
    (category: FieldCategory) => {
      const rows = aggregatedFields.filter((f) => f.category === category)
      if (!rows.length) return
      const text = rows.map((f) => `${f.label}: ${f.value}`).join('\n')
      void copyToClipboard(text)
    },
    [aggregatedFields, copyToClipboard],
  )

  return (
    <section className="bg-white border rounded-2xl shadow-sm p-8">
      <div className="flex flex-col gap-3 mb-6">
        <span className="uppercase text-xs tracking-widest text-slate-500">Financial Tools</span>
        <h2 className="text-3xl font-semibold">Financial Document Analyzer</h2>
        <p className="text-slate-600 max-w-3xl">Upload financial PDFs (taxes, income statements, W-2s) and copy parsed values grouped by category. Nothing is stored permanently.</p>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {quickLinks.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-slate-50">
              <BadgeCheck size={12} />
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>

      <label
      htmlFor="financial-docs"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
      >
        <UploadCloud className="text-slate-600" size={28} />
        <div className="text-center">
          <p className="font-semibold">Drag & drop PDF copies of your tax docs</p>
          <p className="text-sm text-slate-500">IRS 1040, W-2s, income statements, Social Security letters</p>
        </div>
          <input
          id="financial-docs"
          type="file"
          className="hidden"
          multiple
          accept=".pdf"
          onChange={(e) => {
            void handleFiles(e.target.files)
            if (e.target) (e.target as HTMLInputElement).value = ''
          }}
        />
        <span className="text-xs text-slate-500">Files are sent only to the extraction service and are not kept long-term.</span>
      </label>
      {uploadError && <p className="text-sm text-rose-600 mt-2">{uploadError}</p>}

      {docs.length > 0 && (
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{docs.length} document{docs.length === 1 ? '' : 's'} staged</span>
            <div className="flex items-center gap-3">
              <span className="text-amber-600">Action needed on {pendingCount}</span>
              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={() => docs.filter((d) => d.status === 'pending' && d.file).forEach((d) => void analyzeDocument(d.id))}
                  className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
                >
                  Scan all pending
                </button>
              )}
            </div>
          </div>
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
                      onChange={(e) => updateDocType(doc.id, e.target.value as DocumentType)}
                    >
                      {documentTypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className="p-2 text-slate-600 hover:text-rose-600"
                      aria-label="Remove document"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Stored locally — closed tab = data gone.</span>
                  <button
                    type="button"
                    onClick={() => void analyzeDocument(doc.id)}
                    disabled={!doc.file || doc.analysisState === 'analyzing'}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${doc.analysisState === 'analyzing' ? 'border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-600 hover-border-slate-300'}`}
                  >
                    {doc.analysisState === 'analyzing' ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    {doc.analysisState === 'done' ? 'Re-run detection' : doc.analysisState === 'error' ? 'Try scan again' : doc.analysisState === 'analyzing' ? 'Scanning…' : 'Scan document'}
                  </button>
                  {doc.analysisState === 'analyzing' && <span className="text-emerald-700">{formatProgress(doc.analysisProgress)}</span>}
                  {doc.analysisState === 'done' && doc.extractedFields.length === 0 && <span className="text-sm text-slate-500">No obvious values detected in this file.</span>}
                  {doc.analysisState === 'error' && doc.analysisError && <span className="text-sm text-rose-600">{doc.analysisError}</span>}
                </div>

                {doc.extractedFields.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {doc.extractedFields.map((field) => (
                      <div key={field.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{field.label}</p>
                            <p className="text-sm text-slate-700">{formatSuggestedValue(field.label, field.value)}</p>
                            <p className="text-xs text-slate-500">Confidence {Math.round(field.confidence * 100)}% — {field.source ?? 'detected'}</p>
                          </div>
                          <div>
                            <button type="button" onClick={() => void copyToClipboard(field.value)} className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-500">Copy</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {doc.rawText && (
                  <details className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" open={expandedDocId === doc.id}>
                    <summary
                      className="text-xs text-slate-600 cursor-pointer select-none"
                      onClick={(e) => {
                        e.preventDefault()
                        setExpandedDocId((prev) => (prev === doc.id ? null : doc.id))
                      }}
                    >
                      View extracted text (debug)
                    </summary>
                    {expandedDocId === doc.id && (
                      <div className="mt-2 space-y-2">
                        <pre className="max-h-48 overflow-auto rounded bg-white p-2 text-[11px] text-slate-700 whitespace-pre-wrap">{doc.rawText}</pre>
                        <button
                          type="button"
                          onClick={() => void copyToClipboard(doc.rawText ?? '')}
                          className="rounded-full border px-3 py-1 text-xs"
                        >
                          Copy raw text
                        </button>
                      </div>
                    )}
                  </details>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {aggregatedFields.length > 0 && (
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-slate-600">Filtered extracted values ({filteredFields.length}/{aggregatedFields.length})</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(['All', 'Federal Aid', 'CSS Profile', 'Other'] as Array<FieldCategory | 'All'>).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFilterCategory(cat)}
                          className={`rounded-full border px-3 py-1 ${filterCategory === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'text-slate-700 border-slate-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => copyAllKeyValue()} className="rounded-full border px-3 py-1 text-sm">Copy all</button>
                    <button type="button" onClick={() => copyAllCSV()} className="rounded-full border px-3 py-1 text-sm">Copy CSV</button>
                    <button type="button" onClick={() => downloadAllTxt()} className="rounded-full border px-3 py-1 text-sm">Download</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <button type="button" onClick={() => exportCategory('Federal Aid')} className="rounded-full border px-3 py-1">Copy Federal Aid-only</button>
                  <button type="button" onClick={() => exportCategory('CSS Profile')} className="rounded-full border px-3 py-1">Copy CSS-only</button>
                  <button type="button" onClick={() => exportCategory('Other')} className="rounded-full border px-3 py-1">Copy Other</button>
                </div>

                {(diagnostics.missing.length > 0 || diagnostics.conflicts.length > 0) && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 space-y-2">
                    <p className="font-semibold">Data quality checks</p>
                    {diagnostics.missing.map((row) => (
                      <p key={row.category}>Missing for {row.category}: {row.items.join(', ')}</p>
                    ))}
                    {diagnostics.conflicts.length > 0 && <p>Conflicting values: {diagnostics.conflicts.join('; ')}</p>}
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 space-y-2">
                    <p className="font-semibold">Planning suggestions</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {suggestions.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Additional info prompts</h3>
              <div className="space-y-2 text-sm text-slate-700">
                {[
                  { key: 'business', label: 'Family owns a business or farm (CSS Profile asks for schedules)' },
                  { key: 'home', label: 'Home equity info needed (value + mortgage balance)' },
                  { key: 'nonCustodial', label: 'Non-custodial parent info required by many CSS schools' },
                  { key: 'plan529', label: '529 plans balances (identify owner and beneficiary)' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={aidFlags[item.key as keyof typeof aidFlags]}
                      onChange={(e) => setAidFlags((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Scratchpad (local only)</h3>
              <textarea
                value={scratchpad}
                onChange={(e) => setScratchpad(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                rows={5}
                placeholder="Notes for counselor meetings, verification follow-ups, login reminders..."
              />
              <p className="text-xs text-slate-500">Stored in this tab only; clears on refresh.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4 space-y-2 text-sm text-slate-800">
              <h3 className="text-sm font-semibold">Timeline helper</h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>Federal aid forms: submit within 1 week of opening; add all colleges.</li>
                <li>CSS Profile: check each college deadline (often same as EA/ED).</li>
                <li>Verification-ready: keep 1040, W-2, untaxed income docs handy.</li>
                <li>State grant deadlines: confirm NJ deadlines if applicable.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 space-y-2 text-sm text-slate-800">
              <h3 className="text-sm font-semibold">Scholarship fit booster</h3>
              <p className="text-slate-700">Use extracted income to target need-based awards and filter local funds; add merit-only options as backups.</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-sm text-slate-600 flex flex-wrap items-center gap-2 border-t pt-4">
        <AlertCircle className="text-amber-500" size={16} />
        <span>This workspace is a planning tool only. Always double-check values before entering them on federal aid forms or a college portal, and do not email or text sensitive tax data.</span>
      </div>
    </section>
  )
}

type AggregatedField = DocExtraction & { fileName?: string }
type Diagnostics = { missing: Array<{ category: FieldCategory; items: string[] }>; conflicts: string[] }

const requiredByCategory: Record<FieldCategory, string[]> = {
  'Federal Aid': ['parent-wages', 'parent-agi', 'parent-us-tax-paid', 'household-size', 'number-in-college', 'student-ssn', 'student-dob', 'student-legal-name'],
  'CSS Profile': ['parent-wages', 'parent-agi', 'parent-us-tax-paid', 'parent-untaxed-income', 'household-size', 'number-in-college'],
  Other: [],
}

function buildDiagnostics(fields: AggregatedField[]): Diagnostics {
  const labelMap = new Map<string, string>()
  fields.forEach((f) => labelMap.set(f.questionId, f.label))

  const missing: Diagnostics['missing'] = []
  ;(['Federal Aid', 'CSS Profile'] as FieldCategory[]).forEach((cat) => {
    const required = requiredByCategory[cat]
    const present = new Set(fields.filter((f) => f.category === cat || cat === 'Federal Aid').map((f) => f.questionId))
    const gaps = required.filter((id) => !present.has(id)).map((id) => labelMap.get(id) ?? id)
    if (gaps.length) missing.push({ category: cat, items: gaps })
  })

  const byQuestion = new Map<string, Set<string>>()
  fields.forEach((f) => {
    if (!byQuestion.has(f.questionId)) byQuestion.set(f.questionId, new Set())
    byQuestion.get(f.questionId)?.add(f.value)
  })
  const conflicts: string[] = []
  byQuestion.forEach((values, qid) => {
    if (values.size > 1) conflicts.push(`${labelMap.get(qid) ?? qid}: ${Array.from(values).join(' vs ')}`)
  })

  return { missing, conflicts }
}

function asNumber(val?: string): number | undefined {
  if (!val) return undefined
  const n = Number(val.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

function buildAidSuggestions(fields: AggregatedField[], diagnostics: Diagnostics): string[] {
  const get = (id: string) => fields.find((f) => f.questionId === id)?.value
  const agi = asNumber(get('parent-agi'))
  const wages = asNumber(get('parent-wages'))
  const tax = asNumber(get('parent-us-tax-paid'))
  const untaxed = asNumber(get('parent-untaxed-income'))
  const ideas: string[] = []
  if (agi !== undefined && agi < 65000) ideas.push('Income suggests need-based aid eligibility—prioritize filing federal aid forms early and apply to need-aware scholarships.')
  if (wages !== undefined && tax === undefined) ideas.push('Total tax missing—double-check 1040 lines 22/24 or W-2 Box 2 before submission.')
  if (untaxed !== undefined) ideas.push('Untaxed income present—CSS Profile will ask for details; keep statements handy.')
  if (diagnostics.conflicts.length) ideas.push('Resolve conflicting values before filing to avoid verification delays.')
  diagnostics.missing.forEach((m) => ideas.push(`Fill missing ${m.category} fields: ${m.items.join(', ')}`))
  return Array.from(new Set(ideas))
}

function inferDocumentType(file: File): DocumentType {
  const name = file.name.toLowerCase()
  if (name.includes('w2') || name.includes('w-2')) return 'W-2'
  if (name.includes('1099')) return '1099'
  if (name.includes('ssn') || name.includes('social security')) return 'SSN Letter'
  if (name.includes('1040') || name.includes('tax return')) return '1040'
  return 'Other'
}

function mergeExtractions(fields: ExtractedField[]): DocExtraction[] {
  const map = new Map<string, DocExtraction>()
  fields.forEach((field, index) => {
    const key = `${field.questionId}:${field.value}`
    const candidate: DocExtraction = {
      id: buildExtractionId(field.questionId, 'client', index),
      label: field.label,
      value: field.value,
      questionId: field.questionId,
      confidence: clampConfidence(field.confidence ?? 0.6),
      source: 'client',
      category: categorizeQuestion(field.questionId),
    }
    const existing = map.get(key)
    if (!existing || candidate.confidence > existing.confidence) map.set(key, candidate)
  })
  return Array.from(map.values())
}

function buildExtractionId(questionId: string, origin: string, index: number) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return `${questionId}-${origin}-${crypto.randomUUID()}` } catch {}
  }
  return `${questionId}-${origin}-${Date.now()}-${index}`
}

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0.6
  if (value < 0) return 0
  if (value > 1) return 1
  return Number(value.toFixed(2))
}

function formatProgress(progress: number | null) { if (progress == null) return ''; return `${Math.round((progress ?? 0) * 100)}%` }

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const moneyKeywords = ['income', 'wage', 'tax', 'agi', 'deduction', 'benefit', 'withheld', 'distribution']

const quickLinks: Array<{ label: string; href: string }> = [
  { label: 'Financial documents overview', href: 'https://www.consumerfinance.gov/consumer-tools/financial-tools/' },
  { label: 'IRS W-2 overview', href: 'https://www.irs.gov/forms-pubs/about-form-w-2' },
  { label: 'Spreadsheet templates & tips', href: 'https://support.google.com/docs/answer/6282736' },
]

const fafsaQuestionIds = new Set([
  'parent-wages',
  'parent-agi',
  'parent-us-tax-paid',
  'household-size',
  'number-in-college',
  'student-ssn',
  'student-dob',
  'student-legal-name',
])

const cssQuestionIds = new Set([
  'parent-wages',
  'parent-agi',
  'parent-us-tax-paid',
  'parent-untaxed-income',
  'household-size',
  'number-in-college',
])

function categorizeQuestion(questionId: string): FieldCategory {
  if (fafsaQuestionIds.has(questionId)) return 'Federal Aid'
  if (cssQuestionIds.has(questionId)) return 'CSS Profile'
  return 'Other'
}

function looksLikeMoney(label: string, value: string) {
  return moneyKeywords.some((k) => label.toLowerCase().includes(k)) || /[$,]/.test(value)
}

function formatSuggestedValue(label: string, value: string) {
  if (!value) return '—'
  if (looksLikeMoney(label, value)) {
    const numeric = Number(value.replace(/[^0-9.-]+/g, ''))
    if (!Number.isNaN(numeric)) return currencyFormatter.format(numeric)
  }
  return value
}
