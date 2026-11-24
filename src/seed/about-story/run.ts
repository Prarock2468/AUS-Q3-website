/**
 * Moves "Championing Quality, Shaping Tomorrow" on the About page (/about) from a Custom section (HTML) into the
 * "Our story (timeline)" section:
 *  1. Reads the eyebrow, heading and milestones (year, title, text, image) from the HTML (div[data-story-pin]).
 *  2. Uploads each image to Media (reusing ones already uploaded).
 *  3. Replaces the HTML section with the new section, in the same position, in the published page and, when there
 *     is one, in the unpublished draft (which stays a draft).
 * Stops without changing anything if the HTML is not the expected shape. Safe to run more than once:
 * `npm run seed:about-story`.
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
type AboutStory = Extract<Section, { blockType: 'aboutStory' }>

const PAGE = '/about'
const context = { disableRevalidate: true }
const PUBLIC = path.resolve(process.cwd(), 'public')
const payload = await getPayload({ config })
const fail = (msg: string): never => {
  throw new Error(`"Our Story" HTML is not the expected shape: ${msg}. Nothing was changed.`)
}

const isStoryHtml = (b: Section) => b.blockType === 'htmlSection' && /data-story-pin/.test(b.html || '') && /class="ab-story"/.test(b.html || '')

const get = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', where: { path: { equals: PAGE } }, depth: 0, limit: 1, draft })).docs[0]
const published = await get(false)
const latest = await get(true)
if (!published) throw new Error(`${PAGE} not found.`)

const source = (latest.layout || []).find(isStoryHtml) || (published.layout || []).find(isStoryHtml)
if (!source || source.blockType !== 'htmlSection') {
  payload.logger.info(`${PAGE} has no "Our Story" HTML section (already moved?). Nothing to do.`)
  process.exit(0)
}

async function upload(src: string, alt: string): Promise<number> {
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

// 1. Read the HTML.
const $ = cheerio.load(source.html, null, false)
const cards = $('.story-card').toArray()
const years = $('.story-year').toArray()
if (!cards.length) fail('no milestones (.story-card)')
if (years.length !== cards.length) fail(`${cards.length} milestones but ${years.length} year buttons`)

const milestones: AboutStory['milestones'] = []
for (const [i, li] of cards.entries()) {
  const $li = $(li)
  const year = $li.find('.story-card__year').text().trim()
  const title = $li.find('h3').text().trim()
  const paragraphs = $li.find('.story-card__body p').not('.story-card__year')
  const src = $li.find('.story-card__img').attr('src') || ''
  if (!year || !title) fail(`milestone ${i + 1} has no year or title`)
  if (paragraphs.length !== 1) fail(`milestone ${i + 1} has ${paragraphs.length} paragraphs (expected 1)`)
  if ($(years[i]).find('span').text().trim() !== year) fail(`milestone ${i + 1}: its year button does not match`)
  milestones.push({ year, title, description: textToRichText(paragraphs.text())!, image: await upload(src, `Q3 Technologies, ${title}`) })
}
const block: AboutStory = {
  blockType: 'aboutStory',
  eyebrow: $('.ab-eyebrow').first().text().trim() || null,
  heading: $('#ab-story-title').text().trim() || fail('no heading'),
  milestones,
}
payload.logger.info(`Read "${block.heading}" (${milestones.length} milestones: ${milestones.map((m) => m.year).join(', ')}).`)

// 2. Swap it in, in the same position.
const swap = (layout: Page['layout']) => (layout || []).map((b) => (isStoryHtml(b) ? block : b))
if ((published.layout || []).some(isStoryHtml)) {
  await payload.update({ collection: 'pages', id: published.id, data: { layout: swap(published.layout), _status: 'published' }, context })
  payload.logger.info(`Published ${PAGE}: "Our Story" is now the "Our story (timeline)" section.`)
}
if (latest._status === 'draft' && (latest.layout || []).some(isStoryHtml)) {
  await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
  payload.logger.info(`Unpublished ${PAGE} draft: same change made; it is still a draft.`)
}
process.exit(0)
