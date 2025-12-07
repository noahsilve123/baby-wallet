import type { Metadata } from 'next'
import ScholarshipPlannerClient from './ScholarshipPlannerClient'

export const metadata: Metadata = {
  title: 'Scholarships – Destination College Resources',
  description:
    'Generate a personalized scholarship list, save favorites, track checklist progress, and export a plan for advisors.',
}

export default function ScholarshipsPage() {
  return <ScholarshipPlannerClient />
}


