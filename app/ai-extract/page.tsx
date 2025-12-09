import AIExtractClient from '../components/AIExtractClient'

export const metadata = {
  title: 'AI Extract — Destination College',
  description: 'Client-side OCR and lightweight parsing for uploaded documents.',
}

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold">Client-side document extraction</h1>
      <p className="mt-2 text-sm text-gray-600">Upload an image or PDF and extraction runs entirely in the browser (no server required).</p>
      <div className="mt-6">
        <AIExtractClient />
      </div>
    </main>
  )
}
