/**
 * Moves the home page "About Q3" from a Custom section (HTML) into the "About us (home page)" section:
 *  1. Reads the HTML (section.statement): the statement words, buttons and stat cards.
 *  2. Replaces the HTML section with the new section, in the same position, in the published home page and, when
 *     there is one, in the unpublished draft too (which stays a draft, so nobody's pending edits get published).
 * Stat icons are left empty when they are the default award icon (the section shows it by default).
 * Stops without changing anything if the HTML is not the expected shape. Safe to run more than once:
 * `npm run seed:home-about`.
 */
import 'dotenv/config'
import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import config from '../../payload.config'
import type { Page } from '../../payload-types'

type Section = NonNullable<Page['layout']>[number]
type HomeAbout = Extract<Section, { blockType: 'homeAbout' }>

const DEFAULT_ICON = '/assets/icons/recognition-default.svg'
const context = { disableRevalidate: true }
const payload = await getPayload({ config })

const isAboutHtml = (b: Section) => b.blockType === 'htmlSection' && /class="statement"/.test(b.html || '')

const get = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', where: { path: { equals: '/' } }, depth: 0, limit: 1, draft })).docs[0]
const published = await get(false)
const latest = await get(true)
if (!published) throw new Error('Home page not found.')

const source = (latest.layout || []).find(isAboutHtml) || (published.layout || []).find(isAboutHtml)
if (!source || source.blockType !== 'htmlSection') {
  payload.logger.info('Home page has no "About Q3" HTML section (already moved?). Nothing to do.')
  process.exit(0)
}

// 1. Read the HTML.
const $ = cheerio.load(source.html)
const sec = $('section.statement')
const fail = (msg: string): never => {
  throw new Error(`"About Q3" HTML is not the expected shape: ${msg}. Nothing was changed.`)
}
const statement = sec.find('[data-statement]').text().replace(/\s+/g, ' ').trim()
if (!statement) fail('no statement text')
const otherIcon = sec.find('.recstat img').toArray().find((img) => $(img).attr('src') !== DEFAULT_ICON)
if (otherIcon) fail(`stat icon ${$(otherIcon).attr('src')} is not the default; upload it to Media and adjust this script`)

const block: HomeAbout = {
  blockType: 'homeAbout',
  statement,
  buttons: sec
    .find('.meta-row a')
    .toArray()
    .map((a) => ({
      label: $(a).text().trim(),
      link: $(a).attr('href') || '',
      style: $(a).hasClass('btn-outline') ? ('outline' as const) : ('primary' as const),
      trackingId: $(a).attr('data-cta') || null,
    })),
  stats: sec
    .find('.recstat')
    .toArray()
    .map((li) => ({
      value: $(li).find('.recstat-num').text().trim(),
      label: $(li).find('.recstat-label').text().trim(),
      icon: null,
    })),
}
if (block.buttons?.some((b) => !b.label || !b.link)) fail('a button has no text or link')
if (block.stats?.some((s) => !s.value || !s.label)) fail('a stat has no number or label')
payload.logger.info(`Read "About Q3" (${statement.split(' ').length} words, ${block.buttons?.length} buttons, ${block.stats?.length} stats).`)

// 2. Swap it in, in the same position.
const swap = (layout: Page['layout']) => (layout || []).map((b) => (isAboutHtml(b) ? block : b))

if ((published.layout || []).some(isAboutHtml)) {
  await payload.update({ collection: 'pages', id: published.id, data: { layout: swap(published.layout), _status: 'published' }, context })
  payload.logger.info('Published home page: "About Q3" is now the "About us (home page)" section.')
}
if (latest._status === 'draft' && (latest.layout || []).some(isAboutHtml)) {
  // Re-save the pending draft on top, with the same swap, so the editor's unpublished changes are kept as a draft.
  await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
  payload.logger.info('Unpublished home page draft: same change made; it is still a draft.')
}
process.exit(0)
