import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Refer a Student – Destination College',
  description:
    'Share a Summit High School student, family, or partner who could benefit from Destination College mentorship and financial-aid guidance.',
}

export default function ReferPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-5xl mx-auto px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Refer a Student or Family</h1>
        <p className="mt-2 text-gray-600">
          Use this page to share a Summit High School student, family, or community partner who could benefit from Destination
          College. We&rsquo;ll follow up with care and keep information private.
        </p>
      </header>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">Referral details</h2>
        <p className="mt-2 text-sm text-gray-700">
          You can either copy these prompts into an email or use them as a checklist when you talk with a counselor.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-gray-800">
          <div className="space-y-2">
            <p className="font-semibold text-gray-900">About the student</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Student name and grade at Summit High School</li>
              <li>Best contact (student or parent/guardian email + phone)</li>
              <li>Any deadlines coming up soon (tests, applications, decisions)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-gray-900">How we can help</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>What kind of support would be most helpful right now?</li>
              <li>Any financial or family circumstances we should keep in mind?</li>
              <li>Preferred way to reach out (call, text, email, school meeting)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-semibold text-gray-900">Send a quick referral email</h2>
        <p className="mt-2 text-sm text-gray-700">
          Click below to open a pre-addressed email. You can paste in the details from above and we&rsquo;ll take it from there.
        </p>
        <a
          href="mailto:hello@destinationcollege.org?subject=Destination%20College%20Referral&body=Student%20name%20%26%20grade%3A%0AParent%2Fguardian%20contact%3A%0AHow%20Destination%20College%20can%20help%3A%0ADeadlines%20coming%20up%3A%0AAny%20other%20notes%3A"
          className="mt-4 inline-flex items-center rounded-full bg-[var(--crimson)] px-5 py-2 text-sm font-semibold text-white btn-crimson"
        >
          Email a referral
        </a>
      </section>

      <p className="mb-8 text-sm text-gray-600">
        If you prefer, you can also share this page with students or families directly so they can reach out on their own.
      </p>

      <Link href="/" className="underline crimson-link">
        ← Back to home
      </Link>
    </main>
  )
}


