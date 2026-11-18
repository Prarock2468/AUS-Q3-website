import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import type { CaseStudy, Insight, Page, SiteSetting } from '@/payload-types'
import type { TemplateName } from '@/templates'

export const getPayloadClient = () => getPayload({ config })

export const isDraft = async () => {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

/** Site settings, plus the header menu (Header Menu → Menu and submenus) that the header is built from. */
export const getSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await getPayloadClient()
  const [settings, headerMenu] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    // Menu links to pages and posts need only their title, address and status.
    payload
      .findGlobal({
        slug: 'header-menu',
        depth: 1,
        populate: {
          pages: { title: true, path: true, _status: true },
          'case-studies': { title: true, cardTitle: true, slug: true, _status: true },
          insights: { title: true, slug: true, _status: true },
        },
      })
      .catch(() => null),
  ])
  return Object.assign(settings, { headerMenu }) as SiteSetting
})

export type Resolved =
  | { kind: 'page'; path: string; template: TemplateName; doc: Page }
  | { kind: 'caseStudy'; path: string; template: 'caseStudy'; doc: CaseStudy }
  | { kind: 'insight'; path: string; template: 'insight'; doc: Insight }
  | { kind: 'redirect'; path: string; to: string }
  | { kind: 'notFound'; path: string; template: 'notFound' }

export const toPath = (slug?: string[]) => (slug?.length ? `/${slug.map(decodeURIComponent).join('/')}` : '/')

/** Find what lives at a URL: a page, a case study, an insight, or a CMS redirect. Cached per request. */
export const resolvePath = cache(async (path: string): Promise<Resolved> => {
  const payload = await getPayloadClient()
  const draft = await isDraft()
  const common = { draft, depth: 2, limit: 1, overrideAccess: draft, pagination: false } as const

  const segments = path.split('/').filter(Boolean)
  if (segments.length === 2 && segments[0] === 'case-studies') {
    const { docs } = await payload.find({ collection: 'case-studies', where: { slug: { equals: segments[1] } }, ...common })
    if (docs[0]) return { kind: 'caseStudy', path, template: 'caseStudy', doc: docs[0] }
  }
  if (segments.length === 2 && segments[0] === 'insights') {
    const { docs } = await payload.find({ collection: 'insights', where: { slug: { equals: segments[1] } }, ...common })
    if (docs[0]) return { kind: 'insight', path, template: 'insight', doc: docs[0] }
  }

  const { docs } = await payload.find({ collection: 'pages', where: { path: { equals: path } }, ...common })
  if (docs[0]) return { kind: 'page', path, template: (docs[0].template as TemplateName) || 'main', doc: docs[0] }

  const redirect = await payload.find({
    collection: 'redirects',
    where: { from: { in: [path, `${path}/`, `${path}.html`] } },
    depth: 1,
    limit: 1,
  })
  const r = redirect.docs[0] as any
  if (r) {
    const ref = r.to?.reference
    let to: string | undefined = r.to?.url
    if (r.to?.type === 'reference' && ref?.value) {
      const v = ref.value
      to = ref.relationTo === 'pages' ? v.path : `/${ref.relationTo}/${v.slug}`
    }
    if (to) return { kind: 'redirect', path, to }
  }
  return { kind: 'notFound', path, template: 'notFound' }
})

/** Published case studies for lists and cards, in list order. */
export const getCaseStudies = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'case-studies',
    sort: 'sortOrder',
    limit: 500,
    depth: 1,
    where: { _status: { equals: 'published' } },
    pagination: false,
  })
  return docs
})

export const getInsights = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'insights',
    sort: 'sortOrder',
    limit: 500,
    depth: 2,
    where: { _status: { equals: 'published' } },
    pagination: false,
  })
  return docs
})

export const getAllPages = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    limit: 500,
    depth: 0,
    where: { _status: { equals: 'published' } },
    pagination: false,
  })
  return docs
})
