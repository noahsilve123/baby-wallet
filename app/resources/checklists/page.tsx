import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Checklists – Destination College Resources',
  description:
    'Grade-by-grade college planning checklists for Summit High School students and families, from 9th grade through the summer before college.',
}

export default function ChecklistsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-5xl mx-auto px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Grade-by-Grade Checklists</h1>
        <p className="mt-2 text-gray-600">
          Use these checklists to keep Summit High School students and families on track from 9th grade through the summer
          before college.
        </p>
      </header>

      <section className="space-y-8 mb-12">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">9th Grade – Laying the foundation</h2>
          <ul className="mt-3 list-disc pl-5 text-gray-700 text-sm space-y-1">
            <li>Meet your school counselor and share your goals after high school.</li>
            <li>Build strong study habits and keep grades steady across all classes.</li>
            <li>Join at least one club, sport, or activity that you genuinely enjoy.</li>
            <li>Create a simple folder (paper or digital) to save report cards and awards.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">10th Grade – Exploring options</h2>
          <ul className="mt-3 list-disc pl-5 text-gray-700 text-sm space-y-1">
            <li>Review your transcript with a counselor to make sure you are on a college-prep track.</li>
            <li>Try a practice PSAT or other diagnostic test to see where you stand.</li>
            <li>Attend at least one college or career night offered through Summit High School.</li>
            <li>Update your activities list with leadership or extra responsibility where possible.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">11th Grade – Building a college list</h2>
          <ul className="mt-3 list-disc pl-5 text-gray-700 text-sm space-y-1">
            <li>Take the PSAT/SAT/ACT (as appropriate) and plan a re-take if needed.</li>
            <li>Research colleges that fit your academic interests, size, and financial needs.</li>
            <li>Attend college fairs, info sessions, and virtual tours; take notes after each visit.</li>
            <li>Ask two teachers who know you well if they would be willing to write recommendations.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">12th Grade – Applications & decisions</h2>
          <ul className="mt-3 list-disc pl-5 text-gray-700 text-sm space-y-1">
            <li>Finalize your college list with a balance of reach, match, and likely schools.</li>
            <li>Complete your main personal statement and any required supplemental essays.</li>
            <li>Submit FAFSA and (if required) CSS Profile as early as possible after they open.</li>
            <li>Compare financial-aid offers carefully and talk through options with a trusted adult.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Summer before college – Transition</h2>
          <ul className="mt-3 list-disc pl-5 text-gray-700 text-sm space-y-1">
            <li>Review your housing, orientation, and tuition deadlines at your chosen college.</li>
            <li>Make a simple budget for books, transportation, and personal expenses.</li>
            <li>Set up direct deposit for any campus job or refund checks, if available.</li>
            <li>Make a plan to stay in touch with mentors and supporters from Summit.</li>
          </ul>
        </article>
      </section>

      <p className="mb-8 text-sm text-gray-600">
        Summit families can always cross-check these steps with information from the Summit High School counseling office.
      </p>

      <Link href="/resources" className="underline crimson-link">
        ← Back to resources
      </Link>
    </main>
  )
}


