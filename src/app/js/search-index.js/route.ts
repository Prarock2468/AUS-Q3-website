import { getAllPages, getCaseStudies, getInsights, getSettings } from '@/lib/data'
import { author, mediaUrl } from '@/lib/render/parts'

/**
 * Site search index, read by /js/templates/search.min.js. Built from the CMS, so new pages, case studies and
 * insights appear in search as soon as they are published.
 */
export const revalidate = 3600

export async function GET() {
  const [pages, caseStudies, insights, settings] = await Promise.all([getAllPages(), getCaseStudies(), getInsights(), getSettings()])

  const entries = [
    ...pages
      .filter((p) => !p.hideFromSearch)
      .map((p) => ({
        title: p.title,
        desc: p.searchDescription || p.meta?.description || '',
        url: p.path,
        section: p.searchSection || 'Pages',
        type: 'Pages',
      })),
    ...caseStudies.map((c) => ({
      title: c.cardTitle,
      desc: c.summary || '',
      url: `/case-studies/${c.slug}`,
      section: 'Case studies',
      type: 'Case Studies',
      img: mediaUrl(c.cardImage) || mediaUrl(c.heroImage),
      tag: c.cardTag || '',
    })),
    ...insights.map((i) => {
      const a = author(i.author)
      return {
        title: i.title,
        desc: i.summary ? (i.summary.length > 200 ? `${i.summary.slice(0, 199).trimEnd()}…` : i.summary) : '',
        url: `/insights/${i.slug}`,
        section: 'Insights',
        type: 'Insights',
        img: mediaUrl(i.cardImage) || mediaUrl(i.coverImage),
        tag: i.category,
        time: i.readTime || '',
        author: a?.name || '',
        role: a?.role || '',
        avatar: mediaUrl(a?.photo),
      }
    }),
    ...(settings.searchExtras || []).map(({ id: _id, ...e }) => e),
  ]

  return new Response(`window.Q3_SEARCH_INDEX=${JSON.stringify(entries)};`, {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
  })
}
