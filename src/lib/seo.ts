import type { Metadata } from 'next'
import type { CaseStudy, Insight, Page, SiteSetting } from '@/payload-types'
import type { Resolved } from './data'
import { richTextToText } from './richtext'
import { media } from './render/parts'

/** Public address of the site, for example https://www.q3tech.com/en-au (no trailing slash). */
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

const absolute = (url?: string | null) => (!url ? undefined : /^https?:/.test(url) ? url : `${siteUrl()}${url}`)

type SeoDoc = { meta?: { title?: string | null; description?: string | null; image?: unknown } | null; seoExtras?: any }

const docOf = (r: Resolved) => (r.kind === 'page' || r.kind === 'caseStudy' || r.kind === 'insight' ? r.doc : null)

export function buildMetadata(r: Resolved, settings: SiteSetting): Metadata {
  const doc = docOf(r) as (SeoDoc & Record<string, any>) | null
  if (!doc) return { title: 'Page not found | Q3 Technologies', robots: { index: false } }

  const fallbackTitle =
    r.kind === 'caseStudy' ? `${doc.cardTitle} | Q3 Technologies` : r.kind === 'insight' ? `${doc.title} | Q3 Technologies` : doc.title
  const title = doc.meta?.title || fallbackTitle
  const description = doc.meta?.description || doc.summary || doc.searchDescription || undefined
  const canonical = doc.seoExtras?.canonical || `${siteUrl()}${r.path === '/' ? '/' : r.path}`
  const image = absolute(media(doc.meta?.image)?.url) || absolute(settings.defaultOgImage) || undefined
  const globalUrl = doc.seoExtras?.globalUrl

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: { 'en-AU': canonical, ...(globalUrl ? { en: globalUrl, 'x-default': globalUrl } : {}) },
    },
    robots: doc.seoExtras?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Q3 Technologies',
      locale: 'en_AU',
      type: r.kind === 'insight' ? 'article' : 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
    icons: { icon: [{ url: '/assets/icons/favicon.svg', type: 'image/svg+xml' }] },
    other: { 'theme-color': '#000000' },
  }
}

/* ---------------------------------------------------------------------------------------------------------------
 * JSON-LD: organisation, breadcrumbs, articles and FAQs, generated from content so they never drift out of date.
 * ------------------------------------------------------------------------------------------------------------- */

const faqLd = (items: { question: string; answer: unknown }[]) =>
  items.length
    ? {
        '@type': 'FAQPage',
        mainEntity: items.map((i) => ({
          '@type': 'Question',
          name: i.question,
          acceptedAnswer: { '@type': 'Answer', text: richTextToText(i.answer) },
        })),
      }
    : null

function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: `${siteUrl()}${t.path}` })),
  }
}

export function buildJsonLd(r: Resolved, settings: SiteSetting, pageTitles: Map<string, string>): object[] {
  const org = {
    '@type': 'Organization',
    '@id': `${siteUrl()}/#organization`,
    name: settings.orgName || 'Q3 Technologies',
    url: `${siteUrl()}/`,
    logo: `${siteUrl()}/assets/images/q3-logo.webp`,
    telephone: settings.telephone || undefined,
    email: settings.email || undefined,
    sameAs: (settings.sameAs || []).map((s) => s.url),
  }
  const graph: any[] = [org]
  const doc = docOf(r) as any
  if (!doc) return [{ '@context': 'https://schema.org', '@graph': graph }]

  // Breadcrumbs from the URL, named after the matching pages.
  const segments = r.path.split('/').filter(Boolean)
  if (segments.length) {
    const trail = [{ name: 'Home', path: '/' }]
    segments.forEach((_, i) => {
      const p = `/${segments.slice(0, i + 1).join('/')}`
      const isLast = i === segments.length - 1
      const name = isLast ? doc.cardTitle || doc.title : pageTitles.get(p)
      if (name) trail.push({ name, path: p })
    })
    graph.push(breadcrumbLd(trail))
  }

  if (r.kind === 'insight') {
    const post = doc as Insight
    const a = typeof post.author === 'object' ? post.author : null
    graph.push({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.summary || undefined,
      datePublished: post.publishedDate,
      dateModified: post.updatedAt,
      image: absolute(media(post.coverImage)?.url),
      author: a ? { '@type': 'Person', name: a.name, jobTitle: a.role || undefined, sameAs: a.linkedin || undefined } : undefined,
      publisher: { '@id': org['@id'] },
      mainEntityOfPage: `${siteUrl()}${r.path}`,
      inLanguage: 'en-AU',
    })
    const faq = faqLd((post.faqs || []) as any)
    if (faq) graph.push(faq)
  }

  if (r.kind === 'caseStudy') {
    const cs = doc as CaseStudy
    graph.push({
      '@type': 'Article',
      headline: cs.title,
      description: cs.summary || undefined,
      image: absolute(media(cs.heroImage)?.url),
      about: [cs.industry, cs.services].filter(Boolean),
      publisher: { '@id': org['@id'] },
      mainEntityOfPage: `${siteUrl()}${r.path}`,
      inLanguage: 'en-AU',
    })
  }

  if (r.kind === 'page') {
    const page = doc as Page
    if (page.template === 'service') {
      graph.push({
        '@type': 'Service',
        name: page.title,
        description: page.meta?.description || undefined,
        provider: { '@id': org['@id'] },
        areaServed: { '@type': 'Country', name: 'Australia' },
        url: `${siteUrl()}${r.path}`,
      })
    }
    // FAQs placed on the page directly, and FAQs inside a "Common component (saved)" section (populated at depth 2).
    const faqs = (page.layout || []).flatMap((b) => {
      if (b.blockType === 'faq') return b.items || []
      if (b.blockType === 'commonComponentRef' && b.component && typeof b.component === 'object')
        // The page's own questions, when set, replace the saved ones (as on the page itself).
        return (b.component.layout || []).flatMap((s) =>
          s.blockType === 'faq' ? (b.faqs?.length ? b.faqs : s.items || []) : [],
        )
      return []
    })
    const faq = faqLd(faqs as any)
    if (faq) graph.push(faq)
  }

  const out: object[] = [{ '@context': 'https://schema.org', '@graph': graph }]
  if (doc.seoExtras?.structuredData) out.push(doc.seoExtras.structuredData)
  return out
}
