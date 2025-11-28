'use client'

import Link from 'next/link'
import { Heart, CircleDollarSign } from 'lucide-react'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const presetAmounts = [50, 100, 250, 500]

const donorHighlights = [
  { value: '$82,400', label: 'Raised this school year', detail: 'Fully funds 58 Summit seniors for essay coaching and test prep.' },
  { value: '72', label: 'Students coached weekly', detail: 'One-on-one advising plus FAFSA and scholarship filing nights.' },
  { value: '38', label: 'Alumni mentors matched', detail: 'Grads now in college return to guide current Summit seniors.' },
]

const testimonials = [
  {
    quote: 'Because of Destination College donors I could visit my top campuses and hire a math tutor. I start Rutgers Engineering this fall.',
    name: 'Lena P.',
    role: 'Summit HS Class of 2025',
  },
  {
    quote: 'Monthly gifts let us promise families we will be there from junior year through enrollment day.',
    name: 'Martha Sayre',
    role: 'Founder & Executive Director',
  },
]

function DonateContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')
  const [customAmount, setCustomAmount] = useState(150)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async (amount: number) => {
    if (!Number.isFinite(amount) || amount < 5) {
      setError('Minimum online donation is $5.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to start checkout.')
      }
      if (data?.url) {
        window.location.href = data.url as string
        return
      }
      throw new Error('Checkout URL missing.')
    } catch (err) {
      setIsSubmitting(false)
      setError(err instanceof Error ? err.message : 'Unable to start checkout.')
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startCheckout(customAmount)
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-16">
      <header className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="rounded-full p-3 text-white" style={{ backgroundColor: 'var(--crimson)' }}>
            <Heart size={20} />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Support Students — Donate</h1>
        <p className="mt-2 text-gray-600">Your gifts fund scholarships, program materials, and the staff who make individualized coaching possible.</p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold">Impact</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded bg-gray-50 p-4 text-center">
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm text-gray-600">Students served</div>
          </div>
          <div className="rounded bg-gray-50 p-4 text-center">
            <div className="text-2xl font-bold">$1M+</div>
            <div className="text-sm text-gray-600">Scholarships funded</div>
          </div>
          <div className="rounded bg-gray-50 p-4 text-center">
            <div className="text-2xl font-bold">30+</div>
            <div className="text-sm text-gray-600">Volunteer mentors</div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Give Online</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold">Quick gift</h3>
            <p className="mt-2 text-sm text-gray-600">Choose an amount and we&rsquo;ll route you to our secure Stripe Checkout.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => startCheckout(amount)}
                  disabled={isSubmitting}
                  className="btn-crimson w-full rounded-full px-4 py-2 text-sm font-semibold"
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold">Custom amount</h3>
            <p className="mt-2 text-sm text-gray-600">Set an amount (minimum $5) and continue to Stripe.</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700" htmlFor="custom-amount">
                Donation amount (USD)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-semibold text-gray-500">$</span>
                  <input
                    id="custom-amount"
                    type="number"
                    min={5}
                    step={5}
                    value={customAmount}
                    onChange={(event) => setCustomAmount(Number(event.target.value))}
                    className="w-full rounded-2xl border border-gray-300 px-10 py-2 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-crimson inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Redirecting...' : 'Give now'}
                  <CircleDollarSign size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold">Monthly support</h3>
          <p className="mt-2 text-sm text-gray-600">Set up a recurring gift by choosing &ldquo;make this a monthly donation&rdquo; inside Stripe Checkout.</p>
          <button
            onClick={() => startCheckout(50)}
            disabled={isSubmitting}
            className="btn-crimson-outline mt-3 rounded-full px-5 py-2 font-semibold"
          >
            Start with $50/month
          </button>
        </div>
        {(success || canceled) && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm" aria-live="polite">
            {success && <p className="font-semibold text-green-700">Thank you! Your gift was processed successfully.</p>}
            {canceled && <p className="text-gray-700">Checkout canceled. You can try again whenever you&rsquo;re ready.</p>}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" aria-live="assertive">
            {error}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Your gifts at work</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {donorHighlights.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm font-semibold text-gray-700">{item.label}</div>
              <p className="mt-2 text-sm text-gray-600">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {testimonials.map((entry) => (
            <figure key={entry.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <blockquote className="text-base italic text-gray-900">&ldquo;{entry.quote}&rdquo;</blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-gray-700">
                — {entry.name}
                <span className="block font-normal text-gray-600">{entry.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <p className="text-sm text-gray-600">
        To donate by check, mail to: Destination College, 123 Main St, Your Town, ST 01234. For corporate giving, please contact us for matching gift options.
      </p>

      <Link href="/" className="crimson-link mt-6 inline-block underline">
        ← Back to home
      </Link>
      </main>
      )
    }

    export default function DonatePage() {
      return (
        <Suspense fallback={<div className="min-h-screen px-6 py-16 text-center text-gray-600">Loading donate experience...</div>}>
          <DonateContent />
        </Suspense>
      )
    }
