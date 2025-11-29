import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, Users, BookOpen, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Programs – Destination College',
  description:
    'Mentorship, workshops, SAT prep, and financial aid coaching that guide Summit High School students from planning through college transition.',
}

export default function ProgramsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-7xl mx-auto px-6 py-16">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Programs — Prepare. Practice. Prevail.</h1>
        <p className="text-gray-600 mt-2">Hands-on workshops, mentoring, test preparation, and financial-aid guidance designed to help students reach college and succeed once enrolled.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <article id="mentorship" className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 text-white rounded-md" style={{ backgroundColor: 'var(--crimson)' }}><GraduationCap size={22} /></div>
            <h3 className="text-lg font-semibold">Mentorship</h3>
          </div>
          <p className="text-gray-700">One-on-one mentoring pairs students with college mentors and trained advisors for academic planning, applications, and emotional support through transition.</p>
          <Link href="/programs#mentorship" className="inline-block mt-4 underline crimson-link">Read details →</Link>
        </article>

        <article id="sat-prep" className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 text-white rounded-md" style={{ backgroundColor: 'var(--crimson)' }}><Users size={22} /></div>
            <h3 className="text-lg font-semibold">Workshops & SAT Prep</h3>
          </div>
          <p className="text-gray-700">Interactive group workshops cover test strategies, college essays, application timelines, and skill-building sessions tailored to students&rsquo; needs.</p>
          <Link href="/programs#sat-prep" className="inline-block mt-4 underline crimson-link">See schedule →</Link>
        </article>

        <article id="financial-aid" className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 text-white rounded-md" style={{ backgroundColor: 'var(--crimson)' }}><BookOpen size={22} /></div>
            <h3 className="text-lg font-semibold">Financial Aid & Scholarships</h3>
          </div>
          <p className="text-gray-700">Guidance through FAFSA, scholarship search, and budgeting to make college affordable for every family we serve.</p>
          <Link href="/programs#financial-aid" className="inline-block mt-4 underline crimson-link">Learn how →</Link>
        </article>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
        <ul className="space-y-4">
          <li className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Workshop • Essay Bootcamp</div>
                <div className="font-semibold">August 14 — College Essay Workshop</div>
                <div className="text-gray-600">Practical feedback and step-by-step guidance for writing strong college essays.</div>
              </div>
              <div className="text-gray-500 text-sm flex items-center gap-2"><Calendar size={16} /> Sign up</div>
            </div>
          </li>
        </ul>
      </section>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-gray-50 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Take the next step</h2>
          <p className="text-sm text-gray-700">Students and families can start with a workshop, join a mentorship cohort, or ask about FAFSA nights.</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
          <Link href="/refer" className="btn-crimson inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white">
            Refer a student
          </Link>
          <Link href="/resources" className="btn-crimson-outline inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold">
            View resources
          </Link>
          <Link href="/donate" className="btn-crimson-outline inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold">
            Sponsor a program
          </Link>
        </div>
      </section>

      <Link href="/" className="underline crimson-link">← Back to home</Link>
    </main>
  )
}
