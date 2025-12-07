import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://destination-college.example.com'

export function buildMetadata(params: { title: string; description: string; path?: string }) : Metadata {
  const url = params.path ? `${siteUrl}${params.path}` : siteUrl
  return {
    title: params.title,
    description: params.description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: 'Destination College',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export function getSiteUrl() {
  return siteUrl
}
