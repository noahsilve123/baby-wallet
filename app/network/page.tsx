"use client"

import { useState } from 'react'
import type { Metadata } from 'next'

type Member = {
  name: string
  role: string
  school: string
  email: string
  phone: string
  linkedin?: string
}

export const metadata: Metadata = {
  title: 'Network – Destination College',
  description: 'A private directory for current Destination College students, alumni, and mentors.',
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
  const [keyInput, setKeyInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (keyInput.trim() === ACCESS_KEY) {
      setUnlocked(true)
      setError(null)
    } else {
      setError('That key does not match. Check with a Destination College leader and try again.')
      setUnlocked(false)
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-5xl mx-auto px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Destination College Network</h1>
        <p className="mt-2 text-gray-600">
          This directory is just for current students, alumni, mentors, and supporters of Destination College. Use it to stay
          in touch and offer help to the next class.
        </p>
      </header>

      {!unlocked && (
        <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Enter access key</h2>
          <p className="mt-2 text-sm text-gray-700">
            Ask a Destination College leader for the key phrase to join this space. Please keep it within the community.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 max-w-sm">
            <label className="text-sm font-medium text-gray-800">
              Access key
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]/70"
              />
            </label>
            <button
              type="submit"
              className="btn-crimson inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white"
            >
              Unlock network
            </button>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </form>
        </section>
      }

      {unlocked && (
        <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Member directory</h2>
          <p className="mt-2 text-sm text-gray-700">
            Start by reaching out to people you know, then offer to be available for younger students who are a few steps behind
            you.
          </p>

          <ul className="mt-4 space-y-4">
            {MEMBERS.map((member) => (
              <li key={member.email} className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-800">
                <p className="text-base font-semibold text-gray-900">{member.name}</p>
                <p className="text-gray-700">
                  {member.role} • {member.school}
                </p>
                <p className="mt-1 text-gray-700">{member.email}</p>
                <p className="text-gray-700">{member.phone}</p>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm crimson-link underline"
                  >
                    View LinkedIn profile
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}


