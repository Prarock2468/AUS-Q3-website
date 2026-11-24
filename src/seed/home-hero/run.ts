/**
 * Moves the home page hero from a Custom section (HTML) into the "Hero (home page)" section:
 *  1. Reads the hero HTML (section.home-hero): badges, heading, intro, buttons, poster image and videos.
 *  2. Uploads the poster and videos to Media (reusing ones already uploaded).
 *  3. Replaces the HTML section with the new section, in the same position, and removes the separate HTML section
 *     that only preloaded the poster (the new section preloads its own poster). Done in the published home page
 *     and, when there is one, in the unpublished draft too (which stays a draft).
 * Stops without changing anything if the HTML is not the expected shape. Safe to run more than once:
 * `npm run seed:home-hero`.
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
type HomeHero = Extract<Section, { blockType: 'homeHero' }>

const context = { disableRevalidate: true }
const PUBLIC = path.resolve(process.cwd(), 'public')
const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
}
const payload = await getPayload({ config })

const isHeroHtml = (b: Section) => b.blockType === 'htmlSection' && /class="home-hero"/.test(b.html || '')

const get = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', where: { path: { equals: '/' } }, depth: 0, limit: 1, draft })).docs[0]
const published = await get(false)
const latest = await get(true)
if (!published) throw new Error('Home page not found.')

const source = (latest.layout || []).find(isHeroHtml) || (published.layout || []).find(isHeroHtml)
if (!source || source.blockType !== 'htmlSection') {
  payload.logger.info('Home page has no hero HTML section (already moved?). Nothing to do.')
  process.exit(0)
}

// 1. Read the HTML.
const $ = cheerio.load(source.html)
const sec = $('section.home-hero')
const fail = (msg: string): never => {
  throw new Error(`Home hero HTML is not the expected shape: ${msg}. Nothing was changed.`)
}
const heading = sec.find('h1').first().text().trim()
const posterSrc = sec.find('video').attr('poster') || ''
const webmSrc = sec.find('source[type^="video/webm"]').attr('data-src') || ''
const mp4Src = sec.find('source[type^="video/mp4"]').attr('data-src') || ''
if (!heading) fail('no h1')
if (!posterSrc) fail('no poster image')
if (sec.find('.lede').length > 1) fail('more than one intro paragraph')

/** The separate HTML section that only preloads this hero's poster. */
const isPosterPreload = (b: Section) =>
  b.blockType === 'htmlSection' && new RegExp(`^\\s*<link rel="preload" as="image" href="${posterSrc}"[^>]*>\\s*$`).test(b.html || '')

async function upload(src: string, alt: string): Promise<number> {
  const filename = path.basename(src)
  const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
  if (found.docs[0]) return found.docs[0].id as number
  const file = path.join(PUBLIC, src)
  const mimetype = MIME[path.extname(filename).toLowerCase()]
  if (!src.startsWith('/') || !fs.existsSync(file)) fail(`${src} not found in /public`)
  if (!mimetype) fail(`${src} is not a supported file type`)
  const data = fs.readFileSync(file)
  const doc = await payload.create({ collection: 'media', data: { alt }, file: { data, mimetype, name: filename, size: data.length }, context })
  payload.logger.info(`Uploaded ${filename}`)
  return doc.id as number
}

const block: HomeHero = {
  blockType: 'homeHero',
  badges: sec
    .find('.hero-stats li')
    .toArray()
    .map((li) => {
      const $li = $(li).clone()
      const icon = $li.find('.pill-emoji').remove().text().trim()
      const highlight = $li.find('strong').remove().text().trim()
      return { icon: icon || null, highlight, text: $li.text().trim() || null }
    }),
  heading,
  intro: textToRichText(sec.find('.lede').text()),
  buttons: sec
    .find('.actions a')
    .toArray()
    .map((a) => ({
      label: $(a).text().trim(),
      link: $(a).attr('href') || '',
      style: $(a).hasClass('btn-outline') ? ('outline' as const) : ('primary' as const),
      trackingId: $(a).attr('data-cta') || null,
    })),
  poster: await upload(posterSrc, ''),
  videoWebm: webmSrc ? await upload(webmSrc, '') : null,
  videoMp4: mp4Src ? await upload(mp4Src, '') : null,
}
if (block.badges?.some((b) => !b.highlight)) fail('a badge has no bold text')
if (block.buttons?.some((b) => !b.label || !b.link)) fail('a button has no text or link')
payload.logger.info(`Read hero "${heading}" (${block.badges?.length} badges, ${block.buttons?.length} buttons).`)

// 3. Swap it in, in the same position, and drop the poster preload section.
const swap = (layout: Page['layout']) =>
  (layout || []).filter((b) => !isPosterPreload(b)).map((b) => (isHeroHtml(b) ? block : b))

if ((published.layout || []).some(isHeroHtml)) {
  await payload.update({ collection: 'pages', id: published.id, data: { layout: swap(published.layout), _status: 'published' }, context })
  payload.logger.info('Published home page: the hero is now the "Hero (home page)" section.')
}
if (latest._status === 'draft' && (latest.layout || []).some(isHeroHtml)) {
  // Re-save the pending draft on top, with the same swap, so the editor's unpublished changes are kept as a draft.
  await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
  payload.logger.info('Unpublished home page draft: same change made; it is still a draft.')
}
process.exit(0)
