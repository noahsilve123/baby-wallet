import Link from 'next/link'
import { GraduationCap, Users, BookOpen, Calendar } from 'lucide-react'

export default function ProgramsPage() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-16">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Programs — Prepare. Practice. Prevail.</h1>
        <p className="text-gray-600 mt-2">Hands-on workshops, mentoring, test preparation, and financial-aid guidance designed to help students reach college and succeed once enrolled.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <article className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 text-white rounded-md" style={{ backgroundColor: 'var(--crimson)' }}><GraduationCap size={22} /></div>
            <h3 className="text-lg font-semibold">Mentorship</h3>
          </div>
          <p className="text-gray-700">One-on-one mentoring pairs students with college mentors and trained advisors for academic planning, applications, and emotional support through transition.</p>
          <Link href="/programs#mentorship" className="inline-block mt-4 underline crimson-link">Read details →</Link>
        </article>

        <article className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 text-white rounded-md" style={{ backgroundColor: 'var(--crimson)' }}><Users size={22} /></div>
            <h3 className="text-lg font-semibold">Workshops & SAT Prep</h3>
          </div>
          <p className="text-gray-700">Interactive group workshops cover test strategies, college essays, application timelines, and skill-building sessions tailored to students&rsquo; needs.</p>
          <Link href="/programs#sat-prep" className="inline-block mt-4 underline crimson-link">See schedule →</Link>
        </article>

        <article className="p-6 bg-white border rounded-lg shadow-sm">
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

      <Link href="/" className="underline crimson-link">← Back to home</Link>
    </main>
  )
}
