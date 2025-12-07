import { getSiteUrl } from './lib/seo'

export default function sitemap() {
  const siteUrl = getSiteUrl()
  const routes = ['/', '/resources', '/resources/scholarships', '/programs', '/donate', '/refer']
  return routes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date() }))
}
