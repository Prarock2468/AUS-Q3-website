/**
 * Moves "Our Services" on the Services page (/services) from a Custom section (HTML) into the "Our services
 * (Services page)" section:
 *  1. Reads the services from the HTML (div.svc-pin > section.road): title, text, image, pills (with their links)
 *     and button of each.
 *  2. Uploads each image to Media (reusing ones already uploaded).
 *  3. Replaces the HTML section with the new section, in the same position, in the published page and, when there
 *     is one, in the unpublished draft (which stays a draft).
 * Stops without changing anything if the HTML is not the expected shape. Safe to run more than once:
 * `npm run seed:services-list`.
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
type ServicesList = Extract<Section, { blockType: 'servicesList' }>

const PAGE = '/services'
const context = { disableRevalidate: true }
const PUBLIC = path.resolve(process.cwd(), 'public')
const payload = await getPayload({ config })
const fail = (msg: string): never => {
  throw new Error(`"Our Services" HTML is not the expected shape: ${msg}. Nothing was changed.`)
}

const isServicesHtml = (b: Section) => b.blockType === 'htmlSection' && /data-svc-pin/.test(b.html || '') && /road__list/.test(b.html || '')

const get = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', where: { path: { equals: PAGE } }, depth: 0, limit: 1, draft })).docs[0]
const published = await get(false)
const latest = await get(true)
if (!published) throw new Error(`${PAGE} not found.`)

const source = (latest.layout || []).find(isServicesHtml) || (published.layout || []).find(isServicesHtml)
if (!source || source.blockType !== 'htmlSection') {
  payload.logger.info(`${PAGE} has no "Our Services" HTML section (already moved?). Nothing to do.`)
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
const items = $('.road__item').toArray()
const sideImages = $('.road__media .road__img').toArray()
if (!items.length) fail('no services (.road__item)')
if (sideImages.length !== items.length) fail(`${items.length} services but ${sideImages.length} images`)

const services: ServicesList['services'] = []
for (const [i, li] of items.entries()) {
  const $li = $(li)
  const title = $li.find('.road__title').text().trim()
  const paragraphs = $li.find('.road__more-in > p')
  const thumb = $li.find('.road__thumb').attr('src') || ''
  const btn = $li.find('a.ui-btn').first()
  if (!title) fail(`service ${i + 1} has no title`)
  if (paragraphs.length !== 1) fail(`service ${i + 1} has ${paragraphs.length} paragraphs (expected 1)`)
  if (thumb !== $(sideImages[i]).attr('src')) fail(`service ${i + 1}: its image and the image column do not match`)
  services.push({
    title,
    description: textToRichText(paragraphs.text())!,
    image: await upload(thumb, title),
    subServices: $li
      .find('.road__pills > li')
      .toArray()
      .map((p) => ({ label: $(p).text().trim(), url: $(p).find('a').attr('href') || null })),
    buttonLabel: btn.text().trim() || null,
    buttonLink: btn.attr('href') || null,
  })
}
const block: ServicesList = { blockType: 'servicesList', heading: $('#svc-title, h2').first().text().trim() || 'Our Services', services }
payload.logger.info(`Read ${services.length} services (${services.map((s) => s.title).join(', ')}).`)

// 2. Swap it in, in the same position.
const swap = (layout: Page['layout']) => (layout || []).map((b) => (isServicesHtml(b) ? block : b))
if ((published.layout || []).some(isServicesHtml)) {
  await payload.update({ collection: 'pages', id: published.id, data: { layout: swap(published.layout), _status: 'published' }, context })
  payload.logger.info(`Published ${PAGE}: "Our Services" is now the "Our services (Services page)" section.`)
}
if (latest._status === 'draft' && (latest.layout || []).some(isServicesHtml)) {
  await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
  payload.logger.info(`Unpublished ${PAGE} draft: same change made; it is still a draft.`)
}
process.exit(0)
