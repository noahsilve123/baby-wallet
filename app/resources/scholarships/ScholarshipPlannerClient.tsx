'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, BookmarkPlus, CalendarDays, CheckCircle2, ClipboardList, Download, Loader2, MapPin, RefreshCcw, Sparkles, Tag, ThumbsDown, ThumbsUp, WifiOff } from 'lucide-react'
import { z } from 'zod'
import type { ScholarshipMatch } from '../../lib/scholarshipEngine'
import { buildICalendar } from '../../lib/calendarExport'

const STORAGE_KEY = 'dc-scholarship-planner-v1'
const interestPresets = ['stem', 'arts', 'design', 'music', 'community', 'leadership', 'engineering', 'technology', 'social impact']

type IncomeBracket = 'below-60k' | '60k-90k' | '90k-140k' | 'above-140k'

type Profile = {
  location: string
  gpa: number
  interests: string
  incomeBracket: IncomeBracket
  firstGen: boolean
}

type PlannerItem = ScholarshipMatch & { savedAt: number }

const profileSchema = z.object({
  location: z.string().trim().min(2).max(30),
  gpa: z.number().min(0).max(4.5),
  interests: z.string().trim().min(1),
  incomeBracket: z.enum(['below-60k', '60k-90k', '90k-140k', 'above-140k']),
  firstGen: z.boolean(),
})

const reminderSchema = z.object({
  email: z.string().email(),
  daysBefore: z.number().int().min(1).max(30),
})

export default function ScholarshipPlannerClient() {
  const [profile, setProfile] = useState<Profile>({
    location: 'NJ',
    gpa: 3.2,
    interests: 'stem, leadership',
    incomeBracket: '60k-90k',
    firstGen: true,
  })
  const [matches, setMatches] = useState<ScholarshipMatch[]>([])
  const [saved, setSaved] = useState<PlannerItem[]>([])
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, number>>({})
  const [lowBandwidth, setLowBandwidth] = useState(false)
  const [reminderEmail, setReminderEmail] = useState('')
  const [reminderDays, setReminderDays] = useState(7)
  const [reminderOptIn, setReminderOptIn] = useState(false)
  const [reminderStatus, setReminderStatus] = useState<string | null>(null)
  const [essayPrompt, setEssayPrompt] = useState('')
  const [essayOutline, setEssayOutline] = useState<string[]>([])
  const [essayLoading, setEssayLoading] = useState(false)
  const [essayError, setEssayError] = useState<string | null>(null)
  const [mentorName, setMentorName] = useState('')
  const [mentorEmail, setMentorEmail] = useState('')
  const [mentorFocus, setMentorFocus] = useState('')
  const [mentorStatus, setMentorStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const derivedInterests = useMemo(() => profile.interests.split(',').map((value) => value.trim()).filter(Boolean), [profile.interests])
  const duplicateIds = useMemo(() => {
    const seen = new Set<string>()
    const dup = new Set<string>()
    matches.forEach((item) => {
      if (seen.has(item.id)) dup.add(item.id)
      seen.add(item.id)
    })
    return dup
  }, [matches])

  useEffect(() => {
    const raw = safeStorageGet(STORAGE_KEY)
    if (raw) {
      try {
        setSaved(JSON.parse(raw) as PlannerItem[])
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedFeedback = safeStorageGet(`${STORAGE_KEY}-feedback`)
    const storedBandwidth = safeStorageGet(`${STORAGE_KEY}-lowbandwidth`)
    if (storedFeedback) {
      try {
        setFeedback(JSON.parse(storedFeedback) as Record<string, number>)
      } catch {
        // ignore
      }
    }
    if (storedBandwidth) setLowBandwidth(storedBandwidth === '1')

    const mentorRaw = safeStorageGet(`${STORAGE_KEY}-mentor`)
    if (mentorRaw) {
      try {
        const parsed = JSON.parse(mentorRaw) as { mentorName?: string; mentorEmail?: string; mentorFocus?: string }
        setMentorName(parsed.mentorName ?? '')
        setMentorEmail(parsed.mentorEmail ?? '')
        setMentorFocus(parsed.mentorFocus ?? '')
      } catch {
        // ignore
      }
    }
  }, [])

  // Check for share link on first load and restore saved planner if present
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const share = params.get('share')
    if (!share) return
    try {
      // decode base64-safe payload
      const json = decodeURIComponent(Array.prototype.map.call(atob(share), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
      const parsed = JSON.parse(json) as PlannerItem[]
      if (Array.isArray(parsed) && parsed.length) setSaved(parsed)
    } catch {
      // ignore invalid share payloads
      console.warn('Invalid share payload')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    safeStorageSet(STORAGE_KEY, JSON.stringify(saved))
  }, [saved])

  useEffect(() => {
    if (typeof window === 'undefined') return
    safeStorageSet(`${STORAGE_KEY}-feedback`, JSON.stringify(feedback))
    safeStorageSet(`${STORAGE_KEY}-lowbandwidth`, lowBandwidth ? '1' : '0')
  }, [feedback, lowBandwidth])

  useEffect(() => {
    void runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const validation = profileSchema.safeParse(profile)
      if (!validation.success) {
        setError('Please complete all profile fields before building your list.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: profile.location,
          gpa: profile.gpa,
          interests: derivedInterests,
          incomeBracket: profile.incomeBracket,
          firstGen: profile.firstGen,
          feedback,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json().catch(() => ({ results: [] }))
      setMatches(Array.isArray(data.results) ? (data.results as ScholarshipMatch[]) : [])
    } catch (err) {
      console.error('scholarship fetch failed', err)
      setError('Unable to fetch scholarship matches. Try again soon.')
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = (item: ScholarshipMatch) => {
    setSaved((prev) => {
      const exists = prev.some((entry) => entry.id === item.id)
      if (exists) return prev.filter((entry) => entry.id !== item.id)
      return [...prev, { ...item, savedAt: Date.now() }]
    })
  }

  const updateFeedback = (id: string, delta: number) => {
    setFeedback((prev) => {
      const next = { ...prev, [id]: Math.max(-12, Math.min(12, (prev[id] ?? 0) + delta)) }
      return next
    })
  }

  const scheduleReminder = async () => {
    if (!saved.length || !reminderEmail || !reminderOptIn) return
    setReminderStatus('Scheduling...')
    try {
      const nextDeadline = saved.slice().sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))[0]
      const reminderPayload = { email: reminderEmail, scholarshipName: nextDeadline.name, deadline: nextDeadline.deadline, daysBefore: reminderDays }
      const parsedReminder = reminderSchema.safeParse({ email: reminderEmail, daysBefore: reminderDays })
      if (!parsedReminder.success) {
        setReminderStatus('Enter a valid email and days (1-30).')
        return
      }
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderPayload),
      })
      if (res.ok) {
        setReminderStatus('Reminder scheduled. You will be notified before the next deadline.')
      } else {
        setReminderStatus('Reminders are unavailable right now. Please try again later.')
      }
    } catch (err) {
      console.error('reminder schedule error', err)
      setReminderStatus('Could not schedule reminder.')
    }
  }

  const runEssay = async () => {
    setEssayError(null)
    setEssayOutline([])
    setEssayLoading(true)
    try {
      const res = await fetch('/api/essay-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: essayPrompt }),
      })
      const data = await res.json().catch(() => ({})) as { outline?: string[]; error?: string }
      if (!res.ok) throw new Error(data.error || 'Unable to generate')
      setEssayOutline(Array.isArray(data.outline) ? data.outline : [])
    } catch {
      setEssayError('Unable to draft an outline right now. Please try again or simplify your prompt.')
    } finally {
      setEssayLoading(false)
    }
  }

  const saveMentor = () => {
    if (!mentorName || !mentorEmail) {
      setMentorStatus('Name and email required.')
      return
    }
    safeStorageSet(`${STORAGE_KEY}-mentor`, JSON.stringify({ mentorName, mentorEmail, mentorFocus }))
    setMentorStatus('Saved. We will reach out with next steps.')
  }

  const toggleChecklist = (id: string, checklistId: string) => {
    setSaved((prev) => prev.map((item) => {
      if (item.id !== id) return item
      return {
        ...item,
        checklist: item.checklist.map((check) =>
          check.id === checklistId ? { ...check, done: !check.done } : check,
        ),
      }
    }))
  }

  const exportData = (format: 'json' | 'csv') => {
    if (!saved.length) return
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'scholarship-planner.json'
      link.click()
      URL.revokeObjectURL(url)
      return
    }

    const headers = ['Name', 'Sponsor', 'Amount', 'Deadline', 'URL', 'Checklist Status']
    const rows = saved.map((item) => [
      item.name,
      item.sponsor,
      item.amount.toString(),
      item.deadline,
      item.url,
      `${item.checklist.filter((c) => c.done).length}/${item.checklist.length}`,
    ])
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'scholarship-planner.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportCalendar = () => {
    if (!saved.length) return
    const calendar = buildICalendar(saved.map((item) => ({
      id: item.id,
      name: item.name,
      sponsor: item.sponsor,
      deadline: item.deadline,
      url: item.url,
      locationScope: item.locationScope,
      states: item.states,
    })))
    const blob = new Blob([calendar], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'scholarship-deadlines.ics'
    link.click()
    URL.revokeObjectURL(url)
  }

  const generateShareUrl = async () => {
    if (!saved.length || typeof window === 'undefined') return
    try {
      const payload = JSON.stringify(saved)
      const encoded = btoa(unescape(encodeURIComponent(payload)))
      const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
    } catch (err) {
      console.warn('Unable to copy share link', err)
    }
  }

  const completionRate = useMemo(() => {
    const totals = saved.flatMap((item) => item.checklist)
    if (!totals.length) return 0
    const done = totals.filter((item) => item.done).length
    return Math.round((done / totals.length) * 100)
  }, [saved])

  return (
    <main id="main-content" tabIndex={-1} className={`max-w-6xl mx-auto px-6 py-12 space-y-10 ${lowBandwidth ? 'low-bandwidth' : ''}`}>
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Scholarship builder</p>
        <h1 className="text-4xl font-bold text-gray-900">Personalized scholarships & checklists</h1>
        <p className="text-gray-600 max-w-3xl">Generate a tailored list using your interests, GPA, and state. Save matches, track requirements, and export your plan to share with advisors.</p>
      </header>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-semibold text-gray-900">Tell us about you</h2>
          <button
            type="button"
            onClick={runSearch}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Build my list
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3 text-sm text-gray-700">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={lowBandwidth}
              onChange={(e) => setLowBandwidth(e.target.checked)}
            />
            <span className="inline-flex items-center gap-1"><WifiOff size={14} /> Low-bandwidth mode (fewer animations)</span>
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">State or region</span>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value.toUpperCase() })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder="NJ"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">GPA (4.0 scale)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="4.5"
              value={profile.gpa}
              onChange={(e) => setProfile({ ...profile, gpa: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Household income</span>
            <select
              value={profile.incomeBracket}
              onChange={(e) => setProfile({ ...profile, incomeBracket: e.target.value as IncomeBracket })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            >
              <option value="below-60k">Below $60k</option>
              <option value="60k-90k">$60k-$90k</option>
              <option value="90k-140k">$90k-$140k</option>
              <option value="above-140k">Above $140k</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Interests / intended major</span>
            <input
              type="text"
              value={profile.interests}
              onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder="stem, arts, community"
            />
            <div className="flex flex-wrap gap-2 text-xs">
              {interestPresets.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1"
                  onClick={() => setProfile((prev) => ({ ...prev, interests: addInterest(prev.interests, interest) }))}
                >
                  {interest}
                </button>
              ))}
            </div>
          </label>

          <label className="flex items-center gap-2 mt-6 text-sm">
            <input
              type="checkbox"
              checked={profile.firstGen}
              onChange={(e) => setProfile({ ...profile, firstGen: e.target.checked })}
            />
            <span>First-generation college student</span>
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recommended scholarships</h2>
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => exportData('json')}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1"
            >
              <Download size={14} /> Export JSON
            </button>
            <button
              type="button"
              onClick={() => exportData('csv')}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              type="button"
              onClick={exportCalendar}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!saved.length}
            >
              <CalendarDays size={14} /> Add to calendar
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => {
            const isSaved = saved.some((item) => item.id === match.id)
            return (
              <article key={match.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{match.sponsor}</p>
                    <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
                    <p className="text-sm text-gray-600">Up to ${match.amount.toLocaleString()} • Deadline {formatDate(match.deadline)}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"><MapPin size={12} />{formatScope(match.locationScope, match.states)}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"><Tag size={12} />{match.interests.join(', ')}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Score {Math.round(match.score)}</span>
                      {duplicateIds.has(match.id) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-800">Duplicate entry</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSave(match)}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${isSaved ? 'border-emerald-200 text-emerald-700' : 'border-gray-200 text-gray-700'}`}
                    >
                      <BookmarkPlus size={14} /> {isSaved ? 'Saved' : 'Save'}
                    </button>
                    <Link href={match.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-900 underline">
                      View details
                    </Link>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-700">{match.description}</p>
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  {match.reasons.map((reason) => (
                    <div key={reason} className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
                      <CheckCircle2 size={12} className="text-emerald-700" />
                      <span>{reason}</span>
                    </div>
                  ))}
                  {match.eligibilityNote && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                      <Tag size={12} />
                      <span>{match.eligibilityNote}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2 text-xs text-gray-700">
                  <button
                    type="button"
                    onClick={() => updateFeedback(match.id, 8)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1"
                    aria-label="Up-rank this scholarship"
                  >
                    <ThumbsUp size={14} /> Up-rank
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFeedback(match.id, -8)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1"
                    aria-label="Down-rank this scholarship"
                  >
                    <ThumbsDown size={14} /> Down-rank
                  </button>
                </div>
              </article>
            )
          })}
        </div>
        {matches.length === 0 && !loading && <p className="text-sm text-gray-600">No results yet. Adjust your profile and run again.</p>}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Saved planner</h2>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ClipboardList size={16} /> Overall completion: {completionRate}%
            <button
              type="button"
              onClick={() => setSaved([])}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1"
            >
              <RefreshCcw size={14} /> Clear all
            </button>
            <button
              type="button"
              onClick={generateShareUrl}
              disabled={!saved.length}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={14} /> Copy share link
            </button>
          </div>
        </div>

        {saved.length === 0 && (
          <p className="mt-3 text-sm text-gray-600">Save scholarships above to build your checklist. Your progress stays in this browser.</p>
        )}

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Bell size={14} /> Deadline reminders (email)
          </div>
          <p className="mt-1 text-xs text-gray-600">Opt in to receive a reminder before a saved scholarship deadline. Uses a Redis-backed queue if configured.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</span>
              <input
                aria-label="Reminder email"
                type="email"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                placeholder="you@example.com"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Days before deadline</span>
              <input
                aria-label="Days before deadline"
                type="number"
                min={1}
                max={30}
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <div className="flex items-center gap-2 pt-6">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={reminderOptIn}
                  onChange={(e) => setReminderOptIn(e.target.checked)}
                />
                <span>Enable reminders</span>
              </label>
              <button
                type="button"
                onClick={scheduleReminder}
                disabled={!reminderOptIn || !saved.length}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule
              </button>
            </div>
          </div>
          {reminderStatus && <p className="mt-2 text-xs text-emerald-700">{reminderStatus}</p>}
        </div>

        {shareUrl && (
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-500">Shareable link</label>
            <div className="mt-1 flex gap-2">
              <input readOnly value={shareUrl} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1"
              >
                Copy
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Anyone with this link can view your saved planner in their browser. Links are encoded client-side only.</p>
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {saved.map((item) => (
            <article key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{item.sponsor}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">Deadline {formatDate(item.deadline)} • Checklist {item.checklist.filter((c) => c.done).length}/{item.checklist.length}</p>
                </div>
                <Link href={item.url} target="_blank" rel="noreferrer" className="text-xs font-semibold underline">Details</Link>
              </div>
              <div className="mt-3 space-y-2">
                {item.checklist.map((check) => (
                  <label key={check.id} className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={check.done}
                      onChange={() => toggleChecklist(item.id, check.id)}
                      className="h-4 w-4"
                    />
                    <span className={check.done ? 'line-through text-gray-500' : ''}>{check.label}</span>
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Essay coach</p>
            <h2 className="text-xl font-semibold text-gray-900">Draft an outline</h2>
          </div>
          <button
            type="button"
            onClick={runEssay}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            disabled={essayLoading}
          >
            {essayLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Generate outline
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="space-y-1 text-sm text-gray-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prompt or essay topic</span>
            <textarea
              aria-label="Essay prompt"
              value={essayPrompt}
              onChange={(e) => setEssayPrompt(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              rows={3}
              placeholder="Describe the challenge, impact, or goal you want to write about"
            />
          </label>
          {essayError && <p className="text-sm text-rose-600">{essayError}</p>}
          {essayOutline.length > 0 && (
            <ol className="space-y-2 text-sm text-gray-800 list-decimal list-inside">
              {essayOutline.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Mentorship</p>
            <h2 className="text-xl font-semibold text-gray-900">Request a mentor intro</h2>
          </div>
          <button
            type="button"
            onClick={saveMentor}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900"
          >
            Save interest
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your name</span>
            <input
              aria-label="Your name"
              type="text"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</span>
            <input
              aria-label="Mentor email"
              type="email"
              value={mentorEmail}
              onChange={(e) => setMentorEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Focus or availability</span>
            <input
              aria-label="Mentor focus"
              type="text"
              value={mentorFocus}
              onChange={(e) => setMentorFocus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
              placeholder="STEM, essay review, weekend calls"
            />
          </label>
        </div>
        {mentorStatus && <p className="mt-2 text-xs text-emerald-700">{mentorStatus}</p>}
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-semibold">Privacy and storage</p>
        <p className="mt-1">Your scholarship profile and checklist stay in this browser via local storage. Clear it anytime with the “Clear all” button. No scholarship applications are submitted from this page.</p>
      </section>

      <Link href="/resources" className="underline crimson-link">← Back to resources</Link>
    </main>
  )
}

function addInterest(current: string, interest: string) {
  const values = new Set(current.split(',').map((item) => item.trim()).filter(Boolean))
  values.add(interest)
  return Array.from(values).join(', ')
}

function safeStorageGet(key: string) {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    console.warn('storage get failed', error)
    return null
  }
}

function safeStorageSet(key: string, value: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.warn('storage set failed', error)
  }
}

function formatDate(date: string) {
  const parsed = Date.parse(date)
  if (Number.isNaN(parsed)) return date
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed)
}

function formatScope(scope: string, states: string[]) {
  if (scope === 'national') return 'National'
  if (scope === 'state') return `${states[0] ?? 'State'}`
  return states.length ? `Local • ${states.join('/')}` : 'Local'
}

function csvEscape(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}
