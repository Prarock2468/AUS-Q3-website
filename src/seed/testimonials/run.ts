/**
 * Moves the testimonials from Site settings → Shared sections → "Testimonials slider" (fixed HTML) into the saved
 * "Testimonial Slider" Common Component, and every page onto a "Testimonials" section that picks from it:
 *  1. Reads each testimonial card from the shared HTML: name, job title, quote, photo and company logo. A card whose
 *     photo is not a plain image (the old site's photo strip with a logo drawn on top) keeps that markup as its
 *     "Custom photo HTML", so it looks exactly the same.
 *  2. Uploads photos and logos to Media (reusing ones with the same file name; SVG logos become WebP, as Media does
 *     not accept SVG) and fills the slider's testimonials list, unless it already has testimonials.
 *  3. On every page, replaces "Shared section → Testimonials slider" and "Common component (saved) → Testimonial
 *     Slider" with a "Testimonials" section (showing all of them, same anchor id) in the same position: in the
 *     published version and, when there is one, in the unpublished draft too (which stays a draft).
 * Each page can then pick which testimonials it shows in its Testimonials section. Safe to run more than once:
 * `npm run seed:testimonials`.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import sharp from 'sharp'
import config from '../../payload.config'
import type { Page, TestimonialSliderBlock } from '../../payload-types'

type Section = NonNullable<Page['layout']>[number]

const ENTRY_KEY = 'testimonial-slider'
const context = { disableRevalidate: true }
const PUBLIC = path.resolve(process.cwd(), 'public')
const payload = await getPayload({ config })

const fail = (msg: string): never => {
  throw new Error(`Testimonials: ${msg}. Nothing was changed.`)
}

const entry = (await payload.find({ collection: 'commonComponent', where: { key: { equals: ENTRY_KEY } }, limit: 1, depth: 0 })).docs[0]
if (!entry) fail(`no Common Component with key "${ENTRY_KEY}"`)
const sliders = (entry.layout || []).filter((s) => s.blockType === 'testimonialSlider')
if (sliders.length !== 1) fail(`Common Component "${entry.title}" has ${sliders.length} testimonial sliders (expected 1)`)

/** Uploads a /public file to Media (reusing one with the same file name). SVGs become WebP at 2× size. */
async function upload(src: string, alt: string): Promise<number> {
  const file = path.join(PUBLIC, src)
  if (!src.startsWith('/') || !fs.existsSync(file)) fail(`${src} not found in /public`)
  const isSvg = path.extname(src).toLowerCase() === '.svg'
  const name = isSvg ? path.basename(src).replace(/\.svg$/i, '.webp') : path.basename(src)
  const found = await payload.find({ collection: 'media', where: { filename: { equals: name } }, limit: 1, depth: 0 })
  if (found.docs[0]) return found.docs[0].id as number
  const data = isSvg ? await sharp(file, { density: 144 }).webp({ quality: 90 }).toBuffer() : fs.readFileSync(file)
  const ext = path.extname(name).toLowerCase()
  const mimetype = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg'
  const doc = await payload.create({ collection: 'media', data: { alt }, file: { data, mimetype, name, size: data.length }, context })
  payload.logger.info(`Uploaded ${name}`)
  return doc.id as number
}

// 1–2. Fill the saved slider from the shared HTML (once).
if ((sliders[0] as TestimonialSliderBlock).testimonials?.length) {
  payload.logger.info(`"${entry.title}" already has testimonials; left as is.`)
} else {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const $ = cheerio.load(settings.testimonials || '')
  const cards = $('.tcard').toArray()
  if (!cards.length) fail('no testimonial cards (.tcard) in Site settings → Testimonials slider')

  const testimonials: NonNullable<TestimonialSliderBlock['testimonials']> = []
  for (const [i, card] of cards.entries()) {
    const $c = $(card)
    const name = $c.find('.tbody__name').text().trim()
    const quote = $c
      .find('.tbody__text p')
      .toArray()
      .map((p) => $(p).text().replace(/​/g, '').trim())
      .filter(Boolean)
      .join('\n\n')
    if (!name) fail(`card ${i + 1} has no name`)
    if (!quote) fail(`card ${i + 1} (${name}) has no quote`)
    const photoImg = $c.find('.tphoto > img.tphoto__img')
    const plainPhoto = photoImg.length === 1 && $c.find('.tphoto').children().length === 1
    const logoSrc = $c.find('.tbody__logo').attr('src')
    testimonials.push({
      name,
      role: $c.find('.tbody__role').text().trim() || null,
      quote,
      photo: plainPhoto ? await upload(photoImg.attr('src') || '', name) : null,
      photoHtml: plainPhoto ? null : $c.find('.tphoto').html()?.trim() || null,
      companyLogo: logoSrc ? await upload(logoSrc, '') : null,
    })
  }
  await payload.update({
    collection: 'commonComponent',
    id: entry.id,
    data: { layout: (entry.layout || []).map((s) => (s.blockType === 'testimonialSlider' ? { ...s, testimonials } : s)) },
    context,
  })
  payload.logger.info(`"${entry.title}": added ${testimonials.length} testimonials (${testimonials.map((t) => t.name).join(', ')}).`)
}

// 3. Pages: shared testimonials or the saved slider → a Testimonials section.
const refId = (c: unknown) => (c && typeof c === 'object' ? (c as { id: number }).id : c)
const isShared = (b: Section) =>
  (b.blockType === 'sharedSection' && b.section === 'testimonials') ||
  (b.blockType === 'commonComponentRef' && refId(b.component) === entry.id)
const swap = (layout: Page['layout']) =>
  (layout || []).map((b) =>
    isShared(b) ? ({ blockType: 'testimonials', anchorId: (b as { anchorId?: string | null }).anchorId || null } as Section) : b,
  )

const { docs: pages } = await payload.find({ collection: 'pages', depth: 0, limit: 1000, pagination: false })
let moved = 0
for (const page of pages) {
  const latest = (await payload.find({ collection: 'pages', where: { id: { equals: page.id } }, depth: 0, limit: 1, draft: true })).docs[0]
  if ((page.layout || []).some(isShared)) {
    await payload.update({ collection: 'pages', id: page.id, data: { layout: swap(page.layout), _status: 'published' }, context })
    moved++
  }
  if (latest?._status === 'draft' && (latest.layout || []).some(isShared)) {
    // Re-save the pending draft on top, with the same swap, so the editor's unpublished changes stay a draft.
    await payload.update({ collection: 'pages', id: page.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
    payload.logger.info(`${page.path}: unpublished draft updated too (still a draft).`)
  }
}
payload.logger.info(moved ? `${moved} pages now use a Testimonials section.` : 'No pages left to move.')
process.exit(0)
