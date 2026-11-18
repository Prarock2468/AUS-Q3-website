/**
 * Moves the home page FAQ into Common Component → "FAQ" (key `faq`):
 *  1. Creates the FAQ entry with a copy of the home page FAQ section (heading, intro, style, questions…), unless
 *     an entry with key `faq` already exists.
 *  2. On the home page, swaps the FAQ section for "Common component (saved) → FAQ", in the same position.
 * The FAQPage structured data still comes out, read from the entry (see buildJsonLd in src/lib/seo.ts).
 * Safe to run more than once: `npm run seed:faq`.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'

const context = { disableRevalidate: true }
const payload = await getPayload({ config })

const { docs: homes } = await payload.find({ collection: 'pages', where: { path: { equals: '/' } }, depth: 0, limit: 1, draft: true })
const home = homes[0]
if (!home) throw new Error('Home page not found.')
const sections = [...(home.layout || [])]
const faqIndex = sections.findIndex((b) => b.blockType === 'faq')

// 1. The FAQ entry.
const { docs: existing } = await payload.find({ collection: 'commonComponent', where: { key: { equals: 'faq' } }, depth: 0, limit: 1 })
let entry = existing[0]
if (entry) {
  payload.logger.info('Common Component "faq" already exists; kept it as it is.')
} else {
  if (faqIndex < 0) throw new Error('Home page has no FAQ section to copy.')
  // Copy the section without its row id (and the questions without theirs), so the entry gets fresh ones.
  const { id: _id, ...faq } = sections[faqIndex] as Extract<(typeof sections)[number], { blockType: 'faq' }>
  const items = (faq.items || []).map(({ id: _itemId, ...item }) => item)
  entry = await payload.create({
    collection: 'commonComponent',
    data: { title: 'FAQ', key: 'faq', layout: [{ ...faq, items }] },
    context,
  })
  payload.logger.info(`Created Common Component "FAQ" with ${items.length} questions.`)
}

// 2. Point the home page at it.
const already = sections.some(
  (b) => b.blockType === 'commonComponentRef' && (typeof b.component === 'object' ? b.component?.id : b.component) === entry.id,
)
if (already) {
  payload.logger.info('Home page already uses the FAQ common component.')
} else if (faqIndex < 0) {
  payload.logger.warn('Home page has no FAQ section; nothing replaced.')
} else {
  sections[faqIndex] = { blockType: 'commonComponentRef', component: entry.id }
  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout: sections, _status: home._status === 'published' ? 'published' : home._status },
    context,
  })
  payload.logger.info('Home page now uses Common component → FAQ (in the same position).')
}
process.exit(0)
