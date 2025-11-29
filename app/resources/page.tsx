import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Search, FileText } from 'lucide-react'
import FAFSATool from '../components/FAFSATool'
import CSSProfileChecklist from '../components/CSSProfileChecklist'

export const metadata: Metadata = {
  title: 'Resources – Destination College',
  description:
    'Checklists, scholarship guidance, and a FAFSA file-prep tool to help Summit High School students and families stay on track.',
}

export default function ResourcesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <header className="mb-5 md:mb-7">
        <h1 className="text-4xl font-bold">Resources — Tools for Students & Families</h1>
        <p className="text-gray-600 mt-2">A curated collection of guides, checklists, scholarship search tools, and templates to help students navigate every step toward college.</p>
      </header>

      {/* Top layout: tools visible immediately, with quick-link cards alongside */}
      <section className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] items-start">
        <div className="space-y-6">
          <FAFSATool />
          <CSSProfileChecklist />
        </div>

        <aside className="space-y-4">
          <article className="frame-panel-slim p-6 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 text-white rounded" style={{ backgroundColor: 'var(--crimson)' }}>
                <BookOpen size={18} />
              </div>
              <h3 className="font-semibold">Guides & Checklists</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Grade-by-grade planning, application timelines, and move-in checklists designed for first-gen families.
            </p>
            <Link href="/resources/checklists" className="inline-block mt-4 underline crimson-link">
              Go to checklists →
            </Link>
          </article>

          <article className="frame-panel-slim p-6 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 text-white rounded" style={{ backgroundColor: 'var(--crimson)' }}>
                <Search size={18} />
              </div>
              <h3 className="font-semibold">Scholarship Search</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Starting points for local Summit / New Jersey funds plus national tools to build a strong list.
            </p>
            <Link href="/resources/scholarships" className="inline-block mt-4 underline crimson-link">
              Explore scholarships →
            </Link>
          </article>

          <article className="frame-panel-slim p-6 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 text-white rounded" style={{ backgroundColor: 'var(--crimson)' }}>
                <FileText size={18} />
              </div>
              <h3 className="font-semibold">FAFSA & Financial Aid</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Official FAFSA instructions plus Destination College&rsquo;s translator tool to make each line less intimidating.
            </p>
            <Link
              href="https://studentaid.gov/h/apply-for-aid/fafsa"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 underline crimson-link"
            >
              Open FAFSA site →
            </Link>
          </article>
        </aside>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Featured Resource: Application Template</h2>
        <p className="text-gray-700">Use our sample application and essay templates to structure a strong submission. These templates have helped students organize materials and produce clear, persuasive essays.</p>
      </section>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-gray-50 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Not sure where to start?</h2>
          <p className="text-sm text-gray-700">Try the FAFSA helper above, then share your scratch sheet with a counselor during your next advising meeting.</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
          <Link href="/programs" className="btn-crimson inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white">
            Explore programs
          </Link>
          <Link href="/donate" className="btn-crimson-outline inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold">
            Fuel more resources
          </Link>
        </div>
      </section>

      <section id="privacy" className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">Privacy & data handling</h2>
        <p className="mt-3 text-sm text-gray-600">
          Uploaded FAFSA helper files stay in your browser until you click “Scan document.” At that point they are sent securely to the configured extractor service, used to surface suggested values, and then discarded. Destination College never stores or emails tax records. Close or refresh the page anytime to clear your temporary entries.
        </p>
      </section>

      <Link href="/" className="underline crimson-link">← Back to home</Link>
    </main>
  )
}
