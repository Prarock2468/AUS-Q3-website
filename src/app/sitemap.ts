import type { MetadataRoute } from 'next'
import { getAllPages, getCaseStudies, getInsights } from '@/lib/data'
import { siteUrl } from '@/lib/seo'

export const revalidate = 3600

/** /sitemap.xml, generated from everything published in the CMS (pages marked noindex are left out). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, caseStudies, insights] = await Promise.all([getAllPages(), getCaseStudies(), getInsights()])
  const base = siteUrl()
  const indexable = <T extends { seoExtras?: { noindex?: boolean | null } | null }>(d: T) => !d.seoExtras?.noindex

  return [
    ...pages.filter(indexable).map((p) => ({
      url: `${base}${p.path === '/' ? '/' : p.path}`,
      lastModified: p.updatedAt,
      priority: p.path === '/' ? 1 : p.template === 'service' ? 0.9 : 0.7,
    })),
    ...caseStudies.filter(indexable).map((c) => ({ url: `${base}/case-studies/${c.slug}`, lastModified: c.updatedAt, priority: 0.6 })),
    ...insights.filter(indexable).map((i) => ({ url: `${base}/insights/${i.slug}`, lastModified: i.updatedAt, priority: 0.6 })),
  ]
}
