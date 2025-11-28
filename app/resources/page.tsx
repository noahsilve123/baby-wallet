import Link from 'next/link'
import { BookOpen, Search, FileText } from 'lucide-react'
import FAFSATool from '../components/FAFSATool'

export default function ResourcesPage() {
  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-16">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Resources — Tools for Students & Families</h1>
        <p className="text-gray-600 mt-2">A curated collection of guides, checklists, scholarship search tools, and templates to help students navigate every step toward college.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <article className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3"><div className="p-2 text-white rounded" style={{ backgroundColor: 'var(--crimson)' }}><BookOpen size={18} /></div><h3 className="font-semibold">Guides & Checklists</h3></div>
          <p className="text-gray-700">Step-by-step checklists for grade-by-grade planning, college applications, and transition-to-college tasks.</p>
          <Link href="#" className="inline-block mt-4 underline crimson-link">Download checklist →</Link>
        </article>

        <article className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3"><div className="p-2 text-white rounded" style={{ backgroundColor: 'var(--crimson)' }}><Search size={18} /></div><h3 className="font-semibold">Scholarship Search</h3></div>
          <p className="text-gray-700">Tips and trusted links to locate scholarships and build a competitive application.</p>
          <Link href="#" className="inline-block mt-4 underline crimson-link">Find scholarships →</Link>
        </article>

        <article className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3"><div className="p-2 text-white rounded" style={{ backgroundColor: 'var(--crimson)' }}><FileText size={18} /></div><h3 className="font-semibold">FAFSA & Financial Aid</h3></div>
          <p className="text-gray-700">Clear instructions for completing FAFSA and maximizing aid eligibility.</p>
          <Link href="#" className="inline-block mt-4 underline crimson-link">FAFSA help →</Link>
        </article>
      </section>

      <section className="mb-16">
        <FAFSATool />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Featured Resource: Application Template</h2>
        <p className="text-gray-700">Use our sample application and essay templates to structure a strong submission. These templates have helped students organize materials and produce clear, persuasive essays.</p>
      </section>

      <Link href="/" className="underline crimson-link">← Back to home</Link>
    </main>
  )
}
