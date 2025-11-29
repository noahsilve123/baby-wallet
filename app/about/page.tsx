import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About – Destination College',
  description:
    'Learn how Destination College walks alongside first-generation Summit High School students from early high school through college graduation.',
}

export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen max-w-5xl mx-auto px-6 py-16">
      <header className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Our Story</p>
        <h1 className="mt-2 text-4xl font-bold">About Destination College</h1>
        <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
          We help first-generation, college-bound students from Summit High School in New Jersey prepare for, apply to, and thrive at college through mentorship, practical workshops, and financial guidance tailored to each family.
        </p>
      </header>

      <section id="involved" className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700">
          We remove academic, social, and financial barriers by staying with students from early high school through college graduation. Families, schools, and volunteer mentors partner with us to design clear, achievable roadmaps that keep every milestone in sight.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm text-gray-700">
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">500+ students</p>
            <p className="mt-1">supported with advising, testing, and financial-aid planning.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">30+ mentors</p>
            <p className="mt-1">active each semester, many of them Destination College alumni.</p>
          </div>
        </div>
      </section>

      <section className="mb-12 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="lg:flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Founder Spotlight</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Martha Sayre</h2>
            <p className="mt-3 text-gray-700">
              Martha Sayre co-founded Destination College to ensure well-deserving students experience the encouragement, financial resources, and practical guidance that changed her own community. A senior leader adept at both strategy and operations, she thrives on being on the front lines of mission-driven work and building relationships at every level.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 text-gray-700">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <ul className="list-disc pl-4 space-y-2 text-sm">
                  <li>Collaborative communicator who guides complex, multi-stakeholder projects.</li>
                  <li>Emotionally intelligent manager with a track record of developing effective teams.</li>
                  <li>Seasoned strategist with deep experience bridging nonprofit boards and staff.</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-gray-200">
                <p className="text-sm text-gray-700">Her LinkedIn bio captures her drive:</p>
                <p className="mt-2 text-gray-900">&ldquo;Senior leader adept at both strategy and operations seeks a role in the not-for-profit sector working on the front-lines to make a difference. Proven effectiveness building relationships at all levels and working collaboratively across an organization. Skilled communicator with demonstrated success in managing complex projects involving multiple stakeholders. Dynamic, emotionally intelligent organizational manager with commitment to fostering effective teams and a proven history of successful staff development.&rdquo;</p>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-gray-200 md:col-span-2">
                <p className="text-sm text-gray-700">Contact Martha directly:</p>
                <a href="mailto:marthabsayre@gmail.com" className="mt-2 inline-flex items-center text-lg font-semibold crimson-link">marthabsayre@gmail.com</a>
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl lg:ml-10">
            <Image
              src="/martha-sayre.jpg"
              alt="Portrait of Martha Sayre"
              width={285}
              height={375}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mb-12 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-900">Why Martha stays involved</h3>
        <blockquote className="mt-4 border-l-4 border-[var(--crimson)] bg-[var(--crimson-soft)]/70 p-6 text-gray-800">
          <p className="italic">&ldquo;It&rsquo;s been a joy to support these well-deserving students, but even more so, it&rsquo;s amazing to see them grow during their college years as they come back to check in. It&rsquo;s inspiring to see how determined these students are to go to college and how the scholarships can really change the direction of their lives. One student received a full-ride scholarship in real time, just as we were on the phone preparing to accept admission to his second-choice school. Moments like that stay with you.&rdquo;</p>
          <footer className="mt-3 text-sm font-semibold text-gray-700">&mdash; Martha Sayre, Scholarship Committee Chair</footer>
        </blockquote>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Get Involved</h2>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Volunteer as a mentor, workshop leader, or application reader.</li>
          <li>Donate to expand scholarships, emergency grants, and college bridge programming.</li>
          <li>Refer a student, teacher, or school partner who could benefit from our programs.</li>
        </ul>
      </section>

      <section className="mb-10 rounded-3xl border border-gray-200 bg-gray-50 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ready to connect with Destination College?</h2>
          <p className="text-sm text-gray-700">Refer a student, explore partnership ideas, or reach out about volunteering and giving.</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
          <Link href="/programs" className="btn-crimson inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white">
            Explore programs
          </Link>
          <Link href="/donate" className="btn-crimson-outline inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold">
            Invest in a student
          </Link>
        </div>
      </section>

      <Link href="/" className="underline crimson-link">← Back to home</Link>
    </main>
  )
}
