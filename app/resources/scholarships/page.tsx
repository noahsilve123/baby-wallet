import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Scholarships – Destination College Resources',
  description:
    'Starting points for Summit, New Jersey and statewide scholarships, plus trusted national tools to search for additional aid.',
}

export default function ScholarshipsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-5xl mx-auto px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Scholarship Search Guide</h1>
        <p className="mt-2 text-gray-600">
          Use these links as a starting point to look for scholarships connected to Summit, New Jersey, statewide programs, and
          national opportunities.
        </p>
      </header>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Local & school-connected opportunities</h2>
        <p className="mt-3 text-sm text-gray-700">
          Many scholarships are promoted directly through Summit High School. Check the counseling or guidance pages regularly
          for updates, local organization awards, and community foundation funds.
        </p>
        <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>
            Search online for{' '}
            <span className="font-semibold">“Summit High School NJ scholarships”</span> to reach the latest district-hosted
            information.
          </li>
          <li>Ask your counselor about any Summit- or Union County-based awards for first-generation students.</li>
        </ul>
      </section>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">New Jersey state aid</h2>
        <p className="mt-3 text-sm text-gray-700">
          New Jersey offers state-based grants and scholarships, often administered after you submit the FAFSA and any required
          follow-up forms.
        </p>
        <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>
            Visit the New Jersey Higher Education Student Assistance Authority (HESAA) site to review available programs and
            deadlines.
          </li>
          <li>
            After FAFSA, log back in if you receive any alerts from HESAA asking you to confirm information for state aid.
          </li>
        </ul>
        <p className="mt-4 text-sm">
          For details, search for{' '}
          <span className="font-semibold">“HESAA NJ grants and scholarships”</span> in your browser and use the official New
          Jersey government site.
        </p>
      </section>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">National scholarship tools</h2>
        <p className="mt-3 text-sm text-gray-700">
          These tools list thousands of scholarships. Use filters for first-generation status, interests, and New Jersey
          residency where available.
        </p>
        <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>College Board / BigFuture scholarship search</li>
          <li>Fastweb scholarship search</li>
          <li>Other reputable databases recommended by your counselor or college access programs</li>
        </ul>
        <p className="mt-4 text-sm text-gray-700">
          Always avoid scholarships that charge an application fee or feel predatory. Legitimate scholarships should not require
          you to pay to apply.
        </p>
      </section>

      <p className="mb-8 text-sm text-gray-600">
        Destination College can help you interpret any scholarship offer and make a plan that keeps costs realistic for your
        family.
      </p>

      <Link href="/resources" className="underline crimson-link">
        ← Back to resources
      </Link>
    </main>
  )
}


