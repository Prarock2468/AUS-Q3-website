/**
 * Moves the home page "Our Services" from a Custom section (HTML) into the "Our services (home page)" section:
 *  1. Reads the services from the HTML section (section.svc-wd): heading, View All button, and per service its
 *     title, description, link, sub-services and image.
 *  2. Uploads each image to Media (reusing ones already uploaded).
 *  3. Replaces the HTML section with the new section, in the same position, in the published home page and, when
 *     there is one, in the unpublished draft too (which stays a draft, so nobody's pending edits get published).
 * Stops without changing anything if the HTML is not the expected shape. Safe to run more than once:
 * `npm run seed:home-services`.
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
type HomeServices = Extract<Section, { blockType: 'homeServices' }>

const context = { disableRevalidate: true }
const PUBLIC = path.resolve(process.cwd(), 'public')
const payload = await getPayload({ config })

const isServicesHtml = (b: Section) => b.blockType === 'htmlSection' && /class="svc-wd"/.test(b.html || '')

const get = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', where: { path: { equals: '/' } }, depth: 0, limit: 1, draft })).docs[0]
const published = await get(false)
const latest = await get(true)
if (!published) throw new Error('Home page not found.')

const source = (latest.layout || []).find(isServicesHtml) || (published.layout || []).find(isServicesHtml)
if (!source || source.blockType !== 'htmlSection') {
  payload.logger.info('Home page has no "Our Services" HTML section (already moved?). Nothing to do.')
  process.exit(0)
}

// 1. Read the HTML.
const $ = cheerio.load(source.html)
const sec = $('section.svc-wd')
const fail = (msg: string): never => {
  throw new Error(`"Our Services" HTML is not the expected shape: ${msg}. Nothing was changed.`)
}
const viewAll = sec.find('a.wd-viewall').first()
const items = sec.find('li.wd-item').toArray()
const images = sec.find('img.wd-img').toArray()
if (!items.length) fail('no services (li.wd-item)')
if (images.length !== items.length) fail(`${items.length} services but ${images.length} images`)

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

const services: HomeServices['services'] = []
for (const [i, li] of items.entries()) {
  const $li = $(li)
  const title = $li.find('.wd-t').text().trim()
  const paragraphs = $li.find('.wd-text > p')
  const link = $li.find('a.wd-link').first()
  if (!title) fail(`service ${i + 1} has no title`)
  if (paragraphs.length !== 1) fail(`service ${i + 1} has ${paragraphs.length} paragraphs (expected 1)`)
  const img = $(images[i])
  if (img.attr('data-wd-img') !== String(i)) fail(`image ${i + 1} is not in service order`)
  services.push({
    title,
    description: textToRichText(paragraphs.text())!,
    linkLabel: link.text().trim() || null,
    link: link.attr('href') || null,
    image: await uploadImage(img.attr('src') || '', `${title}`),
    subServices: $li
      .find('.wd-subs a')
      .toArray()
      .map((a) => ({ label: $(a).text().trim(), url: $(a).attr('href') || '' })),
  })
}
const block: HomeServices = {
  blockType: 'homeServices',
  heading: sec.find('#svc-wd-title, h2').first().text().trim() || 'Our Services',
  viewAllLabel: viewAll.text().trim() || null,
  viewAllLink: viewAll.attr('href') || null,
  services,
}
payload.logger.info(`Read ${services.length} services (${services.map((s) => s.title).join(', ')}).`)

// 3. Swap it in, in the same position.
const swap = (layout: Page['layout']) => (layout || []).map((b) => (isServicesHtml(b) ? block : b))

if ((published.layout || []).some(isServicesHtml)) {
  await payload.update({ collection: 'pages', id: published.id, data: { layout: swap(published.layout), _status: 'published' }, context })
  payload.logger.info('Published home page: "Our Services" is now the "Our services (home page)" section.')
}
if (latest._status === 'draft' && (latest.layout || []).some(isServicesHtml)) {
  // Re-save the pending draft on top, with the same swap, so the editor's unpublished changes are kept as a draft.
  await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
  payload.logger.info('Unpublished home page draft: same change made; it is still a draft.')
}
process.exit(0)
