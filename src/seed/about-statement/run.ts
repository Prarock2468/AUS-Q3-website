/**
 * Moves "Q3 at a glance" on the About page (/about) from a Custom section (HTML) into the "About us (statement)"
 * section (drawn in the About design there):
 *  1. Reads the statement and the stats from the HTML (section.ab-statement).
 *  2. Replaces the HTML section with the new section, in the same position, in the published page and, when there
 *     is one, in the unpublished draft (which stays a draft).
 * Stat icons are left empty when they are the default award icon. Stops without changing anything if the HTML is not
 * the expected shape. Safe to run more than once: `npm run seed:about-statement`.
 */
import 'dotenv/config'
import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import config from '../../payload.config'
import type { Page } from '../../payload-types'

type Section = NonNullable<Page['layout']>[number]
type About = Extract<Section, { blockType: 'homeAbout' }>

const PAGE = '/about'
const DEFAULT_ICON = '/assets/icons/recognition-default.svg'
const context = { disableRevalidate: true }
const payload = await getPayload({ config })
const fail = (msg: string): never => {
  throw new Error(`"Q3 at a glance" HTML is not the expected shape: ${msg}. Nothing was changed.`)
}

const isStatementHtml = (b: Section) => b.blockType === 'htmlSection' && /class="ab-statement"/.test(b.html || '')

const get = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', where: { path: { equals: PAGE } }, depth: 0, limit: 1, draft })).docs[0]
const published = await get(false)
const latest = await get(true)
if (!published) throw new Error(`${PAGE} not found.`)

const source = (latest.layout || []).find(isStatementHtml) || (published.layout || []).find(isStatementHtml)
if (!source || source.blockType !== 'htmlSection') {
  payload.logger.info(`${PAGE} has no "Q3 at a glance" HTML section (already moved?). Nothing to do.`)
  process.exit(0)
}

const $ = cheerio.load(source.html, null, false)
const statement = $('[data-statement]').text().replace(/\s+/g, ' ').trim()
if (!statement) fail('no statement text')
const other = $('.ab-recstat img').toArray().find((i) => $(i).attr('src') !== DEFAULT_ICON)
if (other) fail(`stat icon ${$(other).attr('src')} is not the default; upload it to Media and adjust this script`)

const block: About = {
  blockType: 'homeAbout',
  statement,
  buttons: [],
  stats: $('.ab-recstat')
    .toArray()
    .map((li) => ({ value: $(li).find('.ab-recstat__n').text().trim(), label: $(li).find('p').not('.ab-recstat__n').first().text().trim(), icon: null })),
}
if (block.stats?.some((s) => !s.value || !s.label)) fail('a stat has no number or label')
payload.logger.info(`Read "Q3 at a glance" (${statement.split(' ').length} words, ${block.stats?.length} stats).`)

const swap = (layout: Page['layout']) => (layout || []).map((b) => (isStatementHtml(b) ? block : b))
if ((published.layout || []).some(isStatementHtml)) {
  await payload.update({ collection: 'pages', id: published.id, data: { layout: swap(published.layout), _status: 'published' }, context })
  payload.logger.info(`Published ${PAGE}: "Q3 at a glance" is now the "About us (statement)" section.`)
}
if (latest._status === 'draft' && (latest.layout || []).some(isStatementHtml)) {
  await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
  payload.logger.info(`Unpublished ${PAGE} draft: same change made; it is still a draft.`)
}
process.exit(0)
