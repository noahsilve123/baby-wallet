import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronRight, GraduationCap, Heart, Users } from 'lucide-react'

export default function Page() {
	const quickLinks = [
		{
			title: 'Get matched with a mentor',
			description: 'Personal coaching from application strategy to move-in day.',
			href: '/programs#mentorship',
			label: 'Get support',
			icon: <GraduationCap className="h-5 w-5" />,
		},
		{
			title: 'Explore workshops & SAT prep',
			description: 'Essay bootcamps, SAT practice cohorts, and parent nights.',
			href: '/programs#sat-prep',
			label: 'See calendar',
			icon: <Users className="h-5 w-5" />,
		},
		{
			title: 'Invest in a student',
			description: 'Every $250 funds testing fees, travel, or emergency grants.',
			href: '/donate',
			label: 'Donate today',
			icon: <Heart className="h-5 w-5" />,
		},
	]

	const pathways = [
		{ title: '1. Plan', description: 'Personal roadmap beginning in 9th grade with family meetings and timeline planning.' },
		{ title: '2. Practice', description: 'SAT cohorts, essay studios, interview prep, and financial aid nights led by counselors.' },
		{ title: '3. Prevail', description: 'Scholarship packaging, transition-to-campus coaching, and alumni mentoring.' },
	]

	return (
		<main className="bg-white text-gray-900">
			<section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50 text-gray-900">
				<div className="absolute inset-0 opacity-40 pattern-grid" aria-hidden />
				<div className="relative max-w-7xl mx-auto px-6 py-20 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
					<div>
						<h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900">Your future has a team behind it.</h1>
						<p className="mt-4 text-lg text-gray-700">Destination College surrounds students with mentors, workshops, and financial guidance so the path to higher education feels clear—and possible.</p>

						<div className="mt-6 text-sm text-gray-600">
							<p className="font-semibold">Who we serve</p>
							<ul className="mt-1 flex flex-wrap gap-3">
								<li className="rounded-full bg-white/80 px-3 py-1">Summit High School students</li>
								<li className="rounded-full bg-white/80 px-3 py-1">Families planning for college costs</li>
								<li className="rounded-full bg-white/80 px-3 py-1">Donors & volunteers who want to invest in first-gen success</li>
							</ul>
						</div>

						<div className="mt-8 flex flex-wrap gap-3">
							<Link href="/programs" className="btn-crimson inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition hover:-translate-y-0.5">Explore programs <ArrowRight className="h-4 w-4" /></Link>
							<Link href="/donate" className="btn-crimson-outline inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition">Invest in a student</Link>
						</div>

						<div className="mt-10 grid grid-cols-2 gap-4 text-sm">
							<div className="glass-card text-gray-800" style={{ borderColor: 'rgba(201, 161, 45, 0.3)' }}>
								<p className="text-3xl font-bold">500+</p>
								<p className="text-gray-600">students on track</p>
							</div>
							<div className="glass-card text-gray-800" style={{ borderColor: 'rgba(201, 161, 45, 0.3)' }}>
								<p className="text-3xl font-bold">$1M+</p>
								<p className="text-gray-600">scholarships unlocked</p>
							</div>
						</div>
					</div>

					<aside className="glass-panel rounded-3xl p-8 text-gray-900">
						<div className="flex items-center gap-3 text-sm font-semibold text-gray-700"><BookOpen className="h-5 w-5" /> Weekly focus plan</div>
						<p className="mt-4 text-xl font-semibold">“I never imagined having a mentor who understood each deadline. Now my FAFSA is filed and I’m visiting campuses.”</p>
						<p className="mt-4 text-sm text-gray-600">— Kayla, first-generation senior</p>
						<div className="mt-6 h-px bg-gray-200" />
						<ul className="mt-6 space-y-4 text-sm text-gray-700">
							<li className="flex items-center gap-3"><span className="stat-dot" /> Bi-weekly advising check-ins</li>
							<li className="flex items-center gap-3"><span className="stat-dot" /> Essay studio & interview prep</li>
							<li className="flex items-center gap-3"><span className="stat-dot" /> Family financial aid nights</li>
						</ul>
					</aside>
				</div>
			</section>

			<section className="relative -mt-10 z-10">
				<div className="max-w-6xl mx-auto px-6">
					<div className="grid gap-4 md:grid-cols-3">
						{quickLinks.map((card) => (
							<div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
								<div className="inline-flex items-center gap-2 crimson-pill px-3 py-1 text-sm font-medium">{card.icon}{card.label}</div>
								<h3 className="mt-4 text-lg font-semibold text-gray-900">{card.title}</h3>
								<p className="mt-2 text-sm text-gray-600">{card.description}</p>
								<Link href={card.href} className="mt-4 inline-flex items-center text-sm font-semibold crimson-link">Take me there <ChevronRight className="ml-1 h-4 w-4" /></Link>
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="programs" className="mt-20 bg-slate-50 py-16">
				<div className="max-w-7xl mx-auto px-6 text-center">
					<p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--crimson)' }}>Programs tailored to every milestone</p>
					<h2 className="mt-3 text-3xl font-bold">Coaching, curriculum, and community.</h2>
					<p className="mt-3 text-gray-600">From classroom tutoring to financial aid, everything lives under one roof.</p>

					<div className="mt-10 grid gap-6 md:grid-cols-3">
						<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
							<div className="flex items-center gap-3" style={{ color: 'var(--crimson)' }}>
								<div className="rounded-full p-3" style={{ backgroundColor: 'var(--crimson-soft)' }}><GraduationCap className="h-5 w-5" /></div>
								<span className="font-semibold">Mentorship</span>
							</div>
							<p className="mt-4 text-gray-700">One-on-one advising, campus visits, and alumni mentors through college transition.</p>
							<Link href="/programs#mentorship" className="mt-4 inline-flex items-center text-sm font-semibold crimson-link">Learn more <ChevronRight className="ml-1 h-4 w-4" /></Link>
						</div>

						<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
							<div className="flex items-center gap-3" style={{ color: 'var(--crimson)' }}>
								<div className="rounded-full p-3" style={{ backgroundColor: 'var(--crimson-soft)' }}><Users className="h-5 w-5" /></div>
								<span className="font-semibold">SAT & Academic Labs</span>
							</div>
							<p className="mt-4 text-gray-700">Intensive prep cohorts, essay studios, and science/tech tutoring powered by volunteer teachers.</p>
							<Link href="/programs#sat-prep" className="mt-4 inline-flex items-center text-sm font-semibold crimson-link">View schedule <ChevronRight className="ml-1 h-4 w-4" /></Link>
						</div>

						<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
							<div className="flex items-center gap-3" style={{ color: 'var(--crimson)' }}>
								<div className="rounded-full p-3" style={{ backgroundColor: 'var(--crimson-soft)' }}><BookOpen className="h-5 w-5" /></div>
								<span className="font-semibold">Financial Aid Studio</span>
							</div>
							<p className="mt-4 text-gray-700">FAFSA guidance, scholarship matchmaking, and emergency micro-grants for college persistence.</p>
							<Link href="/programs#financial-aid" className="mt-4 inline-flex items-center text-sm font-semibold crimson-link">See resources <ChevronRight className="ml-1 h-4 w-4" /></Link>
						</div>
					</div>
				</div>
			</section>

			<section className="py-16">
				<div className="max-w-6xl mx-auto px-6">
					<div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
						<div>
							<h2 className="text-3xl font-bold">What the journey looks like</h2>
							<p className="mt-3 text-gray-600">We stay with students for nearly a decade—from the first campus tour through college graduation.</p>
							<div className="mt-8 grid gap-6 md:grid-cols-3">
								{pathways.map((item) => (
									<div key={item.title} className="rounded-2xl border border-gray-200 p-5 shadow-sm">
										<p className="text-sm font-semibold" style={{ color: 'var(--crimson)' }}>{item.title}</p>
										<p className="mt-2 text-sm text-gray-700">{item.description}</p>
									</div>
								))}
							</div>
						</div>

						<div className="rounded-3xl bg-gray-900 p-8 text-white shadow-xl">
							<p className="text-sm uppercase tracking-[0.2em] text-white/60">Impact in motion</p>
							<p className="mt-4 text-2xl font-semibold">Nested support for students + families</p>
							<ul className="mt-6 space-y-4 text-sm text-white/80">
								<li>✔ 92% of seniors submit FAFSA & CSS profiles on time</li>
								<li>✔ 78% of alumni persist through year two of college</li>
								<li>✔ 30+ volunteer mentors activated each semester</li>
							</ul>
							<Link href="/resources" className="mt-8 inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900">Download resource kit</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-slate-900 text-white">
				<div className="max-w-6xl mx-auto px-6 py-16 text-center">
					<h2 className="text-3xl font-bold">Ready to walk alongside a student?</h2>
					<p className="mt-3 text-white/80">Refer a student, volunteer your expertise, or contribute financially—every role builds the bridge.</p>
					<div className="mt-8 flex flex-wrap justify-center gap-4">
						<Link href="/donate" className="btn-crimson inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white">Fuel scholarships <ArrowRight className="h-4 w-4" /></Link>
						<Link href="/programs" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white">Refer a student</Link>
					</div>
				</div>
			</section>

			<footer className="bg-gray-50 border-t">
				<div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-600">© {new Date().getFullYear()} Destination College — All rights reserved.</div>
			</footer>
		</main>
	)
}

