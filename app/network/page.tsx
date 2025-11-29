'use client'

import { useState } from 'react'
import Link from 'next/link'

type Member = {
  name: string
  role: string
  school: string
  email: string
  phone: string
  linkedin: string
}

const MEMBERS: Member[] = [
  {
    name: 'Noah Silvestre',
    role: 'Destination College Alum',
    school: 'University of Vermont',
    email: 'ndaluz2006@gmail.com',
    phone: '908-858-7290',
    linkedin: 'https://www.linkedin.com/in/noah-silvestre-3b57b9294',
  },
]

const ACCESS_KEY = 'pay-it-forward'

export default function NetworkPage() {
  const [input, setInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (input.trim().toLowerCase() === ACCESS_KEY) {
      setUnlocked(true)
      setError(null)
    } else {
      setUnlocked(false)
      setError('Key not recognized. Check with a Destination College mentor for the current access phrase.')
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Members-only</p>
        <h1 className="mt-2 text-4xl font-bold">Destination College Network</h1>
        <p className="mt-3 text-gray-600 max-w-2xl">
          This directory is designed for current and past Destination College participants who want to stay connected, offer
          advice, or open doors for the next generation. Please keep contact information within the community.
        </p>
      </header>

      {!unlocked && (
        <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Enter access key</h2>
          <p className="mt-2 text-sm text-gray-600">
            Network details are reserved for Destination College members. Use the shared phrase you received from a mentor or
            program leader.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex-1 text-sm text-gray-700">
              Access key
              <input
                type="password"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                placeholder="Type the key phrase"
              />
            </label>
            <button
              type="submit"
              className="btn-crimson mt-1 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white"
            >
              Unlock
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
      }

      {unlocked && (
        <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Community directory</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start with the alumni and students below. As the network grows, additional profiles can be added here to support
            mentoring, referrals, and career conversations.
          </p>
          <ul className="mt-5 space-y-4">
            {MEMBERS.map((member) => (
              <li key={member.email} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800">
                <p className="text-base font-semibold text-gray-900">{member.name}</p>
                <p className="text-gray-700">
                  {member.role} • {member.school}
                </p>
                <div className="mt-2 space-y-1">
                  <p>
                    <span className="font-semibold">Email:</span>{' '}
                    <a href={`mailto:${member.email}`} className="crimson-link">
                      {member.email}
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {member.phone}
                  </p>
                  <p>
                    <span className="font-semibold">LinkedIn:</span>{' '}
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="crimson-link">
                      {member.linkedin}
                    </a>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href="/" className="underline crimson-link">
        ← Back to home
      </Link>
    </main>
  )
}


