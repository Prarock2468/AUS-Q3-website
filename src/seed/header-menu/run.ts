/**
 * Header Menu → Menu and submenus:
 *   - when the menu is empty (or with --force), imports it from the menu in the Site settings header HTML;
 *   - then turns custom links whose URL is a page, case study or insight into "Page or post" links, so they follow
 *     that page if its address changes. Labels are kept. Safe to run more than once.
 */
import 'dotenv/config'
import { load } from 'cheerio'
import { getPayload } from 'payload'
import config from '../../payload.config'

type Link = { type?: string | null; reference?: unknown; label?: string | null; link?: string | null; newTab?: boolean | null }
type Item = Link & { submenuStyle?: string | null; submenu?: Link[] | null }

const payload = await getPayload({ config })
const force = process.argv.includes('--force')

function importFromHeaderHtml(html: string): Item[] {
  const $ = load(html)
  // The mobile menu holds the heading link for each dropdown (for example Services → /services).
  const mobileLinks = new Map<string, string>()
  $('.mobile-nav__panel > a:not(.btn)').each((_, a) => {
    mobileLinks.set($(a).text().trim(), $(a).attr('href') || '')
  })
  return $('nav.primary-nav')
    .children()
    .toArray()
    .map((el): Item => {
      const $el = $(el)
      if (el.tagName === 'a') return { type: 'custom', label: $el.text().trim(), link: $el.attr('href') || '' }
      const label = $el.children('summary').text().trim()
      return {
        type: 'custom',
        label,
        link: mobileLinks.get(label) || '',
        submenuStyle: $el.find('.mega').hasClass('mega--compact') ? 'compact' : 'wide',
        submenu: $el
          .find('.mega__list > li')
          .toArray()
          .map((li) => {
            const a = $(li).children('a')
            return a.length
              ? { type: 'custom', label: a.text().trim(), link: a.attr('href') || '' }
              : { type: 'custom', label: $(li).text().trim() }
          }),
      }
    })
    .filter((item) => item.label)
}

const current = await payload.findGlobal({ slug: 'header-menu', depth: 0 })
let items = (current.items || []) as Item[]
if (!items.length || force) {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  items = importFromHeaderHtml(settings.header || '')
  if (!items.length) {
    payload.logger.error('No menu found in Site settings → Header.')
    process.exit(1)
  }
  payload.logger.info(`Imported ${items.length} menu items from the header HTML.`)
}

// URL → page or post, for every published page, case study and insight.
const targets = new Map<string, { relationTo: 'pages' | 'case-studies' | 'insights'; value: number }>()
const published = { _status: { equals: 'published' as const } }
for (const p of (await payload.find({ collection: 'pages', where: published, limit: 0, depth: 0, select: { path: true } })).docs)
  if (p.path) targets.set(p.path, { relationTo: 'pages', value: p.id as number })
for (const c of (await payload.find({ collection: 'case-studies', where: published, limit: 0, depth: 0, select: { slug: true } })).docs)
  targets.set(`/case-studies/${c.slug}`, { relationTo: 'case-studies', value: c.id as number })
for (const i of (await payload.find({ collection: 'insights', where: published, limit: 0, depth: 0, select: { slug: true } })).docs)
  targets.set(`/insights/${i.slug}`, { relationTo: 'insights', value: i.id as number })

let linked = 0
const toReference = (l: Link): Link => {
  if (l.type === 'reference' && l.reference) return l
  const target = l.link ? targets.get(l.link.trim()) : undefined
  if (!target) return { ...l, type: 'custom' }
  linked++
  return { ...l, type: 'reference', reference: target, link: null }
}
items = items.map((item) => ({ ...toReference(item), submenu: (item.submenu || []).map(toReference) }))

await payload.updateGlobal({ slug: 'header-menu', data: { items } as any, context: { disableRevalidate: true } })
for (const item of items) {
  const subs = item.submenu || []
  const refs = subs.filter((s) => s.type === 'reference').length
  payload.logger.info(`${item.label}: ${item.type === 'reference' ? 'page or post' : item.link || '(no link)'}${subs.length ? `, ${subs.length} submenu items (${refs} linked to pages)` : ''}`)
}
payload.logger.info(`${linked} links now point at a page or post.`)
process.exit(0)
