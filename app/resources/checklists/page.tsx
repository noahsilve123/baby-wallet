import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'College Planning Checklists – Destination College',
  description:
    'Grade-by-grade college planning checklists to help Summit High School students and families stay on track from 9th grade through move-in day.',
}

const gradeSections = [
  {
    title: '9th grade — building the foundation',
    bullets: [
      'Set up a simple binder or digital folder for all Destination College and school counseling handouts.',
      'Focus on strong attendance and study habits; ask teachers for help early.',
      'Join at least one club, sport, or community activity you can grow in over time.',
      'Talk with your family about long-term goals and what “college” could look like for you.',
    ],
  },
  {
    title: '10th grade — exploring options',
    bullets: [
      'Review your transcript with a counselor and confirm courses keep you on track for graduation and college admission.',
      'Attend any college or career nights that Summit High School or Destination College hosts.',
      'Start a simple activities list with roles, dates, and impact — this becomes the base of your resume.',
      'Try one or two enrichment experiences (summer program, job, volunteering, or research).',
    ],
  },
  {
    title: '11th grade — test prep and campus fit',
    bullets: [
      'Register for SAT/ACT (if needed) and build a weekly practice plan; use Summit and Destination College prep options.',
      'Attend at least 3–5 college visits or virtual tours that fit your academic interests and budget.',
      'Ask two teachers who know you well if they can write recommendations in the fall.',
      'Create a balanced list of colleges (likely, target, reach) with your counselor.',
    ],
  },
  {
    title: '12th grade — applications and financial aid',
    bullets: [
      'Finalize your college list and note all deadlines in a calendar you share with your family.',
      'Complete drafts of your main essay and any supplemental essays; use Destination College writing support.',
      'Gather documents for FAFSA and CSS Profile (tax returns, W‑2s, bank statements, Social Security numbers).',
      'Submit FAFSA and any required state aid forms as early as possible, then compare financial aid offers with a counselor.',
    ],
  },
  {
    title: 'Summer before college — landing softly',
    bullets: [
      'Review your fall bill and make sure housing, meal plan, and fees are covered or on a payment plan.',
      'Attend any bridge, orientation, or first-gen programs your college offers.',
      'Make a short list of on-campus resources (advising, tutoring center, counseling, financial aid office).',
      'Schedule one check-in with your Destination College mentor after classes begin.',
    ],
  },
]

export default function ChecklistsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Planning at a glance</p>
        <h1 className="mt-2 text-4xl font-bold">College Planning Checklists</h1>
        <p className="mt-3 text-gray-600">
          Use these grade-by-grade lists as a starting point, then customize them with your Summit High School counselor and
          Destination College mentor. Print them, mark them up, and bring them to meetings.
        </p>
      </header>

      <section className="space-y-6 mb-10">
        {gradeSections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mb-10 rounded-3xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-700">
        <h2 className="text-lg font-semibold text-gray-900">Tip for Summit families</h2>
        <p className="mt-2">
          Keep an eye on the Summit Public Schools website for counseling events, college nights, and local scholarship
          announcements. Pair those school-based opportunities with Destination College workshops so your student hears the
          same message from multiple adults who are on their team.
        </p>
      </section>

      <Link href="/resources" className="underline crimson-link">
        ← Back to resources
      </Link>
    </main>
  )
}


