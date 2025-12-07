import Link from 'next/link'

export default function SuccessPage({ searchParams }: { searchParams?: { session_id?: string } }) {
  const sessionId = searchParams?.session_id ?? ''
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">Thank you!</h1>
      <p className="mt-3 text-gray-600">We received your donation. A receipt will be emailed if you provided an email during checkout.</p>
      {sessionId && <p className="mt-2 text-sm text-gray-600">Session: <code className="rounded bg-gray-100 px-2 py-1">{sessionId}</code></p>}
      <div className="mt-6">
        <Link href="/" className="rounded-md bg-gray-900 px-4 py-2 text-white">Return home</Link>
      </div>
    </main>
  )
}
