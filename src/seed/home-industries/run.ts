/**
 * Moves the home page "Industries We Serve" from a Custom section (HTML) into the "Industries we serve (home page)"
 * section:
 *  1. Reads the industries from the HTML section (section.industries-section): heading, View all button, and per
 *     industry its title, text, link and image.
 *  2. Uploads each image to Media (reusing ones already uploaded).
 *  3. Replaces the HTML section with the new section, in the same position, in the published home page and, when
 *     there is one, in the unpublished draft too (which stays a draft, so nobody's pending edits get published).
 * Stops without changing anything if the HTML is not the expected shape. Safe to run more than once:
 * `npm run seed:home-industries`.
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
type HomeIndustries = Extract<Section, { blockType: 'homeIndustries' }>

const context = { disableRevalidate: true }
const PUBLIC = path.resolve(process.cwd(), 'public')
const payload = await getPayload({ config })

const isIndustriesHtml = (b: Section) => b.blockType === 'htmlSection' && /class="[^"]*\bindustries-section\b/.test(b.html || '')

const get = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', where: { path: { equals: '/' } }, depth: 0, limit: 1, draft })).docs[0]
const published = await get(false)
const latest = await get(true)
if (!published) throw new Error('Home page not found.')

const source = (latest.layout || []).find(isIndustriesHtml) || (published.layout || []).find(isIndustriesHtml)
if (!source || source.blockType !== 'htmlSection') {
  payload.logger.info('Home page has no "Industries We Serve" HTML section (already moved?). Nothing to do.')
  process.exit(0)
}

// 1. Read the HTML.
const $ = cheerio.load(source.html)
const sec = $('section.industries-section')
const fail = (msg: string): never => {
  throw new Error(`"Industries We Serve" HTML is not the expected shape: ${msg}. Nothing was changed.`)
}
const viewAll = sec.find('.section-head a').first()
const tabs = sec.find('.tab-btn').toArray()
const slides = sec.find('.tab-slide').toArray()
if (!slides.length) fail('no industries (.tab-slide)')
if (tabs.length !== slides.length) fail(`${tabs.length} tabs but ${slides.length} slides`)

async function uploadImage(src: string, alt: string): Promise<number> {
  const filename = path.basename(src)
  const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
  if (found.docs[0]) return found.docs[0].id as number
  const file = path.join(PUBLIC, src)
  if (!src.startsWith('/') || !fs.existsSync(file)) fail(`image ${src} not found in /public`)
  const data = fs.readFileSync(file)
  const ext = path.extname(filename).toLowerCase()
  const mimetype = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : ext === '.avif' ? 'image/avif' : 'image/jpeg'
  const doc = await payload.create({ collection: 'media', data: { alt }, file: { data, mimetype, name: filename, size: data.length }, context })
  payload.logger.info(`Uploaded ${filename}`)
  return doc.id as number
}

const industries: HomeIndustries['industries'] = []
for (const [i, el] of slides.entries()) {
  const $s = $(el)
  const title = $s.find('.slide-copy h3').text().trim()
  const paragraphs = $s.find('.slide-copy > p')
  const link = $s.find('.slide-copy a').first()
  const src = $s.find('.slide-media img').attr('src') || ''
  if (!title) fail(`industry ${i + 1} has no title`)
  if ($(tabs[i]).text().trim() !== title) fail(`tab ${i + 1} "${$(tabs[i]).text().trim()}" does not match "${title}"`)
  if (paragraphs.length !== 1) fail(`industry ${i + 1} has ${paragraphs.length} paragraphs (expected 1)`)
  if (!src) fail(`industry ${i + 1} has no image`)
  industries.push({
    title,
    description: textToRichText(paragraphs.text())!,
    linkLabel: link.text().trim() || null,
    link: link.attr('href') || null,
    image: await uploadImage(src, title),
  })
}
const block: HomeIndustries = {
  blockType: 'homeIndustries',
  heading: sec.find('.section-head h2').first().text().trim() || 'Industries We Serve',
  viewAllLabel: viewAll.text().trim() || null,
  viewAllLink: viewAll.attr('href') || null,
  industries,
}
payload.logger.info(`Read ${industries.length} industries (${industries.map((s) => s.title).join(', ')}).`)

// 3. Swap it in, in the same position.
const swap = (layout: Page['layout']) => (layout || []).map((b) => (isIndustriesHtml(b) ? block : b))

if ((published.layout || []).some(isIndustriesHtml)) {
  await payload.update({ collection: 'pages', id: published.id, data: { layout: swap(published.layout), _status: 'published' }, context })
  payload.logger.info('Published home page: "Industries We Serve" is now the "Industries we serve (home page)" section.')
}
if (latest._status === 'draft' && (latest.layout || []).some(isIndustriesHtml)) {
  // Re-save the pending draft on top, with the same swap, so the editor's unpublished changes are kept as a draft.
  await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
  payload.logger.info('Unpublished home page draft: same change made; it is still a draft.')
}
process.exit(0)
