/**
 * Moves the hero banner of the Services page (/services), every Industry detail page (/industries/…) and every
 * Service page (/services/…) from a Custom section (HTML) into the "Hero banner" section:
 *  1. Reads the title, breadcrumb name, text, image, stats and buttons from the HTML (section.hero / section.ind-hero;
 *     the Services page has no image or stats).
 *  2. Uploads the image to Media (named after its folder, e.g. services-microsoft-solutions-hero.webp, since several
 *     pages have a file called hero.webp; reused when already uploaded).
 *  3. Replaces the HTML section with the new section, in the same position, in the published page and, when there
 *     is one, in the unpublished draft (which stays a draft).
 * A page whose hero is not the expected shape is skipped (and listed); the others are still converted. Safe to run
 * more than once: `npm run seed:detail-hero`.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { textToRichText } from '../../fields/richTextValue'
import type { Page } from '../../payload-types'

type Section = NonNullable<Page['layout']>[number]
type Hero = Extract<Section, { blockType: 'detailHero' }>

const context = { disableRevalidate: true }
const PUBLIC = path.resolve(process.cwd(), 'public')
// Breadcrumb parent per template (the Services overview page has none: "Home / Services").
const PARENT: Record<string, string | null> = { services: null, service: '/services', industryDetail: '/industries' }
// How each template's hero HTML starts.
const HERO_START: Record<string, RegExp> = {
  services: /<section class="hero" aria-labelledby="hero-title"/,
  service: /<section class="hero" id="top"/,
  industryDetail: /<section class="ind-hero"/,
}
const payload = await getPayload({ config })

class Shape extends Error {}
const fail = (msg: string): never => {
  throw new Shape(msg)
}

const isHeroHtml = (template: string) => (b: Section) => b.blockType === 'htmlSection' && HERO_START[template].test(b.html || '')

/** The Services overview hero: "Home / Services", heading lines (span.line), text and ui-btn buttons. */
function readOverview(html: string): Hero {
  const $ = cheerio.load(html, null, false)
  const crumbs = $('nav.breadcrumb li')
  if (crumbs.length !== 2) fail(`breadcrumb has ${crumbs.length} items (expected 2)`)
  if ($('img').not('.hero__btns img').length) fail('has an image (this design has none)')
  const lines = $('h1 > .line')
    .toArray()
    .map((l) => $(l).text().replace(/\s+/g, ' ').trim())
  if (!lines.length || $('h1').children().not('.line').length) fail('heading is not made of span.line')
  const paragraphs = $('.hero__text > p')
  if (paragraphs.length !== 1) fail(`${paragraphs.length} paragraphs (expected 1)`)
  const buttons = $('.hero__btns a')
    .toArray()
    .map((a) => {
      const cls = $(a).attr('class') || ''
      const outline = /ui-btn--ghost/.test(cls)
      if (!outline && !/ui-btn--primary/.test(cls)) fail(`unknown button style "${cls}"`)
      return { label: $(a).text().replace(/\s+/g, ' ').trim(), link: $(a).attr('href') || fail('button without link'), style: outline ? 'outline' : 'primary' } as const
    })
  if (buttons.length > 2) fail('more than 2 buttons')
  const title = lines.join('\n')
  const crumb = $(crumbs[1]).text().trim()
  return {
    blockType: 'detailHero',
    title,
    breadcrumbLabel: crumb && crumb !== lines.join(' ') ? crumb : null,
    description: textToRichText(paragraphs.text().replace(/\s+/g, ' '))!,
    image: null,
    stats: [],
    buttons,
  }
}

const uploaded = new Map<string, number>()
async function upload(src: string, alt: string): Promise<number> {
  // /assets/images/services/microsoft-solutions/hero.webp → services-microsoft-solutions-hero.webp
  const name = src.replace(/^\/assets\/images\//, '').replace(/\//g, '-')
  if (uploaded.has(name)) return uploaded.get(name)!
  const found = await payload.find({ collection: 'media', where: { filename: { equals: name } }, limit: 1, depth: 0 })
  let id = found.docs[0]?.id as number | undefined
  if (!id) {
    const file = path.join(PUBLIC, src)
    if (!src.startsWith('/') || !fs.existsSync(file)) fail(`image ${src} not found in /public`)
    const data = fs.readFileSync(file)
    const ext = path.extname(name).toLowerCase()
    const mimetype = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : ext === '.avif' ? 'image/avif' : 'image/jpeg'
    const doc = await payload.create({ collection: 'media', data: { alt }, file: { data, mimetype, name, size: data.length }, context })
    payload.logger.info(`  uploaded ${name}`)
    id = doc.id as number
  }
  uploaded.set(name, id)
  return id
}

async function read(html: string, template: string): Promise<Hero> {
  if (template === 'services') return readOverview(html)
  const $ = cheerio.load(html, null, false)
  const isService = template === 'service'
  const crumbs = $('nav.breadcrumb li')
  if (crumbs.length !== 3) fail(`breadcrumb has ${crumbs.length} items (expected 3)`)
  if ($(crumbs[1]).find('a').attr('href') !== PARENT[template]) fail(`breadcrumb parent is not ${PARENT[template]}`)
  const h1 = $('h1')
  if (h1.length !== 1) fail('expected one h1')
  if (h1.children().not('br').length) fail('h1 has markup other than <br>')
  const title = (h1.html() || '')
    .split(/<br\s*\/?>/i)
    .map((l) => cheerio.load(l, null, false).text().replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
  const crumb = $(crumbs[2]).text().trim()
  const paragraphs = isService ? $('.hero__text > p') : $('.ind-hero__side > p')
  if (paragraphs.length !== 1) fail(`${paragraphs.length} paragraphs (expected 1)`)
  const img = $(isService ? '.hero__media img' : '.ind-hero__media img')
  if (img.length !== 1) fail('expected one image')
  const buttons = $(isService ? '.hero__btns a' : '.ind-hero__btns a')
    .toArray()
    .map((a) => {
      const cls = $(a).attr('class') || ''
      const outline = /btn--outline-white|ind-btn--ghost/.test(cls)
      if (!outline && !/btn--primary|ind-btn--primary/.test(cls)) fail(`unknown button style "${cls}"`)
      return { label: $(a).text().replace(/\s+/g, ' ').trim(), link: $(a).attr('href') || fail('button without link'), style: outline ? 'outline' : 'primary' } as const
    })
  if (buttons.length > 2) fail('more than 2 buttons')
  const stats = isService
    ? $('.stat')
        .toArray()
        .map((s) => ({
          value: $(s).find('.stat__n').text().trim(),
          suffix: $(s).find('.stat__suf').text().trim() || null,
          label: $(s).find('.stat__label').text().trim(),
        }))
    : []
  if (stats.some((s) => !s.value || !s.label)) fail('a stat has no number or label')
  if (stats.length > 4) fail('more than 4 stats')
  const alt = img.attr('alt') || ''
  return {
    blockType: 'detailHero',
    title,
    breadcrumbLabel: crumb && crumb !== title.replace(/\n/g, ' ') ? crumb : null,
    description: textToRichText(paragraphs.text().replace(/\s+/g, ' '))!,
    image: await upload(img.attr('src') || fail('image without src'), alt),
    stats,
    buttons,
  }
}

const pages = (
  await payload.find({ collection: 'pages', where: { template: { in: Object.keys(PARENT) } }, depth: 0, limit: 500, pagination: false })
).docs
const skipped: string[] = []
let done = 0
for (const published of pages) {
  const template = published.template as string
  const isHero = isHeroHtml(template)
  const latest = (await payload.find({ collection: 'pages', where: { id: { equals: published.id } }, depth: 0, limit: 1, draft: true })).docs[0]
  const pubHero = (published.layout || []).find(isHero)
  const draftHero = latest._status === 'draft' ? (latest.layout || []).find(isHero) : undefined
  if (!pubHero && !draftHero) {
    payload.logger.info(`${published.path}: no hero HTML (already moved?), skipped.`)
    continue
  }
  try {
    // Each version keeps its own hero text (a draft may have edits that are not published yet).
    if (pubHero && pubHero.blockType === 'htmlSection') {
      const block = await read(pubHero.html || '', template)
      const layout = (published.layout || []).map((b) => (b === pubHero ? block : b))
      await payload.update({ collection: 'pages', id: published.id, data: { layout, _status: 'published' }, context })
    }
    if (draftHero && draftHero.blockType === 'htmlSection') {
      const block = await read(draftHero.html || '', template)
      const layout = (latest.layout || []).map((b) => (b === draftHero ? block : b))
      await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout, _status: 'draft' }, context })
    }
    done++
    payload.logger.info(`${published.path}: hero is now the "Hero banner" section${draftHero ? ' (draft too)' : ''}.`)
  } catch (err) {
    if (!(err instanceof Shape)) throw err
    skipped.push(`${published.path}: ${err.message}`)
  }
}
payload.logger.info(`Converted ${done} page(s).`)
if (skipped.length) payload.logger.warn(`Skipped (hero left as HTML):\n  ${skipped.join('\n  ')}`)
process.exit(0)
