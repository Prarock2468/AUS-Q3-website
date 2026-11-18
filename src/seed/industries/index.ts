/**
 * Industry detail pages (Energy and Utilities, Healthcare, Logistics, Manufacturing, Retail, Sports, Telecom, Travel).
 *
 * Each page uses the Education page's template ("industryDetail") and the copy and images of the matching page on
 * www.q3tech.com (linked from each page's Advanced SEO → Global URL). The page data lives in ./pages/<slug>.json and the
 * images in /public/assets/{images,icons}/industry-details/<slug>/.
 *
 * Both steps are safe to re-run:
 *   - seedIndustryPages creates each page, or updates it if a page with that path already exists.
 *   - linkIndustries turns the plain-text industry names in the header, footer, "Other industries" section and the
 *     Industries page tiles into links. Names that are already links are left alone.
 *
 *   npm run seed:industries    (also runs as the last step of `npm run seed`)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'

const PAGES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'pages')
const ctx = { disableRevalidate: true }
const log = (...a: unknown[]) => console.log('[seed:industries]', ...a)

/** Every industry detail page, including Education (seeded from the original site). */
export const INDUSTRIES = [
  { slug: 'education', name: 'Education' },
  { slug: 'energy-and-utilities', name: 'Energy and Utilities' },
  { slug: 'healthcare-and-life-sciences', name: 'Healthcare and Life Sciences' },
  { slug: 'logistics', name: 'Logistics' },
  { slug: 'manufacturing', name: 'Manufacturing' },
  { slug: 'retail-and-e-commerce', name: 'Retail and E-commerce' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'telecom', name: 'Telecom' },
  { slug: 'travel-and-hospitality', name: 'Travel and Hospitality' },
] as const

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export async function seedIndustryPages(payload: Payload) {
  const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json')).sort()
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf8'))
    const existing = await payload.find({
      collection: 'pages',
      where: { path: { equals: data.path } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    const id = existing.docs[0]?.id
    if (id) await payload.update({ collection: 'pages', id, data, draft: false, context: ctx, overrideAccess: true })
    else await payload.create({ collection: 'pages', data, draft: false, context: ctx, overrideAccess: true })
    log(`${id ? 'updated' : 'created'} ${data.path}`)
  }
}

/** Replace plain-text industry names with links. Returns the new HTML and how many names were linked. */
export function linkIndustryNames(html: string, kind: 'header' | 'footer' | 'otherIndustries' | 'tiles') {
  let count = 0
  let out = html
  for (const { slug, name } of INDUSTRIES) {
    const url = `/industries/${slug}`
    const n = escapeRe(name)
    const link = (re: RegExp, to: (inner: string) => string) => {
      out = out.replace(re, (_m, inner = '') => {
        count++
        return to(inner)
      })
    }
    if (kind === 'header') {
      link(new RegExp(`<span class="mega__text">${n}</span>`, 'g'), () => `<a href="${url}">${name}</a>`)
      link(new RegExp(`<span class="sub__text">${n}</span>`, 'g'), () => `<a href="${url}">${name}</a>`)
    } else if (kind === 'footer') {
      link(new RegExp(`<span class="site-footer__text">${n}</span>`, 'g'), () => `<a href="${url}">${name}</a>`)
    } else if (kind === 'otherIndustries') {
      const label = `<span class="oi-label">${n}</span>`
      link(new RegExp(`<div class="oi-link oi-link--static">((?:(?!</div>)[\\s\\S])*?${label})</div>`), (inner) => `<a class="oi-link" href="${url}">${inner}</a>`)
      link(new RegExp(`<a class="oi-link" href="/case-studies">((?:(?!</a>)[\\s\\S])*?${label})</a>`), (inner) => `<a class="oi-link" href="${url}">${inner}</a>`)
    } else {
      link(new RegExp(`href="/case-studies"( aria-label="View Case Studies: ${escapeRe(name.replace(/&/g, '&amp;'))}")`), (aria) => `href="${url}"${aria}`)
    }
  }
  return { html: out, count }
}

export async function linkIndustries(payload: Payload) {
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })) as any
  const header = linkIndustryNames(settings.header || '', 'header')
  const footer = linkIndustryNames(settings.footer || '', 'footer')
  const other = linkIndustryNames(settings.otherIndustries || '', 'otherIndustries')
  if (header.count + footer.count + other.count) {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { header: header.html, footer: footer.html, otherIndustries: other.html } as any,
      context: ctx,
      overrideAccess: true,
    })
  }
  log(`site settings: linked ${header.count} header, ${footer.count} footer, ${other.count} "Other industries" items`)

  const found = await payload.find({ collection: 'pages', where: { path: { equals: '/industries' } }, limit: 1, depth: 0, overrideAccess: true })
  const page = found.docs[0] as any
  if (!page) return log('no /industries page found; tiles not linked')
  let tiles = 0
  const layout = page.layout.map((b: any) => {
    if (b.blockType !== 'htmlSection') return b
    const r = linkIndustryNames(b.html, 'tiles')
    tiles += r.count
    return { ...b, html: r.html }
  })
  if (tiles) await payload.update({ collection: 'pages', id: page.id, data: { layout }, draft: false, context: ctx, overrideAccess: true })
  log(`industries page: linked ${tiles} tiles`)
}

export async function seedIndustries(payload: Payload) {
  await seedIndustryPages(payload)
  await linkIndustries(payload)
}
