/**
 * On every Service page (/services/…), moves two Custom sections (HTML) into structured sections, in the same
 * position, in the published page and, when there is one, in the unpublished draft (which stays a draft):
 *  - section.services ("Our Full-Spectrum … Services") → "Services offered (Service page)";
 *  - section.process ("… Delivery Framework") → "Delivery process (Service page)".
 * Step images are uploaded to Media (named after their folder, e.g. services-ai-solutions-development-process-
 * phase-1.webp; reused when already uploaded). The items' default background image is left empty (the section
 * falls back to it). A section that is not the expected shape is left as HTML and listed. Safe to run more than
 * once: `npm run seed:service-sections`.
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
type Offerings = Extract<Section, { blockType: 'serviceOfferings' }>
type Process = Extract<Section, { blockType: 'serviceProcess' }>

const context = { disableRevalidate: true }
const PUBLIC = path.resolve(process.cwd(), 'public')
const DEFAULT_ITEM_IMAGE = '/assets/images/svc-item-bg.webp'
const payload = await getPayload({ config })

/** A cheerio selection. */
type Sel = ReturnType<cheerio.CheerioAPI>

class Shape extends Error {}
const fail = (msg: string): never => {
  throw new Shape(msg)
}

const isHtml = (cls: string) => (b: Section) => b.blockType === 'htmlSection' && new RegExp(`^\\s*<section class="${cls}"`).test(b.html || '')
const isOfferingsHtml = isHtml('services')
const isProcessHtml = isHtml('process')

/** "Line one<br>Line two" → "Line one\nLine two". */
function linesOf($: cheerio.CheerioAPI, el: Sel) {
  if (el.children().not('br').length) fail(`<${el.prop("tagName")?.toLowerCase()}> has markup other than <br>`)
  return (el.html() || '')
    .split(/<br\s*\/?>/i)
    .map((l) => cheerio.load(l, null, false).text().replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}
const text = (el: Sel) => el.text().replace(/\s+/g, ' ').trim()
const isExternal = (url: string) => /^https?:\/\//i.test(url)

const uploaded = new Map<string, number>()
async function upload(src: string): Promise<number> {
  const name = src.replace(/^\/assets\/images\//, '').replace(/\//g, '-')
  if (uploaded.has(name)) return uploaded.get(name)!
  const found = await payload.find({ collection: 'media', where: { filename: { equals: name } }, limit: 1, depth: 0 })
  let id = found.docs[0]?.id as number | undefined
  if (!id) {
    const file = path.join(PUBLIC, src)
    if (!src.startsWith('/') || !fs.existsSync(file)) fail(`image ${src} not found in /public`)
    const data = fs.readFileSync(file)
    const ext = path.extname(name).toLowerCase()
    const mimetype = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg'
    const doc = await payload.create({ collection: 'media', data: { alt: '' }, file: { data, mimetype, name, size: data.length }, context })
    payload.logger.info(`  uploaded ${name}`)
    id = doc.id as number
  }
  uploaded.set(name, id)
  return id
}

async function readOfferings(html: string): Promise<Offerings> {
  const $ = cheerio.load(html, null, false)
  const intro = $('.sec-head .sec-head__p')
  if (intro.length > 1) fail('more than one intro paragraph')
  if (intro.length && intro.attr('style') !== 'width:972px') fail(`intro has style "${intro.attr('style')}"`)
  const items = await Promise.all(
    $('.svc-list > .svc-item')
      .toArray()
      .map(async (el, i) => {
        const $el = $(el)
        if (text($el.find('.svc-item__num')) !== String(i + 1).padStart(2, '0')) fail(`item ${i + 1} has number "${text($el.find('.svc-item__num'))}"`)
        const paragraphs = $el.find('.svc-item__inner > p')
        if (paragraphs.length !== 1) fail(`item ${i + 1} has ${paragraphs.length} paragraphs`)
        const btn = $el.find('.svc-item__inner > a')
        const href = btn.attr('href') || null
        if (btn.length && !btn.hasClass('btn--white')) fail(`item ${i + 1} button class "${btn.attr('class')}"`)
        if (href && (btn.attr('rel') === 'noopener') !== isExternal(href)) fail(`item ${i + 1} button rel "${btn.attr('rel')}" for ${href}`)
        const src = $el.find('.svc-item__img').attr('src') || DEFAULT_ITEM_IMAGE
        return {
          title: text($el.find('.svc-item__head h3')) || fail(`item ${i + 1} has no title`),
          description: textToRichText(text(paragraphs))!,
          buttonLabel: btn.length ? text(btn.find('span').first()) : null,
          buttonLink: href,
          image: src === DEFAULT_ITEM_IMAGE ? null : await upload(src),
        }
      }),
  )
  if (!items.length) fail('no items')
  return { blockType: 'serviceOfferings', heading: linesOf($, $('.sec-head h2')), intro: intro.length ? textToRichText(text(intro)) : null, items }
}

async function readProcess(html: string, notes: string[]): Promise<Process> {
  const $ = cheerio.load(html, null, false)
  const h2 = $('.process__head h2')
  if (h2.children().length) fail('heading has markup')
  const intro = $('.process__head > p')
  if (intro.length > 1) fail('more than one intro paragraph')
  const steps = await Promise.all(
    $('.process__row > .step')
      .toArray()
      .map(async (el, i) => {
        const $el = $(el)
        if (text($el.find('.step__n')) !== String(i + 1)) fail(`step ${i + 1} has number "${text($el.find('.step__n'))}"`)
        if ($el.find('.step__title').hasClass('step__title--fixed') !== i >= 3) notes.push(`step ${i + 1}: title height class differs from the design rule`)
        const src = $el.find('.step__media img').attr('src') || fail(`step ${i + 1} has no image`)
        return {
          title: linesOf($, $el.find('.step__title h3')) || fail(`step ${i + 1} has no title`),
          description: textToRichText(text($el.find('.step__desc')))!,
          image: await upload(src),
        }
      }),
  )
  if (!steps.length) fail('no steps')
  return { blockType: 'serviceProcess', heading: text(h2), intro: intro.length ? textToRichText(linesOf($, intro)) : null, steps }
}

/** Swap the two HTML sections of one layout (published or draft) for the new sections. */
async function convert(layout: Page['layout'], notes: string[]) {
  const out: Section[] = []
  for (const b of layout || []) {
    if (b.blockType === 'htmlSection' && isOfferingsHtml(b)) out.push(await readOfferings(b.html || ''))
    else if (b.blockType === 'htmlSection' && isProcessHtml(b)) out.push(await readProcess(b.html || '', notes))
    else out.push(b)
  }
  return out
}

const pages = (await payload.find({ collection: 'pages', where: { template: { equals: 'service' } }, depth: 0, limit: 500, pagination: false })).docs
const skipped: string[] = []
let done = 0
for (const published of pages) {
  const latest = (await payload.find({ collection: 'pages', where: { id: { equals: published.id } }, depth: 0, limit: 1, draft: true })).docs[0]
  const has = (layout: Page['layout']) => (layout || []).some((b) => isOfferingsHtml(b) || isProcessHtml(b))
  const draft = latest._status === 'draft' && has(latest.layout)
  if (!has(published.layout) && !draft) {
    payload.logger.info(`${published.path}: nothing to convert (already moved?).`)
    continue
  }
  const notes: string[] = []
  try {
    // Read everything first, so a page is either fully converted or left as it was.
    const pubLayout = has(published.layout) ? await convert(published.layout, notes) : null
    const draftLayout = draft ? await convert(latest.layout, []) : null
    if (pubLayout) await payload.update({ collection: 'pages', id: published.id, data: { layout: pubLayout, _status: 'published' }, context })
    if (draftLayout) await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: draftLayout, _status: 'draft' }, context })
    done++
    payload.logger.info(`${published.path}: converted${draft ? ' (draft too)' : ''}.${notes.length ? ' Note: ' + notes.join('; ') : ''}`)
  } catch (err) {
    if (!(err instanceof Shape)) throw err
    skipped.push(`${published.path}: ${err.message}`)
  }
}
payload.logger.info(`Converted ${done} page(s).`)
if (skipped.length) payload.logger.warn(`Skipped (left as HTML):\n  ${skipped.join('\n  ')}`)
process.exit(0)
