import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  // Keep staging and preview deployments out of Google.
  const isProduction = process.env.SITE_ENV === 'production'
  return {
    rules: isProduction
      ? [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/preview', '/forms'] }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
