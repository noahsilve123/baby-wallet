import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Scholarship Guide – Destination College',
  description:
    'Starting points for Summit, New Jersey and New Jersey state scholarships, plus national search tools for Summit High School students.',
}

export default function ScholarshipsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Funding the journey</p>
        <h1 className="mt-2 text-4xl font-bold">Scholarship Guide for Summit Students</h1>
        <p className="mt-3 text-gray-600">
          This page gathers trusted places to start your search. Always confirm details and deadlines directly on each official
          site, and work with your Summit High School counselor and Destination College mentor to prioritize your list.
        </p>
      </header>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">Local & school-based starting points</h2>
        <p className="mt-3 text-sm text-gray-700">
          For scholarships created specifically for Summit students or residents, your best information will always come from
          your school counselors and local organizations.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-gray-700">
          <li>
            <span className="font-semibold">Summit Public Schools website:</span>{' '}
            <a
              href="https://www.summit.k12.nj.us"
              target="_blank"
              rel="noreferrer"
              className="crimson-link underline"
            >
              District & Summit High School
            </a>{' '}
            — look under Summit High School&apos;s counseling or guidance section for scholarship bulletins, local awards, and
            deadlines.
          </li>
          <li>
            <span className="font-semibold">Local civic groups & faith communities:</span> Rotary, houses of worship, community
            foundations, and service clubs in Summit often sponsor small but meaningful awards. Ask a counselor or mentor which
            organizations recent alumni have used.
          </li>
          <li>
            <span className="font-semibold">Employer and union benefits:</span> Many parents&apos; employers, unions, and
            professional associations provide scholarships or tuition assistance that can stack with other aid.
          </li>
        </ul>
      </section>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-2xl font-semibold text-gray-900">New Jersey state aid & programs</h2>
        <p className="mt-3 text-sm text-gray-700">
          New Jersey offers need-based grants and merit programs that can significantly reduce costs at in-state colleges when
          combined with federal aid and institutional scholarships.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-gray-700">
          <li>
            <a
              href="https://www.hesaa.org"
              target="_blank"
              rel="noreferrer"
              className="crimson-link underline font-semibold"
            >
              Higher Education Student Assistance Authority (HESAA)
            </a>{' '}
            — the official hub for New Jersey grants, scholarships, and programs such as Tuition Aid Grant (TAG), NJ STARS, and
            EOF. Start here after completing FAFSA or NJ state aid applications.
          </li>
          <li>
            Review each in-state college&apos;s financial aid page for school-specific New Jersey scholarships and automatic
            merit awards based on GPA and test scores.
          </li>
        </ul>
      </section>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">National scholarship search tools</h2>
        <p className="mt-3 text-sm text-gray-700">
          Use one or two national tools consistently instead of trying to use every site once. Set aside weekly time for
          searching and applying.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-gray-700">
          <li>
            <a
              href="https://bigfuture.collegeboard.org/scholarship-search"
              target="_blank"
              rel="noreferrer"
              className="crimson-link underline font-semibold"
            >
              BigFuture Scholarship Search (College Board)
            </a>{' '}
            — filter by location, interests, and background to find scholarships that match your profile.
          </li>
          <li>
            <a
              href="https://studentaid.gov/understand-aid/types/scholarships"
              target="_blank"
              rel="noreferrer"
              className="crimson-link underline font-semibold"
            >
              Federal Student Aid: Understanding Scholarships
            </a>{' '}
            — explains how private scholarships interact with FAFSA-based aid and how to report awards.
          </li>
          <li>
            Consider creating a shared spreadsheet with your mentor that tracks scholarship names, amounts, deadlines, and
            status so nothing slips through the cracks.
          </li>
        </ul>
      </section>

      <section className="mb-10 rounded-3xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-700">
        <h2 className="text-lg font-semibold text-gray-900">How Destination College can help</h2>
        <p className="mt-2">
          Bring any scholarship you are considering to your counselor or mentor so they can help you spot red flags (like fees
          or requests for sensitive information) and prioritize the best fits. Together you can build a realistic plan that
          combines local awards, New Jersey aid, institutional grants, and reasonable work-study or loans.
        </p>
      </section>

      <Link href="/resources" className="underline crimson-link">
        ← Back to resources
      </Link>
    </main>
  )
}


